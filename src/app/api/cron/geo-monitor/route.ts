import { NextRequest, NextResponse } from 'next/server';
import { requireCronSecret } from '@/lib/guard';
import { runGeoMonitor } from '@/lib/seo-services';

export async function GET(req: NextRequest) {
  if (!requireCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await runGeoMonitor('cron');
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
