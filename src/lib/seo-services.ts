import { sql } from './db';
import { getSearchConsoleClient, getGa4PropertyId, getGa4MeasurementId, getGoogleAccessToken, enableGoogleService } from './google';
import { startJobRun, finishJobRun, recordJobStats } from './jobs';
import { logAudit } from './audit';
import { uploadToR2 } from './r2';
import { getSecret } from './secrets';
import { pick } from './i18n';
import { submitIndexNow } from './indexnow';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com';

/**
 * 自动向 GSC 提交 sitemap（幂等：7 天内不重复提交）
 */
export async function ensureSitemapSubmitted(
  property: string,
): Promise<{ submitted: boolean; status: string; error?: string }> {
  const sitemapUrl = `${SITE_URL.replace(/\/$/, '')}/sitemap.xml`;

  const props = await sql`
    select status, sitemap_submitted_at from seo_gsc_properties where property = ${property} limit 1
  `;
  const prop = props[0] as { status?: string; sitemap_submitted_at?: string | null } | undefined;
  if (!prop || prop.status !== 'verified') return { submitted: false, status: 'not_verified' };

  if (prop.sitemap_submitted_at) {
    const age = Date.now() - new Date(prop.sitemap_submitted_at).getTime();
    if (age < 7 * 24 * 60 * 60 * 1000) return { submitted: false, status: 'already_submitted' };
  }

  const token = await getGoogleAccessToken();
  const endpoint =
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}` +
    `/sitemaps/${encodeURIComponent(sitemapUrl)}`;

  const res = await fetch(endpoint, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(30000),
  });
  const body = await res.text().catch(() => '');

  if (!res.ok) {
    const error = `HTTP ${res.status}: ${body.slice(0, 300)}`;
    await sql`
      insert into seo_sitemap_submissions (sitemap_url, status, response)
      values (${sitemapUrl}, 'failed', ${error})
    `;
    await sql`
      update seo_gsc_properties set last_error = ${error}, updated_at = now() where property = ${property}
    `;
    return { submitted: false, status: 'failed', error };
  }

  await sql`
    insert into seo_sitemap_submissions (sitemap_url, status, response)
    values (${sitemapUrl}, 'submitted', ${body.slice(0, 500) || 'OK'})
  `;
  await sql`
    update seo_gsc_properties
    set sitemap_submitted_at = now(), last_error = null, updated_at = now()
    where property = ${property}
  `;
  return { submitted: true, status: 'submitted' };
}

/**
 * GSC 同步：sitemap 自动提交 + 过去 3 天的搜索分析数据
 */
export async function syncGsc(triggeredBy: string): Promise<void> {
  const runId = await startJobRun('gsc_sync', 'cron', triggeredBy);
  let success = 0;
  let failed = 0;

  try {
    const webmasters = await getSearchConsoleClient();
    if (!webmasters) {
      await finishJobRun(runId, 'skipped', { reason: 'google_not_configured' });
      return;
    }

    const property = `sc-domain:${new URL(SITE_URL).hostname}`;

    // === 1. 自动提交 sitemap（先做，避免搜索数据为空时提前抛错阻断） ===
    let sitemapStatus = 'skipped';
    try {
      const sitemapResult = await ensureSitemapSubmitted(property);
      sitemapStatus = sitemapResult.status;
    } catch (err: any) {
      sitemapStatus = `error: ${err.message || String(err)}`;
      console.warn('[syncGsc] sitemap 提交失败但继续同步数据:', err?.message);
    }

    const endDate = new Date();
    const startDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const res: any = await webmasters.searchanalytics.query({
      siteUrl: property,
      requestBody: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['date', 'query'],
        rowLimit: 1000,
      },
    });

    const rows = res.data?.rows || [];
    for (const row of rows) {
      const [date, query] = row.keys || [];
      if (!date || !query) continue;

      // 写入站点级日指标（聚合）
      await sql`
        insert into seo_daily_metrics (date, impressions, clicks, ctr, avg_position)
        values (
          ${date},
          ${Number(row.impressions) || 0},
          ${Number(row.clicks) || 0},
          ${Number(row.ctr) || 0},
          ${Number(row.position) || 0}
        )
        on conflict (date) do update set
          impressions = excluded.impressions,
          clicks = excluded.clicks,
          ctr = excluded.ctr,
          avg_position = excluded.avg_position
      `;

      // 关键词排名
      const kwRows = await sql`select id from seo_keywords where keyword = ${query} limit 1`;
      let kwId: string;
      if (kwRows.length > 0) {
        kwId = kwRows[0].id;
        await sql`update seo_keywords set is_tracked = true where id = ${kwId}`;
      } else {
        const inserted = await sql`
          insert into seo_keywords (keyword, locale, source, is_tracked)
          values (${query}, 'en', 'gsc', true)
          on conflict (keyword, country) do nothing
          returning id
        `;
        if (inserted.length > 0) kwId = inserted[0].id;
        else continue;
      }

      await sql`
        insert into seo_keyword_rankings (keyword_id, date, impressions, clicks, ctr, best_url)
        values (${kwId}, ${date}, ${Number(row.impressions) || 0}, ${Number(row.clicks) || 0},
                ${Number(row.ctr) || 0}, ${row.keys?.[2] || null})
        on conflict (keyword_id, date) do update set
          impressions = excluded.impressions, clicks = excluded.clicks,
          ctr = excluded.ctr, best_url = excluded.best_url
      `;
      success++;
    }

    await sql`update seo_gsc_properties set last_sync_at = now() where property = ${property}`;
    await recordJobStats(runId, success, failed, 0);
    await finishJobRun(runId, 'success', { synced: success, sitemap: sitemapStatus });
  } catch (err: any) {
    await sql`update seo_gsc_properties set last_error = ${err.message} where property = ${`sc-domain:${new URL(SITE_URL).hostname}`}`;
    await finishJobRun(runId, 'failed', undefined, err.message);
  }
}

/**
 * GA4 同步：昨天的访客/浏览量
 */
export async function syncGa4(triggeredBy: string): Promise<void> {
  const runId = await startJobRun('ga4_sync', 'cron', triggeredBy);

  try {
    const { getAnalyticsDataClient } = await import('./google');
    const client = await getAnalyticsDataClient();
    const propertyId = await getGa4PropertyId();
    if (!client || !propertyId) {
      await finishJobRun(runId, 'skipped', { reason: 'ga4_not_configured' });
      return;
    }

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dateStr = yesterday.toISOString().split('T')[0];

    const res: any = await client.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: dateStr, endDate: dateStr }],
        dimensions: [
          { name: 'country' },
          { name: 'pagePath' },
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
        ],
      },
    });

    const rows = res.rows || res.data?.rows || [];
    let count = 0;
    for (const row of rows) {
      const country = row.dimensionValues?.[0]?.value || '';
      const pagePath = row.dimensionValues?.[1]?.value || '';
      const users = Number(row.metricValues?.[0]?.value || 0);
      const pageviews = Number(row.metricValues?.[1]?.value || 0);

      await sql`
        insert into ga4_daily_metrics (date, country, page_path, users, pageviews)
        values (${dateStr}, ${country}, ${pagePath}, ${users}, ${pageviews})
        on conflict (date, country, page_path) do update set
          users = excluded.users, pageviews = excluded.pageviews
      `;
      count++;
    }

    await recordJobStats(runId, count, 0, 0);
    await finishJobRun(runId, 'success', { synced: count });
  } catch (err: any) {
    await finishJobRun(runId, 'failed', undefined, err.message);
  }
}

/**
 * 收录管理：sitemap 抓取 + URL Inspection + Indexing API
 * 自修复：开头先确保 Indexing API 已启用
 */
export async function runIndexing(triggeredBy: string): Promise<void> {
  const runId = await startJobRun('indexing', 'cron', triggeredBy);
  let success = 0;
  let failed = 0;

  try {
    // === 自修复：确保 Indexing API 已启用（被禁用了就自动重开） ===
    try {
      const { enabled } = await enableGoogleService('indexing.googleapis.com');
      if (!enabled) {
        console.error('[runIndexing] Indexing API 无法启用，跳过');
      }
    } catch (err: any) {
      console.warn('[runIndexing] enableGoogleService 调用失败但继续尝试:', err?.message);
    }

    // === 1. 抓取 sitemap 获取 URL ===
    const res = await fetch(`${SITE_URL}/sitemap.xml`, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`);
    const xml = await res.text();
    const urls = xml.match(/<loc>(.*?)<\/loc>/g)?.map((m) => m.replace(/<\/?loc>/g, '')) || [];

    // === 2. 更新 URL 表 ===
    for (const url of urls) {
      const urlType = url.includes('/products') ? 'product' : url.includes('/articles') ? 'article' : url.endsWith('/sitemap.xml') ? 'other' : 'home';
      await sql`
        insert into seo_indexed_urls (url, url_type, in_sitemap)
        values (${url}, ${urlType}, true)
        on conflict (url) do update set in_sitemap = true
      `;
    }

    // === 2.5 IndexNow 推送（Bing / Yandex 秒级收录，单次最多 500 条） ===
    let indexNowResult: { ok: boolean; submitted: number; error?: string } = { ok: false, submitted: 0 };
    try {
      indexNowResult = await submitIndexNow(urls);
    } catch (err: any) {
      indexNowResult = { ok: false, submitted: 0, error: err?.message || String(err) };
      console.warn('[runIndexing] IndexNow 推送失败但继续:', err?.message);
    }

    // === 3. Indexing API 提交（先用，避免 URL Inspection 太慢占了配额） ===
    const { getIndexingClient } = await import('./google');
    const indexingClient = await getIndexingClient();

    // 先清掉上次 cron 留下的"not been used"错误（API 已启用后需要重试）
    await sql`
      update seo_indexed_urls
      set last_index_request_at = null, request_count = 0, last_error = null
      where last_error like '%not been used%' or last_error like '%is disabled%'
    `;

    if (indexingClient) {
      const toSubmit = await sql`
        select url from seo_indexed_urls
        where in_sitemap = true
          and coalesce(request_count, 0) < 50
          and (last_index_request_at is null or last_index_request_at < now() - interval '24 hours')
        limit 10
      `;

      for (const { url } of toSubmit) {
        try {
          await indexingClient.urlNotifications.publish({
            requestBody: { url, type: 'URL_UPDATED' },
          });
          await sql`
            update seo_indexed_urls set
              last_index_request_at = now(),
              request_count = coalesce(request_count, 0) + 1,
              last_error = null
            where url = ${url}
          `;
          success++;
        } catch (err: any) {
          await sql`
            update seo_indexed_urls set last_error = ${err.message || String(err)} where url = ${url}
          `;
          failed++;
        }
      }

      // === 4. URL Inspection（独立 REST API，用 webmasters scope token） ===
      const toInspect = await sql`
        select url from seo_indexed_urls
        where last_inspected_at is null and url_type != 'other'
        order by url limit 10
      `;

      if (toInspect.length > 0) {
        const token = await getGoogleAccessToken();
        const domain = new URL(SITE_URL).hostname;

        for (const { url } of toInspect) {
          try {
            const inspectRes = await fetch(
              `https://searchconsole.googleapis.com/v1/urlInspection/index:inspect`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  inspectionUrl: url,
                  siteUrl: `sc-domain:${domain}`,
                }),
                signal: AbortSignal.timeout(30000),
              },
            );

            if (!inspectRes.ok) {
              const body = await inspectRes.text().catch(() => '');
              throw new Error(`HTTP ${inspectRes.status}: ${body.slice(0, 200)}`);
            }

            const data: any = await inspectRes.json();
            const coverageState = data.inspectionResult?.indexStatusResult?.coverageState || null;
            const verdict = data.inspectionResult?.indexStatusResult?.verdict || null;

            await sql`
              update seo_indexed_urls set
                inspection_status = ${verdict || coverageState || 'UNKNOWN'},
                coverage_state = ${coverageState},
                last_inspected_at = now()
              where url = ${url}
            `;
            success++;
          } catch (err: any) {
            await sql`
              update seo_indexed_urls set
                last_error = ${err.message || String(err)},
                last_inspected_at = now()
              where url = ${url}
            `;
            failed++;
          }
        }
      }
    }

    await recordJobStats(runId, success, failed, 0);
    await finishJobRun(runId, failed > 0 ? 'partial' : 'success', {
      success,
      failed,
      indexnow: indexNowResult,
    });
  } catch (err: any) {
    await finishJobRun(runId, 'failed', undefined, err.message);
  }
}

