import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * 临时维护路由：从审计日志中找回管理员登录邮箱
 * 认证：Authorization: Bearer <RECOVER_TOKEN>
 * 用完即删（连同 RECOVER_TOKEN 环境变量）
 */
export async function POST(req: NextRequest) {
  const token = process.env.RECOVER_TOKEN;
  const authHeader = req.headers.get('authorization');
  if (!token || authHeader !== `Bearer ${token}`) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const rows = await sql`
    select actor, count(*)::int as n, max(created_at) as last_at
    from audit_logs
    where action = 'login'
    group by actor
    order by last_at desc
  `;

  const out: Record<string, unknown> = { loginActors: rows };

  // 分步诊断登录 500（仅返回布尔/长度，不回显敏感值）
  const body = await req.json().catch(() => ({}));
  if (body.diag === true) {
    const crypto = await import('node:crypto');
    const { verify } = await import('@node-rs/argon2');
    const { login, setSessionCookie } = await import('@/lib/auth');
    const { logAudit } = await import('@/lib/audit');
    const hash = process.env.ADMIN_PASSWORD_HASH || '';
    const errInfo = (e: any) => ({
      msg: String(e?.message ?? e).slice(0, 300),
      code: e?.code ? String(e.code) : undefined,
      stack: String(e?.stack ?? '').split('\n').slice(0, 4).join(' | ').slice(0, 500),
    });
    out.env = {
      emailLen: (process.env.ADMIN_EMAIL || '').length,
      hashLen: hash.length,
      hashPrefix: hash.slice(0, 12),
      sessionSecretLen: (process.env.ADMIN_SESSION_SECRET || '').length,
      node: process.version,
    };
    try {
      out.verifyBad = await verify(hash, 'definitely-wrong-9f8a', { algorithm: 2 });
    } catch (e: any) {
      out.verifyBadErr = errInfo(e);
    }
    if (typeof body.password === 'string' && body.password.length >= 8) {
      try {
        out.verifyGood = await verify(hash, body.password, { algorithm: 2 });
      } catch (e: any) {
        out.verifyGoodErr = errInfo(e);
      }
      // 完整 login()（含 DB 插入 + HMAC 签名），成功后删除测试会话
      try {
        const signed = await login(process.env.ADMIN_EMAIL || '', body.password);
        out.login = signed && typeof signed === 'string' && signed.length > 80 ? 'ok' : 'short-token';
        if (signed) {
          const raw = signed.slice(0, signed.lastIndexOf('.'));
          const th = crypto.createHash('sha256').update(raw).digest('hex');
          await sql`delete from admin_sessions where token_hash = ${th}`;
        }
      } catch (e: any) {
        out.loginErr = errInfo(e);
      }
    }
    try {
      const tok = crypto.randomBytes(32).toString('hex');
      const tokHash = crypto.createHash('sha256').update(tok).digest('hex');
      const ins = await sql`
        insert into admin_sessions (token_hash, expires_at) values (${tokHash}, now() + interval '1 minute')
        returning id
      `;
      await sql`delete from admin_sessions where id = ${ins[0].id}`;
      out.sessionInsert = 'ok';
    } catch (e: any) {
      out.sessionInsertErr = errInfo(e);
    }
    try {
      const sig = crypto.createHmac('sha256', process.env.ADMIN_SESSION_SECRET || '').update('x').digest('hex');
      out.hmac = sig.length === 64 ? 'ok' : 'badlen';
    } catch (e: any) {
      out.hmacErr = errInfo(e);
    }
    try {
      const probeRes = NextResponse.json({ ok: true });
      setSessionCookie(probeRes, 'a'.repeat(64) + '.' + 'b'.repeat(64));
      const sc = probeRes.headers.get('set-cookie') || '';
      out.cookieSet = sc.startsWith('admin_session=') ? 'ok' : sc.slice(0, 80);
    } catch (e: any) {
      out.cookieSetErr = errInfo(e);
    }
    try {
      await logAudit('diag-probe@local', 'diag-probe', 'probe');
      await sql`delete from audit_logs where actor = 'diag-probe@local' and action = 'diag-probe'`;
      out.audit = 'ok';
    } catch (e: any) {
      out.auditErr = errInfo(e);
    }
  }

  return NextResponse.json(out);
}
