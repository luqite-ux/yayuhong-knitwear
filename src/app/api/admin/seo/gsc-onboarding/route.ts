import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guard';
import { runGscOnboarding } from '@/lib/seo/gsc-onboarding-server';

export const dynamic = 'force-dynamic';
export const maxDuration = 90;

/** 管理员手动触发 GSC 自动验证 onboarding */
export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  try {
    const result = await runGscOnboarding();
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message, stack: String(err.stack || '').split('\n').slice(0, 5).join('\n') }, { status: 500 });
  }
}
