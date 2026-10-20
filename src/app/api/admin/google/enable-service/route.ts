import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guard';
import { enableGoogleService } from '@/lib/google';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** 程序化启用 Google Cloud API（不走 Console 手动点） */
export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { service } = await req.json().catch(() => ({}));
  if (!service || typeof service !== 'string') {
    return NextResponse.json({ error: 'service 必填，如 indexing.googleapis.com' }, { status: 400 });
  }

  try {
    const result = await enableGoogleService(service);
    return NextResponse.json({ ok: result.enabled, service, ...result });
  } catch (err: any) {
    return NextResponse.json({ ok: false, service, error: err.message || String(err) }, { status: 500 });
  }
}
