import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guard';
import { logAudit } from '@/lib/audit';
import { createApiKey, listApiKeys, revokeApiKey } from '@/lib/api-keys';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未授权' }, { status: 401 });

  const keys = await listApiKeys();
  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未授权' }, { status: 401 });

  const body = await req.json();
  const { name, permissions, rate_limit, expires_days } = body;

  if (!name || name.trim().length === 0) {
    return NextResponse.json({ error: '请输入密钥名称' }, { status: 400 });
  }

  const perms = Array.isArray(permissions) && permissions.length > 0 ? permissions : ['*'];
  const rateLimit = Number(rate_limit) || 1000;

  let expiresAt: Date | undefined;
  if (expires_days && Number(expires_days) > 0) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(expires_days));
  }

  try {
    const result = await createApiKey(name.trim(), perms, rateLimit, expiresAt);
    await logAudit('admin', 'create', 'api_key', { id: result.id, name: name.trim() });

    return NextResponse.json({
      ok: true,
      id: result.id,
      key: result.key,
      key_prefix: result.keyPrefix,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未授权' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 });

  const success = await revokeApiKey(id);
  if (success) {
    await logAudit('admin', 'revoke', 'api_key', { id });
  }

  return NextResponse.json({ ok: success });
}
