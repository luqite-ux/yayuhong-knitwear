import { sql } from './db';
import { callLLMJson, callLLM, getLLMConfig } from './llm';
import { pick, WRITING_LOCALE, type Locale } from './i18n';
import { startJobRun, finishJobRun, recordJobStats } from './jobs';
import { logAudit } from './audit';
import slugify from 'slugify';
import crypto from 'node:crypto';

const STYLES = ['technical', 'buying_guide', 'application', 'trend'] as const;
type Style = (typeof STYLES)[number];

interface SeoConfig {
  enabled: boolean;
  keyword_seeds: string[];
  target_countries: string[];
  competitor_domains: string[];
  brand_voice: string | null;
  writing_locale: string;
  target_locales: string[];
  monthly_articles: number;
  publish_mode: 'auto' | 'review';
  style_quota: Record<string, number>;
  geo_monthly_budget_usd: number | null;
  indexing_enabled: boolean;
}

async function getSeoConfig(): Promise<SeoConfig | null> {
  const rows = await sql<SeoConfig[]>`select * from seo_config where id = 1`;
  return rows.length > 0 ? rows[0] : null;
}

const STYLE_PROMPTS: Record<Style, string> = {
  technical: 'Write a technically deep article about knitwear manufacturing, covering materials, processes, quality control, and industry standards.',
  buying_guide: 'Write a comprehensive B2B buying guide helping international buyers source knitwear, covering MOQ, sampling, pricing, and supplier evaluation.',
  application: 'Write an article about real-world applications of knitwear products in different markets and scenarios.',
  trend: 'Write an article analyzing current and emerging trends in the knitwear and fast fashion industry.',
};

/**
 * 选题去重：检查关键词是否已有对应文章
 */
async function isTopicUsed(keyword: string, style: string): Promise<boolean> {
  const rows = await sql`
    select 1 from seo_article_drafts
    where slug = ${slugify(keyword + '-' + style, { lower: true, strict: true })}
    union
    select 1 from content_articles
    where slug = ${slugify(keyword + ' ' + style, { lower: true, strict: true })}
    limit 1
  `;
  return rows.length > 0;
}

/**
 * 从关键词库选一个未使用的关键词 + 风格
 */
async function pickTopic(config: SeoConfig): Promise<{ keyword: string; style: Style } | null> {
  const keywords = config.keyword_seeds?.length > 0
    ? config.keyword_seeds
    : (await sql`select keyword from seo_keywords where is_tracked = true order by random() limit 20`).map((r: any) => r.keyword);

  if (keywords.length === 0) return null;

  const quota = config.style_quota || { technical: 1, buying_guide: 1, application: 1, trend: 1 };
  const totalQuota = Object.values(quota).reduce((a, b) => a + (b as number), 0) || 4;

  for (const kw of keywords) {
    for (const style of STYLES) {
      if ((quota[style] || 0) === 0) continue;
      if (!(await isTopicUsed(kw, style))) {
        return { keyword: kw, style };
      }
    }
  }
  return null;
}

interface ArticleDraft {
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  meta_description: string;
  supporting_keywords: string[];
  faq_schema: Record<string, unknown>;
  article_schema: Record<string, unknown>;
  human_review_flags: string[];
}

/**
 * 生成单篇文章草稿
 */
