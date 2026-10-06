import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guard';
import { runBootstrap } from '@/lib/seo-pipeline';

export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  try {
    const result = await runBootstrap('admin');
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
