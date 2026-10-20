import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guard';
import { runIndexing } from '@/lib/seo-services';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 90;

/** 管理员手动触发 Indexing 流程（不用等 daily cron） */
export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  try {
    await runIndexing('manual');
    const rows = await sql`
      select status, error, summary, success_count, failure_count
      from job_runs where job = 'indexing'
      order by started_at desc limit 1
    `;
    const r = rows[0];
    return NextResponse.json({
      ok: r?.status === 'success',
      status: r?.status,
      summary: r?.summary,
      success: r?.success_count,
      failed: r?.failure_count,
      error: r?.error || null,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