async function generateDraft(
  keyword: string,
  style: Style,
  config: SeoConfig,
): Promise<{ draft: ArticleDraft; promptTokens: number; completionTokens: number; cost: number }> {
  const profile = await sql`select site_name, company_name, intro, brand_voice from site_profile where id = 1`;
  const p = profile[0];
  const siteName = pick(p.site_name as Record<string, string>, config.writing_locale);
  const intro = p.intro ? pick(p.intro as Record<string, string>, config.writing_locale) : '';
  const brandVoice = config.brand_voice || p.brand_voice || 'professional, factual, B2B-focused';

  const products = await sql`select name, slug from content_products where is_active = true order by sort limit 10`;
  const productContext = products.map((pr: any) => `- ${pick(pr.name as Record<string, string>, config.writing_locale)}`).join('\n');

  const targetLocales = config.target_locales?.length > 0 ? config.target_locales : ['en', 'ru', 'zh'];

  const systemPrompt = `You are an SEO content writer for ${siteName}, a knitwear manufacturer in Chenghai, China.
Company: ${p.company_name}
About: ${intro}
Brand voice: ${brandVoice}
Target languages: ${targetLocales.join(', ')}

Rules:
- Write in ${config.writing_locale} (primary language).
- Base all claims on real facts: 20 years experience, 30,000 pcs/day capacity, 50 pcs MOQ, 7-day delivery, OEM/ODM.
- Do NOT make quality guarantees, warranties, or quality assurance promises. Use neutral factual statements instead.
- If you cannot verify a claim, omit it and add the concern to human_review_flags.
- Content must be original and helpful.
- ${STYLE_PROMPTS[style]}
- Keyword to target: "${keyword}"

Available products for context:
${productContext}

Return ONLY a JSON object (no markdown, no code blocks) with these exact keys:
{
  "title": "...",
  "slug": "...",
  "excerpt": "...",
  "content_html": "<h2>...</h2><p>...</p>...",
  "meta_description": "...",
  "supporting_keywords": ["...", "..."],
  "faq_schema": {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[...]},
  "article_schema": {"author":{"@type":"Organization","name":"${siteName}"},"publisher":{"@type":"Organization","name":"${siteName}"}},
  "human_review_flags": []
}`;

  const prompt = `Write an article about "${keyword}" in the "${style}" style.`;

  const result = await callLLMJson<ArticleDraft>(prompt, systemPrompt);

  // 确保数据完整
  const draft: ArticleDraft = {
    title: result.data.title || keyword,
    slug: result.data.slug || slugify(result.data.title || keyword, { lower: true, strict: true }),
    excerpt: result.data.excerpt || '',
    content_html: result.data.content_html || '',
    meta_description: result.data.meta_description || result.data.excerpt || '',
    supporting_keywords: Array.isArray(result.data.supporting_keywords) ? result.data.supporting_keywords : [],
    faq_schema: result.data.faq_schema || { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [] },
    article_schema: result.data.article_schema || {},
    human_review_flags: Array.isArray(result.data.human_review_flags) ? result.data.human_review_flags : [],
  };

  // 估算费用（粗糙估算，按 GPT-4o 定价）
  const cost = (result.promptTokens * 2.5 + result.completionTokens * 10) / 1_000_000;

  return { draft, promptTokens: result.promptTokens, completionTokens: result.completionTokens, cost };
}

/**
 * 为草稿选择封面（真实产品图）
 */
async function pickCover(draft: ArticleDraft): Promise<{ coverUrl: string | null; productId: string | null; missing: boolean }> {
  const products = await sql`select id, name, cover_url from content_products where is_active = true and cover_url is not null`;
  if (products.length === 0) {
    return { coverUrl: null, productId: null, missing: true };
  }

  // 简单匹配：根据标题关键词匹配产品
  const titleLower = draft.title.toLowerCase();
  for (const p of products) {
    const name = pick(p.name as Record<string, string>, 'en').toLowerCase();
    if (titleLower.includes(name) || name.includes(titleLower.split(' ')[0])) {
      return { coverUrl: p.cover_url, productId: p.id, missing: false };
    }
  }

  // 无匹配，用第一个产品图
  return { coverUrl: products[0].cover_url, productId: products[0].id, missing: false };
}

/**
 * 生成文章（手动或自动）
 */
