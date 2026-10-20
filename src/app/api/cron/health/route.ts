import { NextRequest, NextResponse } from 'next/server';
import { requireCronSecret } from '@/lib/guard';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** 核心数据表（用于健康检查计数） */
const TABLES = [
  'seo_gsc_properties',
  'seo_daily_metrics',
  'seo_keywords',
  'seo_keyword_rankings',
  'seo_indexed_urls',
  'seo_sitemap_submissions',
  'ga4_daily_metrics',
  'job_runs',
  'seo_generation_runs',
  'seo_article_drafts',
  'content_articles',
  'content_products',
  'content_categories',
  'content_faqs',
  'inquiries',
  'integration_secrets',
  'geo_projects',
  'geo_queries',
  'geo_monitor_results',
];

/**
 * GET /api/cron/health
 * 需要 Authorization: Bearer <CRON_SECRET>
 * 返回各表行数 + 自动化关键指标（收录/同步新鲜度/job 最近执行结果）
 */
export async function GET(req: NextRequest) {
  if (!requireCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const counts: Record<string, number> = {};
    for (const table of TABLES) {
      const rows = await sql.unsafe(`select count(*)::int as c from ${table}`);
      counts[table] = Number((rows[0] as any).c);
    }

    const [summary] = await sql`
      select
        (select max(date)::text from seo_daily_metrics)                 as gsc_last_date,
        (select max(date)::text from ga4_daily_metrics)                 as ga4_last_date,
        (select count(*)::int from seo_indexed_urls
           where last_inspected_at is not null)                         as urls_inspected,
        (select count(*)::int from seo_indexed_urls
           where last_index_request_at is not null)                     as urls_submitted,
        (select count(*)::int from seo_indexed_urls
           where last_error is not null)                                as urls_with_error,
        (select count(*)::int from content_articles where status = 'published') as articles_published,
        (select count(*)::int from content_products where is_active)     as products_active,
        (select max(started_at)::text from job_runs where status = 'success') as last_job_success,
        (select max(started_at)::text from job_runs where status = 'failed')  as last_job_failed
    `;

    const gscProperties = await sql`
      select property, status, verified_at, last_sync_at, last_error
      from seo_gsc_properties order by created_at
    `;

    const lastRuns = await sql`
      select job, status, trigger, success_count, failure_count, error,
             started_at, finished_at
      from job_runs order by started_at desc limit 20
    `;

    const [seoConfig] = await sql`
      select enabled, publish_mode, indexing_enabled, writing_locale,
             monthly_articles, target_locales, geo_monthly_budget_usd
      from seo_config limit 1
    `;

    const draftStatus = await sql`
      select status, count(*)::int as c, min(scheduled_at)::text as earliest_schedule
      from seo_article_drafts group by status
    `;

    const geoSummary = await sql`
      select
        (select count(*)::int from geo_projects where enabled) as enabled_projects,
        (select count(*)::int from geo_queries where enabled)  as enabled_queries
    `;

    return NextResponse.json({
      ok: true,
      checked_at: new Date().toISOString(),
      counts,
      summary,
      seo_config: seoConfig ?? null,
      draft_status: draftStatus,
      geo: geoSummary[0] ?? null,
      gsc_properties: gscProperties,
      last_job_runs: lastRuns,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