/**
 * GEO 监测
 */

/** 按产品词生成 AI 引擎提问的模板 */
const GEO_QUERY_TEMPLATES: Array<(product: string) => string> = [
  (p) => `best ${p} manufacturer in China`,
  (p) => `top ${p} suppliers for wholesale orders`,
  (p) => `which factory makes the best custom ${p}`,
  (p) => `${p} manufacturer with low MOQ and fast sampling`,
  (p) => `where to buy ${p} in bulk from a verified factory`,
];

/** GEO 问题总量上限（避免每日成本失控） */
const GEO_MAX_TOTAL_QUERIES = 40;
/** 每轮最多检查的问题数（轮换取样） */
const GEO_QUERIES_PER_RUN = 10;

/**
 * 自动创建 GEO 项目 + 按产品词生成监测问题（幂等，可重复调用）
 */
export async function ensureGeoSetup(): Promise<{ projectId: string; createdQueries: number; totalQueries: number }> {
  const host = new URL(SITE_URL).hostname;

  let project = (
    await sql`select id, brand_name, domain from geo_projects where domain = ${host} order by created_at limit 1`
  )[0] as { id: string; brand_name: string; domain: string } | undefined;

  if (!project) {
    const profile = await sql`select company_name from site_profile order by created_at limit 1`;
    const brandName = (profile[0]?.company_name as string) || 'Yayuhong Knitwear';
    project = (
      await sql`
        insert into geo_projects (brand_name, domain, engines, monthly_budget_usd, enabled)
        values (${brandName}, ${host}, ${['openai']}::text[], ${10}, true)
        returning id, brand_name, domain
      `
    )[0] as { id: string; brand_name: string; domain: string };
  }

  const existing = await sql`select question from geo_queries where project_id = ${project.id}`;
  const seen = new Set(existing.map((r: any) => String(r.question).toLowerCase()));

  // 从在用产品提取产品词（按名称去重）
  const products = await sql`select name from content_products where is_active = true order by sort, created_at`;
  const productWords: string[] = [];
  for (const p of products) {
    const name = pick(p.name as Record<string, string>, 'en').trim();
    if (name && !productWords.includes(name)) productWords.push(name);
  }

  const candidates: string[] = productWords.map((word, i) =>
    GEO_QUERY_TEMPLATES[i % GEO_QUERY_TEMPLATES.length](word),
  );
  candidates.push(
    `${project.brand_name} knitwear factory review`,
    `is ${host} a reliable knitwear supplier`,
    `best OEM knitwear manufacturer in China with low MOQ`,
    `custom sweater manufacturer for small brands`,
  );

  let total = existing.length;
  let created = 0;
  for (const question of candidates) {
    if (total >= GEO_MAX_TOTAL_QUERIES) break;
    const key = question.toLowerCase();
    if (seen.has(key)) continue;
    await sql`
      insert into geo_queries (project_id, question, enabled)
      select ${project.id}, ${question}, true
      where not exists (
        select 1 from geo_queries where project_id = ${project.id} and lower(question) = ${key}
      )
    `;
    seen.add(key);
    total++;
    created++;
  }

  return { projectId: project.id, createdQueries: created, totalQueries: total };
}