export async function runGeneration(
  trigger: 'manual' | 'cron' | 'bootstrap',
  triggeredBy: string,
  count?: number,
): Promise<{ runId: string; success: number; failed: number; cost: number }> {
  const config = await getSeoConfig();
  if (!config || !config.enabled) {
    throw new Error('SEO 尚未启用，请先完成接入向导');
  }

  const llm = await getLLMConfig();
  if (!llm) throw new Error('LLM 未配置');

  const runId = await startJobRun('seo_generate', trigger, triggeredBy);
  let success = 0;
  let failed = 0;
  let totalCost = 0;

  const targetCount = count || config.monthly_articles || 4;
  const locale = config.writing_locale as Locale || WRITING_LOCALE;

  for (let i = 0; i < targetCount; i++) {
    try {
      const topic = await pickTopic(config);
      if (!topic) {
        await logAudit(triggeredBy, 'seo_generate_skip', 'no_topic', { index: i });
        break;
      }

      const { draft, promptTokens, completionTokens, cost } = await generateDraft(topic.keyword, topic.style, config);
      const cover = await pickCover(draft);

      const promptHash = crypto.createHash('sha256').update(JSON.stringify({ keyword: topic.keyword, style: topic.style })).digest('hex');

      // 写入草稿
      const draftRows = await sql`
        insert into seo_article_drafts (
          run_id, style, title, excerpt, content_html, meta_description,
          slug, supporting_keywords, faq_schema, article_schema,
          human_review_flags, cover_url, cover_product_id, cover_missing, locale, status
        ) values (
          ${runId}, ${topic.style},
          ${JSON.stringify({ [locale]: draft.title })}::jsonb,
          ${JSON.stringify({ [locale]: draft.excerpt })}::jsonb,
          ${JSON.stringify({ [locale]: draft.content_html })}::jsonb,
          ${JSON.stringify({ [locale]: draft.meta_description })}::jsonb,
          ${draft.slug},
          ${draft.supporting_keywords},
          ${JSON.stringify(draft.faq_schema)}::jsonb,
          ${JSON.stringify(draft.article_schema)}::jsonb,
          ${JSON.stringify(draft.human_review_flags)}::jsonb,
          ${cover.coverUrl},
          ${cover.productId},
          ${cover.missing},
          ${locale},
          'pending_review'
        )
        returning id
      `;

      // 记录生成运行详情
      await sql`
        insert into seo_generation_runs (id, trigger, triggered_by, model, prompt_hash,
          requested, succeeded, failed, prompt_tokens, completion_tokens, cost_usd,
          started_at, finished_at)
        values (
          ${runId}, ${trigger}, ${triggeredBy}, ${llm.model}, ${promptHash},
          1, 1, 0, ${promptTokens}, ${completionTokens}, ${cost},
          now(), now()
        )
        on conflict (id) do update set
          succeeded = seo_generation_runs.succeeded + 1,
          prompt_tokens = seo_generation_runs.prompt_tokens + ${promptTokens},
          completion_tokens = seo_generation_runs.completion_tokens + ${completionTokens},
          cost_usd = seo_generation_runs.cost_usd + ${cost},
          finished_at = now()
      `;

      totalCost += cost;
      success++;

      // 如果自动模式 + 无待审标记 + 有封面 → 安排发布
      if (config.publish_mode === 'auto' && draft.human_review_flags.length === 0 && !cover.missing) {
        await sql`
          update seo_article_drafts
          set status = 'scheduled', scheduled_at = ${new Date(Date.now() + 5 * 60 * 1000)}
          where id = ${draftRows[0].id}
        `;
      }
    } catch (err: any) {
      failed++;
      await logAudit(triggeredBy, 'seo_generate_error', `article_${i}`, { error: err.message });
    }
  }

  await recordJobStats(runId, success, failed, totalCost);
  await finishJobRun(runId, success > 0 ? (failed > 0 ? 'partial' : 'success') : 'failed', { success, failed, cost: totalCost });
  await logAudit(triggeredBy, 'seo_generate_done', runId, { success, failed, cost: totalCost });

  return { runId, success, failed, cost: totalCost };
}

