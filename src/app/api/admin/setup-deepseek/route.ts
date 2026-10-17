import { NextRequest, NextResponse } from 'next/server';
import { setSecret, updateSecretStatus } from '@/lib/secrets';
import { testLLMConnection, getLLMConfig } from '@/lib/llm';
import { runBootstrap, runGeneration, getSeoConfig, pickTopic, generateDraft, publishDueDrafts } from '@/lib/seo-pipeline';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * 临时维护路由：将 SEO LLM 切换为 DeepSeek 并验证生成链路
 * 认证：Authorization: Bearer <SETUP_TOKEN>
 * 用完即删（连同 SETUP_TOKEN 环境变量）
 */
async function checkAuth(req: NextRequest): Promise<boolean> {
  const token = process.env.SETUP_TOKEN;
  const authHeader = req.headers.get('authorization');
  return !!token && authHeader === `Bearer ${token}`;
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const action = body.action as string;

  try {
    if (action === 'set-llm') {
      const baseUrl = (body.baseUrl as string) || 'https://api.deepseek.com/v1';
      const apiKey = body.apiKey as string;
      const model = (body.model as string) || 'deepseek-chat';
      if (!apiKey) {
        return NextResponse.json({ error: '缺少 apiKey' }, { status: 400 });
      }

      const cfg = JSON.stringify({ baseUrl, apiKey, model });
      await setSecret(
        'llm',
        cfg,
        JSON.stringify({ baseUrl, model }),
        { baseUrl, model },
      );

      const test = await testLLMConnection();
      await updateSecretStatus('llm', test.ok ? 'connected' : 'failed', test.ok ? null : test.error ?? null);

      return NextResponse.json({ ok: true, action, baseUrl, model, test });
    }

    if (action === 'status') {
      const llm = await getLLMConfig();
      return NextResponse.json({
        llm: llm
          ? { configured: true, baseUrl: llm.baseUrl, model: llm.model, apiKeyTail: llm.apiKey?.slice(-4) }
          : { configured: false },
      });
    }

    if (action === 'diag') {
      const { sql } = await import('@/lib/db');
      const cfg = await getSeoConfig();
      const topic = cfg ? await pickTopic(cfg) : null;
      const drafts = await sql`select count(*)::int as n from seo_article_drafts`;
      const articles = await sql`select count(*)::int as n from content_articles`;
      const genErrors = await sql`
        select action, target, detail, created_at from audit_logs
        where action like 'seo_generate%' order by created_at desc limit 3
      `;
      return NextResponse.json({
        keywordSeedsType: Array.isArray(cfg?.keyword_seeds) ? 'array' : typeof cfg?.keyword_seeds,
        keywordSeedsLen: (cfg?.keyword_seeds as unknown[] | undefined)?.length,
        keywordSeedsSample: (cfg?.keyword_seeds as unknown[] | undefined)?.slice(0, 3),
        styleQuota: cfg?.style_quota,
        styleQuotaType: typeof cfg?.style_quota,
        pickedTopic: topic,
        drafts: drafts[0].n,
        articles: articles[0].n,
        genErrors,
      });
    }

    if (action === 'draft-test') {
      const cfg = await getSeoConfig();
      if (!cfg) return NextResponse.json({ error: 'no seo config' }, { status: 500 });
      const topic = await pickTopic(cfg);
      if (!topic) return NextResponse.json({ error: 'no topic' }, { status: 500 });
      try {
        const r = await generateDraft(topic.keyword, topic.style as any, cfg);
        return NextResponse.json({
          ok: true,
          topic,
          title: r.draft.title,
          slug: r.draft.slug,
          contentLen: r.draft.content_html?.length,
          supporting: r.draft.supporting_keywords?.length,
          flags: r.draft.human_review_flags,
          promptTokens: r.promptTokens,
          completionTokens: r.completionTokens,
        });
      } catch (e: any) {
        return NextResponse.json({ ok: false, topic, error: e.message?.slice(0, 1500) }, { status: 500 });
      }
    }

    if (action === 'bootstrap') {
      const result = await runBootstrap('deepseek-setup');
      return NextResponse.json({ ok: result.ok, result });
    }

    if (action === 'repair-publish') {
      const { sql } = await import('@/lib/db');
      // 把流水线已发布的文章退回定时队列并删除，修复早期双重 JSON 编码的数据
      const reset = await sql`
        update seo_article_drafts
        set status = 'scheduled', scheduled_at = now(), article_id = null, published_at = null
        where id in (
          select draft_id from content_articles
          where source = 'seo_pipeline' and draft_id is not null
        )
        returning id
      `;
      const del = await sql`
        delete from content_articles where source = 'seo_pipeline'
      `;
      return NextResponse.json({ ok: true, reset: reset.count, deleted: del.count });
    }

    if (action === 'publish-now') {
      const result = await publishDueDrafts();
      return NextResponse.json({ ok: true, result });
    }

    if (action === 'generate') {
      const count = Math.min(Number(body.count) || 1, 5);
      const result = await runGeneration('manual', 'deepseek-setup', count);
      return NextResponse.json({ ok: true, result });
    }

    return NextResponse.json({ error: '未知 action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
