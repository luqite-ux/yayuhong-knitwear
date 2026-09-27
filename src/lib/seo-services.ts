import { sql } from './db';
import { getSearchConsoleClient, getGa4PropertyId, getGa4MeasurementId } from './google';
import { startJobRun, finishJobRun, recordJobStats } from './jobs';
import { logAudit } from './audit';
import { uploadToR2 } from './r2';
import { getSecret } from './secrets';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com';

/**
 * GSC 同步：过去 3 天的搜索分析数据
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
    await finishJobRun(runId, 'success', { synced: success });
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
 */
export async function runIndexing(triggeredBy: string): Promise<void> {
  const runId = await startJobRun('indexing', 'cron', triggeredBy);
  let success = 0;
  let failed = 0;

  try {
    // 1. 抓取 sitemap 获取 URL
    const res = await fetch(`${SITE_URL}/sitemap.xml`, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`);
    const xml = await res.text();
    const urls = xml.match(/<loc>(.*?)<\/loc>/g)?.map((m) => m.replace(/<\/?loc>/g, '')) || [];

    // 2. 更新 URL 表
    for (const url of urls) {
      const urlType = url.includes('/products') ? 'product' : url.includes('/articles') ? 'article' : url.endsWith('/sitemap.xml') ? 'other' : 'home';
      await sql`
        insert into seo_indexed_urls (url, url_type, in_sitemap)
        values (${url}, ${urlType}, true)
        on conflict (url) do update set in_sitemap = true
      `;
    }

    // 3. URL Inspection（抽样 10 个未检测的）
    const { getIndexingClient } = await import('./google');
    const indexingClient = await getIndexingClient();
    if (indexingClient) {
      const toInspect = await sql`
        select url from seo_indexed_urls
        where last_inspected_at is null and url_type != 'other'
        limit 10
      `;

      for (const { url } of toInspect) {
        try {
          const inspectRes: any = await (indexingClient as any).urlInspection.index.inspect({
            requestBody: {
              inspectionUrl: url,
              siteUrl: `sc-domain:${new URL(SITE_URL).hostname}`,
            },
          });
          const result = inspectRes.data.inspectionResult;
          const indexStatus = result?.indexStatusResult;
          await sql`
            update seo_indexed_urls set
              inspection_status = ${indexStatus?.coverageState || 'UNKNOWN'},
              coverage_state = ${indexStatus?.coverageState || null},
              last_inspected_at = now()
            where url = ${url}
          `;
          success++;
        } catch {
          failed++;
        }
      }

      // 4. Indexing API 提交（限额 50/站/天）
      const toSubmit = await sql`
        select url from seo_indexed_urls
        where in_sitemap = true
          and (request_count < 50)
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
              request_count = coalesce(request_count, 0) + 1
            where url = ${url}
          `;
          success++;
        } catch (err: any) {
          await sql`
            update seo_indexed_urls set last_error = ${err.message} where url = ${url}
          `;
          failed++;
        }
      }
    }

    await recordJobStats(runId, success, failed, 0);
    await finishJobRun(runId, failed > 0 ? 'partial' : 'success', { inspected: success });
  } catch (err: any) {
    await finishJobRun(runId, 'failed', undefined, err.message);
  }
}

/**
 * GEO 监测
 */
export async function runGeoMonitor(triggeredBy: string): Promise<void> {
  const runId = await startJobRun('geo_monitor', 'cron', triggeredBy);
  let success = 0;
  let failed = 0;
  let totalCost = 0;

  try {
    const projects = await sql`select * from geo_projects where is_active = true`;
    if (projects.length === 0) {
      await finishJobRun(runId, 'skipped', { reason: 'no_projects' });
      return;
    }

    const geoRaw = await getSecret('geo_engine');
    if (!geoRaw) {
      await finishJobRun(runId, 'skipped', { reason: 'geo_engine_not_configured' });
      return;
    }
    const geoCfg = JSON.parse(geoRaw);

    for (const project of projects) {
      const queries = await sql`select * from geo_queries where project_id = ${project.id} and is_active = true limit 10`;
      if (queries.length === 0) continue;

      const runRows = await sql`
        insert into geo_monitor_runs (project_id, total_queries, started_at)
        values (${project.id}, ${queries.length}, now())
        returning id
      `;
      const monitorRunId = runRows[0].id;

      for (const query of queries) {
        try {
          let answer = '';
          let mentioned = false;
          let position: number | null = null;
          let cost = 0;

          if (geoCfg.engine === 'perplexity') {
            const res = await fetch('https://api.perplexity.ai/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${geoCfg.apiKey}`,
              },
              body: JSON.stringify({
                model: 'sonar',
                messages: [{ role: 'user', content: query.query_text }],
                max_tokens: 500,
              }),
              signal: AbortSignal.timeout(30000),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            answer = data.choices?.[0]?.message?.content || '';
            cost = 0.005; // 估算
            mentioned = answer.toLowerCase().includes(project.domain?.toLowerCase() || new URL(SITE_URL).hostname);
          } else if (geoCfg.engine === 'openai') {
            const { getLLMConfig, callLLM } = await import('./llm');
            const llmCfg = await getLLMConfig();
            if (!llmCfg) continue;
            const res = await callLLM(query.query_text);
            answer = res.content;
            cost = (res.promptTokens * 2.5 + res.completionTokens * 10) / 1_000_000;
            mentioned = answer.toLowerCase().includes(project.domain?.toLowerCase() || new URL(SITE_URL).hostname);
          }

          await sql`
            insert into geo_monitor_results (run_id, query_id, engine, mentioned, position, answer_excerpt, cost_usd)
            values (${monitorRunId}, ${query.id}, ${geoCfg.engine}, ${mentioned}, ${position}, ${answer.slice(0, 500)}, ${cost})
          `;
          totalCost += cost;
          success++;
        } catch (err: any) {
          failed++;
        }
      }

      await sql`update geo_monitor_runs set finished_at = now(), succeeded = ${success}, failed = ${failed} where id = ${monitorRunId}`;
    }

    await recordJobStats(runId, success, failed, totalCost);
    await finishJobRun(runId, failed > 0 ? 'partial' : 'success', { checked: success, cost: totalCost });
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
