import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

export async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  return verifySession(token);
}

export async function requireAdminOr401(): Promise<{ ok: true } | NextResponse> {
  const ok = await requireAdmin();
  if (!ok) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  return { ok: true };
}

export function requireCronSecret(req: NextRequest): boolean {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '');
  return secret === process.env.CRON_SECRET;
}
