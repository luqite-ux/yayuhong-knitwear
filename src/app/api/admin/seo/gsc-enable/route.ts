import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guard';
import { getSecret } from '@/lib/secrets';

/**
 * 给当前 SA 所属项目启用 Site Verification API。
 * 做法：用 SA 自己的 JWT 去调 Service Usage API（serviceusage.services.enable）。
 * SA 在自己项目里通常有 Editor 角色，能启用 API。
 * 如果 Service Usage API 也没启用，会先返回错误提示。
 */
export const dynamic = 'force-dynamic';

async function saAccessToken(saJson: string): Promise<string> {
  const sa = JSON.parse(saJson);
  const scope = 'https://www.googleapis.com/auth/cloud-platform';
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    scope,
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600,
  };
  const b64 = (o: any) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const signContent = `${b64(header)}.${b64(claim)}`;
  const crypto = await import('node:crypto');
  const key = crypto.createPrivateKey(sa.private_key);
  const sig = crypto.createSign('RSA-SHA256').update(signContent).end().sign(key, 'base64url');
  const jwt = `${signContent}.${sig}`;
  const res = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`token 交换失败: ${JSON.stringify(body).slice(0, 300)}`);
  return body.access_token as string;
}

export async function GET(req: Request) {
  const ok = await requireAdmin(req as any);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  try {
    const saRaw = await getSecret('google');
    if (!saRaw) return NextResponse.json({ error: 'google SA 未配置' }, { status: 400 });
    const sa = JSON.parse(saRaw);
    const token = await saAccessToken(saRaw);

    // 1. 查 Service Usage 状态
    const services: string[] = ['siteverification.googleapis.com'];
    const statusBefore: any[] = [];
    for (const service of services) {
      const r = await fetch(
        `https://serviceusage.googleapis.com/v1/projects/${sa.project_id}/services/${service}`,
        { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15_000) },
      );
      const j = await r.json();
      statusBefore.push({ service, state: j.state ?? j.error?.message ?? 'unknown' });
    }

    // 2. 启用 siteverification
    const enableResults: any[] = [];
    for (const service of services) {
      const r = await fetch(
        `https://serviceusage.googleapis.com/v1/projects/${sa.project_id}/services/${service}:enable`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(20_000) },
      );
      const j = await r.json();
      enableResults.push({ service, httpStatus: r.status, operation: j.name ?? null, error: j.error ?? null });
    }

    // 3. 再查一次状态
    const statusAfter: any[] = [];
    for (const service of services) {
      const r = await fetch(
        `https://serviceusage.googleapis.com/v1/projects/${sa.project_id}/services/${service}`,
        { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15_000) },
      );
      const j = await r.json();
      statusAfter.push({ service, state: j.state ?? j.error?.message ?? 'unknown' });
    }

    return NextResponse.json({
      ok: true,
      project_id: sa.project_id,
      client_email: sa.client_email,
      status_before: statusBefore,
      enable: enableResults,
      status_after: statusAfter,
      tip: enableResults[0]?.error ? null : '启用成功！10 秒后再触发 onboarding 即可',
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