/**
 * 发布到期的草稿
 */
export async function publishDueDrafts(): Promise<{ published: number }> {
  const due = await sql`
    select d.id, d.slug, d.title, d.excerpt, d.content_html, d.meta_description,
           d.supporting_keywords, d.faq_schema, d.article_schema, d.cover_url,
           d.cover_product_id, d.locale, d.run_id
    from seo_article_drafts d
    where d.status = 'scheduled' and d.scheduled_at <= now()
    limit 10
  `;

  let published = 0;
  for (const d of due) {
    try {
      // 检查 slug 冲突
      const existing = await sql`select 1 from content_articles where slug = ${d.slug} limit 1`;
      if (existing.length > 0) {
        await sql`update seo_article_drafts set status = 'rejected' where id = ${d.id}`;
        continue;
      }

      const locale = d.locale || 'en';
      const articleRows = await sql`
        insert into content_articles (
          title, excerpt, content_html, meta_description, slug,
          cover_url, supporting_keywords, faq_schema, article_schema,
          locale, status, published_at, source, draft_id
        ) values (
          ${JSON.stringify(d.title)}::jsonb,
          ${JSON.stringify(d.excerpt)}::jsonb,
          ${JSON.stringify(d.content_html)}::jsonb,
          ${JSON.stringify(d.meta_description)}::jsonb,
          ${d.slug},
          ${d.cover_url},
          ${d.supporting_keywords},
          ${JSON.stringify(d.faq_schema)}::jsonb,
          ${JSON.stringify(d.article_schema)}::jsonb,
          ${locale},
          'published',
          now(),
          'seo_pipeline',
          ${d.id}
        )
        returning id
      `;

      await sql`
        update seo_article_drafts
        set status = 'published', published_at = now(), article_id = ${articleRows[0].id}
        where id = ${d.id}
      `;

      // 加入关键词库
      for (const kw of (d.supporting_keywords || [])) {
        await sql`
          insert into seo_keywords (keyword, locale, source) values (${kw}, ${locale}, 'llm')
          on conflict (keyword, country) do nothing
        `;
      }

      published++;
    } catch (err: any) {
      await logAudit('cron', 'publish_error', d.id, { error: err.message });
    }
  }

  return { published };
}

/**
 * 一键启动（bootstrap）
 */
