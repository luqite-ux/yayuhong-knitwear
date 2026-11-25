import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guard';
import { ensureSitemapSubmitted } from '@/lib/seo-services';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * 部署后手动强制重新提交 sitemap 到 Google Search Console。
 * 绕过 ensureSitemapSubmitted 的 7 天幂等限制，让新的 /en 主路径 sitemap 立即生效。
 */
export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const host = new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com',
  ).hostname;
  const property = `sc-domain:${host}`;

  try {
    const result = await ensureSitemapSubmitted(property, { force: true });
    return NextResponse.json({ property, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { property, error: err.message || String(err), stack: String(err.stack || '').split('\n').slice(0, 5).join('\n') },
      { status: 500 },
    );
  }
}
