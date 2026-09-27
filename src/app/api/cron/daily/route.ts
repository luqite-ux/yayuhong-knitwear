import { NextRequest, NextResponse } from 'next/server';
import { requireCronSecret } from '@/lib/guard';
import { syncGsc, syncGa4, runIndexing, runGeoMonitor } from '@/lib/seo-services';
import { runSiteScan } from '@/lib/seo-pipeline';

export async function GET(req: NextRequest) {
  if (!requireCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, string> = {};

  // 顺序执行所有每日任务
  const tasks = [
    { name: 'gsc_sync', fn: () => syncGsc('cron') },
    { name: 'ga4_sync', fn: () => syncGa4('cron') },
    { name: 'indexing', fn: () => runIndexing('cron') },
    { name: 'site_scan', fn: () => runSiteScan('cron') },
    { name: 'geo_monitor', fn: () => runGeoMonitor('cron') },
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
