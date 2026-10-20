import { NextRequest, NextResponse } from 'next/server';
import { requireCronSecret } from '@/lib/guard';
import { syncGsc, syncGa4, runIndexing, runGeoMonitor } from '@/lib/seo-services';
import { runSiteScan, ensureFaqs } from '@/lib/seo-pipeline';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  if (!requireCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, string> = {};

  // === 自修复：检查 GSC onboarding 是否完成 ===
  try {
    const domain = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com').hostname;
    const gscProps = await sql`select property, status from seo_gsc_properties where property = ${`sc-domain:${domain}`} limit 1`;
    if (gscProps.length === 0 || (gscProps[0] as any).status !== 'verified') {
      console.log('[daily-cron] GSC onboarding 未完成，自动触发');
      const { runGscOnboarding } = await import('@/lib/seo/gsc-onboarding-server');
      const onboardingResult = await runGscOnboarding();
      results.gsc_onboarding = onboardingResult.status;
    }
  } catch (err: any) {
    console.warn('[daily-cron] GSC onboarding 检查/修复失败但继续:', err?.message);
  }

  // 顺序执行所有每日任务
  const tasks = [
    { name: 'gsc_sync', fn: () => syncGsc('cron') },
    { name: 'ga4_sync', fn: () => syncGa4('cron') },
    { name: 'indexing', fn: () => runIndexing('cron') },
    { name: 'site_scan', fn: () => runSiteScan('cron') },
    { name: 'geo_monitor', fn: () => runGeoMonitor('cron') },
    { name: 'faq_seed', fn: () => ensureFaqs() },
  ];

  for (const task of tasks) {
    try {
      await task.fn();
      results[task.name] = 'ok';
    } catch (err: any) {
      results[task.name] = err.message;
    }
  }

  return NextResponse.json({ ok: true, results });
}
