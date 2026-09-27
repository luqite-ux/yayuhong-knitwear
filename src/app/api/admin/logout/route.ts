import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logout, clearSessionCookie } from '@/lib/auth';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  await logout(token);
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
