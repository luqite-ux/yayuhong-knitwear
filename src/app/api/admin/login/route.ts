import { NextRequest, NextResponse } from 'next/server';
import { login, setSessionCookie } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: '请输入邮箱和密码' }, { status: 400 });
  }

  const signedToken = await login(email, password);
  if (!signedToken) {
    return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, signedToken);
  await logAudit(email, 'login', 'admin_session');
  return res;
}
