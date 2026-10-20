import { NextRequest, NextResponse } from 'next/server';
import { requireCronSecret } from '@/lib/guard';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** 读取 SEO 自动配置（cron 鉴权） */
export async function GET(req: NextRequest) {
  if (!requireCronSecret(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const [row] = await sql`
      select enabled, publish_mode, indexing_enabled, writing_locale, monthly_articles,
             target_locales, geo_monthly_budget_usd, updated_at
      from seo_config order by created_at limit 1
    `;
    return NextResponse.json({ ok: true, config: row ?? null });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

/** 更新 SEO 自动配置（cron 鉴权，仅允许已知字段） */
export async function POST(req: NextRequest) {
  if (!requireCronSecret(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = (await req.json().catch(() => ({}))) as {
      monthly_articles?: number;
      enabled?: boolean;
      publish_mode?: 'auto' | 'review';
      indexing_enabled?: boolean;
    };

    if (body.monthly_articles !== undefined) {
      const n = Number(body.monthly_articles);
      if (!Number.isInteger(n) || n < 0 || n > 20) {
        return NextResponse.json({ error: 'monthly_articles 必须是 0-20 的整数' }, { status: 400 });
      }
      await sql`update seo_config set monthly_articles = ${n}, updated_at = now()`;
    }
    if (body.enabled !== undefined) {
      await sql`update seo_config set enabled = ${!!body.enabled}, updated_at = now()`;
    }
    if (body.publish_mode !== undefined) {
      if (!['auto', 'review'].includes(body.publish_mode)) {
        return NextResponse.json({ error: 'publish_mode 只能是 auto/review' }, { status: 400 });
      }
      await sql`update seo_config set publish_mode = ${body.publish_mode}, updated_at = now()`;
    }
    if (body.indexing_enabled !== undefined) {
      await sql`update seo_config set indexing_enabled = ${!!body.indexing_enabled}, updated_at = now()`;
    }

    const [row] = await sql`
      select enabled, publish_mode, indexing_enabled, writing_locale, monthly_articles,
             target_locales, geo_monthly_budget_usd, updated_at
      from seo_config order by created_at limit 1
    `;
    return NextResponse.json({ ok: true, config: row ?? null });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