export async function runGeoMonitor(triggeredBy: string): Promise<void> {
  const runId = await startJobRun('geo_monitor', 'cron', triggeredBy);
  let success = 0;
  let failed = 0;
  let totalCost = 0;

  try {
    // === 自动建项目 + 按产品词生成问题 ===
    const setup = await ensureGeoSetup();

    const projects = await sql`select id, brand_name, domain from geo_projects where enabled = true`;

    // === 引擎配置：优先 geo_engine，缺失时复用已配置的 LLM（全自动，无需额外密钥） ===
    let geoCfg: { engine: string; apiKey?: string } = { engine: 'openai' };
    const geoRaw = await getSecret('geo_engine');
    if (geoRaw) {
      try {
        geoCfg = { ...geoCfg, ...(JSON.parse(geoRaw) as Record<string, string>) };
      } catch {
        geoCfg = { engine: 'openai' };
      }
    }

    for (const project of projects) {
      const queries = await sql`
        select id, question from geo_queries
        where project_id = ${project.id} and enabled = true
        order by random() limit ${GEO_QUERIES_PER_RUN}
      `;
      if (queries.length === 0) continue;

      const runRows = await sql`
        insert into geo_monitor_runs (project_id, trigger, engine_count, query_count, status, started_at)
        values (${project.id}, 'cron', 1, ${queries.length}, 'running', now())
        returning id
      `;
      const monitorRunId = runRows[0].id;

      let projectSuccess = 0;
      let projectFailed = 0;
      let projectCost = 0;

      for (const query of queries) {
        const question = String((query as any).question);
        try {
          let answer = '';
          let cost = 0;

          if (geoCfg.engine === 'perplexity' && geoCfg.apiKey) {
            const res = await fetch('https://api.perplexity.ai/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${geoCfg.apiKey}`,
              },
              body: JSON.stringify({
                model: 'sonar',
                messages: [{ role: 'user', content: question }],
                max_tokens: 500,
              }),
              signal: AbortSignal.timeout(30000),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: any = await res.json();
            answer = data.choices?.[0]?.message?.content || '';
            cost = 0.005; // 估算
          } else {
            const { getLLMConfig, callLLM } = await import('./llm');
            const llmCfg = await getLLMConfig();
            if (!llmCfg) throw new Error('LLM 未配置');
            const res = await callLLM(question);
            answer = res.content;
            cost = (res.promptTokens * 2.5 + res.completionTokens * 10) / 1_000_000;
          }

          const brand = String(project.brand_name || '').toLowerCase();
          const domain = String(project.domain || '').toLowerCase();
          const lower = answer.toLowerCase();
          const mentioned = (!!domain && lower.includes(domain)) || (!!brand && lower.includes(brand));

          await sql`
            insert into geo_monitor_results (run_id, query_id, engine, mentioned, position, answer_excerpt, cost_usd, raw)
            values (${monitorRunId}, ${query.id}, ${geoCfg.engine}, ${mentioned}, null,
                    ${answer.slice(0, 500)}, ${cost}, ${JSON.stringify({ question })}::jsonb)
          `;
          projectCost += cost;
          projectSuccess++;
        } catch (err: any) {
          projectFailed++;
          await sql`
            update geo_monitor_runs set error = ${err?.message || String(err)} where id = ${monitorRunId}
          `;
        }
      }

      await sql`
        update geo_monitor_runs
        set finished_at = now(),
            status = ${projectFailed > 0 ? (projectSuccess > 0 ? 'partial' : 'failed') : 'success'},
            cost_usd = ${projectCost}
        where id = ${monitorRunId}
      `;

      totalCost += projectCost;
      success += projectSuccess;
      failed += projectFailed;
    }

    await recordJobStats(runId, success, failed, totalCost);
    await finishJobRun(runId, failed > 0 ? 'partial' : 'success', {
      checked: success,
      failed,
      cost: totalCost,
      queries_total: setup.totalQueries,
      queries_created: setup.createdQueries,
    });
  } catch (err: any) {
    await finishJobRun(runId, 'failed', undefined, err.message);
  }
}