export async function runBootstrap(triggeredBy: string): Promise<{ ok: boolean; details: Record<string, unknown> }> {
  const config = await getSeoConfig();
  if (!config) throw new Error('SEO 配置不存在');

  const runId = await startJobRun('bootstrap', 'manual', triggeredBy);
  const details: Record<string, unknown> = {};

  try {
    const profile = await sql`select * from site_profile where id = 1`;
    const p = profile[0];
    const siteName = pick(p.site_name as Record<string, string>, 'en');
    const intro = p.intro ? pick(p.intro as Record<string, string>, 'en') : '';

    const products = await sql`select name, slug from content_products where is_active = true order by sort limit 20`;
    const productContext = products.map((pr: any) => `- ${pick(pr.name as Record<string, string>, 'en')}`).join('\n');

    // LLM 生成关键词种子、目标国家、竞品域名
    const bootstrapPrompt = `You are configuring SEO for ${siteName}, a knitwear manufacturer.
Company: ${p.company_name}
About: ${intro}
Products:
${productContext}

Based on this information, suggest:
1. 15-40 SEO keyword seeds (mix of branded and non-branded, covering product types, services, and industry terms)
2. Target countries (focus on Russia as primary market, plus other major B2B markets)
3. Up to 5 real competitor domains in the knitwear/sweater manufacturing space
4. Brand voice description (2-3 sentences)

Return ONLY a JSON object:
{
  "keywords": ["...", "..."],
  "target_countries": ["RU", "US", "DE", ...],
  "competitor_domains": ["example.com", ...],
  "brand_voice": "..."
}`;

    const llmResult = await callLLMJson(bootstrapPrompt, 'You are an SEO strategist for a B2B manufacturer.');

    // 写入 SEO 配置
    const keywords = JSON.stringify(llmResult.data.keywords || []);
    const targetCountries = JSON.stringify(llmResult.data.target_countries || ['RU', 'US', 'DE']);
    const competitorDomains = JSON.stringify(llmResult.data.competitor_domains || []);
    const brandVoice = (llmResult.data.brand_voice as string) || null;
    await sql`
      update seo_config set
        keyword_seeds = ${keywords}::jsonb,
        target_countries = ${targetCountries}::jsonb,
        competitor_domains = ${competitorDomains}::jsonb,
        brand_voice = ${brandVoice},
        updated_at = now()
      where id = 1
    `;

    details.keywords = ((llmResult.data.keywords as any[]) || []).length;
    details.targetCountries = llmResult.data.target_countries || [];
    details.competitors = ((llmResult.data.competitor_domains as any[]) || []).length;

    // 生成首批文章
    const genResult = await runGeneration('bootstrap', triggeredBy, config.monthly_articles || 4);
    details.generation = genResult;

    await recordJobStats(runId, 1, genResult.failed, genResult.cost);
    await finishJobRun(runId, 'success', details);
    await logAudit(triggeredBy, 'bootstrap_complete', 'seo_config', details);

    return { ok: true, details };
  } catch (err: any) {
    await finishJobRun(runId, 'failed', undefined, err.message);
    await logAudit(triggeredBy, 'bootstrap_error', 'seo_config', { error: err.message });
    return { ok: false, details: { error: err.message } };
  }
}

/**
 * 站点自动优化（每天扫 sitemap）
 */
export async function runSiteScan(triggeredBy: string): Promise<void> {
  const runId = await startJobRun('site_scan', 'cron', triggeredBy);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com';
  let success = 0;
  let failed = 0;

  try {
    // 抓取 sitemap
    const res = await fetch(`${baseUrl}/sitemap.xml`, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`);
    const xml = await res.text();

    // 提取 URL
    const urls = xml.match(/<loc>(.*?)<\/loc>/g)?.map((m) => m.replace(/<\/?loc>/g, '')) || [];

    for (const url of urls) {
      try {
        // 检查页面
        const pageRes = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!pageRes.ok) {
          await sql`
            insert into seo_optimization_logs (url, kind, auto, status, error)
            values (${url}, 'suggestion', false, 'todo', ${`HTTP ${pageRes.status}`})
            on conflict do nothing
          `;
          failed++;
          continue;
        }

        const html = await pageRes.text();
        // 简单检查：title、meta description、canonical
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const metaMatch = html.match(/<meta\s+name="description"\s+content="(.*?)"/i);
        const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="(.*?)"/i);

        const issues: string[] = [];
        if (!titleMatch || titleMatch[1].length < 10) issues.push('title');
        if (!metaMatch || metaMatch[1].length < 20) issues.push('meta');
        if (!canonicalMatch) issues.push('canonical');

        if (issues.length > 0) {
          await sql`
            insert into seo_optimization_logs (url, kind, auto, status, before)
            values (${url}, ${issues.join(',')}, false, 'todo', ${JSON.stringify({ title: titleMatch?.[1], meta: metaMatch?.[1] })}::jsonb)
            on conflict do nothing
          `;
        }

        success++;
      } catch {
        failed++;
      }
    }

    // 重新生成 llms.txt（通过调用路由即可自动刷新）

    await recordJobStats(runId, success, failed, 0);
    await finishJobRun(runId, failed > 0 ? 'partial' : 'success', { scanned: urls.length, issues: success });
    await logAudit(triggeredBy, 'site_scan_done', runId, { scanned: urls.length, success, failed });
  } catch (err: any) {
    await finishJobRun(runId, 'failed', undefined, err.message);
  }
}
