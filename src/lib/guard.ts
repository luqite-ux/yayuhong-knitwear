import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { verifyApiKey } from '@/lib/api-keys';

export async function requireAdmin(req?: NextRequest): Promise<boolean> {
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const key = authHeader.replace('Bearer ', '').trim();
      if (key.startsWith('yyk_')) {
        return verifyApiKey(key);
      }
    }
    const xApiKey = req.headers.get('x-api-key');
    if (xApiKey?.startsWith('yyk_')) {
      return verifyApiKey(xApiKey);
    }
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (token) {
      return verifySession(token);
    }
  } catch {
  }

  return false;
}

export async function requireAdminOr401(req?: NextRequest): Promise<{ ok: true } | NextResponse> {
  const ok = await requireAdmin(req);
  if (!ok) {
    return NextResponse.json(
      { error: '未授权，请先登录或使用有效的 API Key' },
      { status: 401 },
    );
  }
  return { ok: true };
}

export function requireCronSecret(req: NextRequest): boolean {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '');
  return secret === process.env.CRON_SECRET;
}