/**
 * 生成月报
 */
export async function generateMonthlyReport(triggeredBy: string): Promise<void> {
  const runId = await startJobRun('monthly_report', 'cron', triggeredBy);

  try {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

    // 收集数据
    const gscMetrics = await sql`select * from seo_daily_metrics where date >= date_trunc('month', now() - interval '1 month') and date < date_trunc('month', now()) order by date`;
    const ga4Metrics = await sql`select * from ga4_daily_metrics where date >= date_trunc('month', now() - interval '1 month') and date < date_trunc('month', now())`;
    const articlesPublished = await sql`select count(*)::text as count from content_articles where status = 'published' and published_at >= date_trunc('month', now() - interval '1 month') and published_at < date_trunc('month', now())`;
    const jobsRun = await sql`select job, status, count(*)::text as count from job_runs where started_at >= date_trunc('month', now() - interval '1 month') and started_at < date_trunc('month', now()) group by job, status`;

    const totalImpressions = gscMetrics.reduce((a: number, m: any) => a + Number(m.impressions || 0), 0);
    const totalClicks = gscMetrics.reduce((a: number, m: any) => a + Number(m.clicks || 0), 0);
    const totalUsers = ga4Metrics.reduce((a: number, m: any) => a + Number(m.users || 0), 0);
    const totalPageviews = ga4Metrics.reduce((a: number, m: any) => a + Number(m.pageviews || 0), 0);

    // 生成 HTML 报告
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>月报 ${month}</title>
<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:20px;color:#333}
h1{color:#2563eb}.stat{display:inline-block;margin:10px;padding:15px;background:#f3f4f6;border-radius:8px;text-align:center}
.stat .num{font-size:24px;font-weight:bold}.stat .label{font-size:12px;color:#666}</style>
</head><body>
<h1>月报 ${month}</h1>
<p>站点：${SITE_URL}</p>
<h2>核心指标</h2>
<div class="stat"><div class="num">${totalImpressions}</div><div class="label">GSC 展示</div></div>
<div class="stat"><div class="num">${totalClicks}</div><div class="label">GSC 点击</div></div>
<div class="stat"><div class="num">${totalUsers}</div><div class="label">GA4 访客</div></div>
<div class="stat"><div class="num">${totalPageviews}</div><div class="label">GA4 浏览量</div></div>
<div class="stat"><div class="num">${articlesPublished[0].count}</div><div class="label">发布文章</div></div>
<h2>任务执行</h2>
<table border="1" style="border-collapse:collapse;width:100%"><tr><th>任务</th><th>状态</th><th>次数</th></tr>
${jobsRun.map((j: any) => `<tr><td>${j.job}</td><td>${j.status}</td><td>${j.count}</td></tr>`).join('')}
</table>
</body></html>`;

    // 上传到 R2
    const key = `reports/${month}.html`;
    let htmlUrl: string;
    try {
      htmlUrl = await uploadToR2(key, Buffer.from(html, 'utf-8'), 'text/html');
    } catch {
      htmlUrl = '';
    }

    await sql`
      insert into seo_monthly_reports (month, html_url, summary, status)
      values (${month}, ${htmlUrl || null}, ${JSON.stringify({ totalImpressions, totalClicks, totalUsers, totalPageviews, articlesPublished: articlesPublished[0].count })}::jsonb, 'success')
      on conflict (month) do update set html_url = excluded.html_url, summary = excluded.summary, status = 'success'
    `;

    // 发送通知
    const notifyRaw = await getSecret('notification');
    if (notifyRaw) {
      const notifyCfg = JSON.parse(notifyRaw);
      if (notifyCfg.url) {
        await fetch(notifyCfg.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: `月报 ${month} 已生成。展示 ${totalImpressions}，点击 ${totalClicks}，访客 ${totalUsers}` }),
          signal: AbortSignal.timeout(10000),
        }).catch(() => {});
      }
    }

    await finishJobRun(runId, 'success', { month, htmlUrl });
    await logAudit(triggeredBy, 'monthly_report_done', month, { htmlUrl });
  } catch (err: any) {
    await finishJobRun(runId, 'failed', undefined, err.message);
  }
}
