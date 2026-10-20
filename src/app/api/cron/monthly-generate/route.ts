import { NextRequest, NextResponse } from 'next/server';
import { requireCronSecret } from '@/lib/guard';
import { runGeneration } from '@/lib/seo-pipeline';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  if (!requireCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const raw = Number(new URL(req.url).searchParams.get('count'));
    const count = Number.isInteger(raw) && raw > 0 && raw <= 10 ? raw : undefined;
    const result = await runGeneration('cron', 'cron_monthly_generate', count);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
