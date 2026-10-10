import { NextRequest, NextResponse } from 'next/server';
import { requireCronSecret } from '@/lib/guard';
import { runBootstrap } from '@/lib/seo-pipeline';
import { sql } from '@/lib/db';

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  if (!requireCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 检查当前 SEO 配置状态
    const configRows = await sql`
      select enabled, keyword_seeds, brand_voice from seo_config order by created_at limit 1
    `;

    if (configRows.length === 0) {
      return NextResponse.json({ error: 'SEO config not found' }, { status: 500 });
    }

    const config = configRows[0] as { enabled: boolean; keyword_seeds: string[]; brand_voice: string | null };
    const alreadyBootstrapped = config.keyword_seeds?.length > 0 && config.brand_voice;

    // 如果已经初始化过关键词，只需要启用
    if (alreadyBootstrapped && config.enabled) {
      return NextResponse.json({ ok: true, message: 'SEO already enabled and bootstrapped', skipped: true });
    }

    // 如果还没初始化过，运行 bootstrap
    let bootstrapResult: any = null;
    if (!alreadyBootstrapped) {
      bootstrapResult = await runBootstrap('cron-auto-start');
    }

    // 启用 SEO
    await sql`
      update seo_config set enabled = true, updated_at = now()
      where id = (select id from seo_config order by created_at limit 1)
    `;

    return NextResponse.json({
      ok: true,
      message: 'SEO automation started successfully',
      bootstrapped: !alreadyBootstrapped,
      bootstrapResult,
      enabled: true,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('SEO auto-start error:', err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 },
    );
  }
}
