import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guard';
import { sql } from '@/lib/db';
import { syncGsc, syncGa4 } from '@/lib/seo-services';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** 管理员手动触发 GSC / GA4 同步（用于接入后立即验证，不必等次日定时任务） */
export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { service } = await req.json().catch(() => ({}));
  if (service !== 'gsc' && service !== 'ga4') {
    return NextResponse.json({ error: 'service 须为 gsc 或 ga4' }, { status: 400 });
  }

  if (service === 'gsc') await syncGsc('manual');
  else await syncGa4('manual');

  const rows = await sql`
    select status, error, summary from job_runs
    where job = ${service === 'gsc' ? 'gsc_sync' : 'ga4_sync'}
    order by started_at desc limit 1
  `;
  const r = rows[0];
  return NextResponse.json({
    ok: r?.status === 'success',
    status: r?.status,
    error: r?.error || null,
    summary: r?.summary || null,
  });
}
