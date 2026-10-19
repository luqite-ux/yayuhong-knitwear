import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guard';
import { getSearchConsoleClient } from '@/lib/google';

/** 临时：直接测 SA 能不能调 Search Analytics（不是 sync 存库，是裸 API 回显） */
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const ok = await requireAdmin(req as any);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  try {
    const webmasters = await getSearchConsoleClient();
    if (!webmasters) return NextResponse.json({ ok: false, error: 'webmasters 客户端没初始化' }, { status: 500 });

    const today = new Date();
    const start = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    const body: any = {
      startDate: start.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      dimensions: ['date'],
      rowLimit: 10,
    };

    const res: any = await webmasters.searchanalytics.query({
      siteUrl: 'sc-domain:xiuyuknit.com',
      requestBody: body,
    });

    return NextResponse.json({
      ok: true,
      rows: res.data?.rows ?? [],
      searchType: res.data?.searchType ?? [],
      endDate: body.endDate,
      startDate: body.startDate,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
