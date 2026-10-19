import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guard';
import { getSecret } from '@/lib/secrets';

/** 临时诊断端点：解密后只输出公开元数据（不打印私钥） */
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const ok = await requireAdmin(req as any);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  try {
    const saRaw = await getSecret('google');
    const cfRaw = await getSecret('cloudflare');

    let googleMeta: any = null;
    if (saRaw) {
      try {
        const sa = JSON.parse(saRaw);
        googleMeta = {
          type: sa.type,
          project_id: sa.project_id,
          client_email: sa.client_email,
          has_private_key: !!sa.private_key,
          scopes_used: [
            'webmasters',
            'indexing',
            'analytics.readonly',
            'siteverification',
          ],
        };
      } catch (e: any) {
        googleMeta = { parse_error: e.message, first_80: saRaw.slice(0, 80) };
      }
    }

    let cfMeta: any = null;
    if (cfRaw) {
      try {
        const cf = JSON.parse(cfRaw);
        // 只测 Cloudflare API 能列出多少个 zone，判断 token 有没有权限
        let zoneCount = 'unknown';
        let errMsg = null;
        try {
          const res = await fetch(
            `https://api.cloudflare.com/client/v4/zones?per_page=5`,
            { headers: { Authorization: `Bearer ${cf.apiToken}` }, signal: AbortSignal.timeout(10_000) },
          );
          const data = await res.json();
          if (data.success) zoneCount = data.result?.length ?? 0;
          else errMsg = (data.errors || []).map((e: any) => e.message).join('; ');
        } catch (e: any) { errMsg = e.message; }

        cfMeta = {
          apiToken_present: !!cf.apiToken,
          apiToken_prefix: cf.apiToken?.slice(0, 6) || null,
          zoneId: cf.zoneId || null,
          zoneCountSample: zoneCount,
          zoneError: errMsg,
        };
      } catch (e: any) {
        cfMeta = { parse_error: e.message };
      }
    }

    return NextResponse.json({ ok: true, google: googleMeta, cloudflare: cfMeta });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
