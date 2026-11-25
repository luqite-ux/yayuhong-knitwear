import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import { requireAdmin } from '@/lib/guard';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function isExternal(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  const u = url.trim();
  if (!u || u.startsWith('data:')) return false;
  if (u.startsWith('/')) return false;
  return /^https?:\/\//i.test(u);
}

/**
 * 返回数据库中所有产品/文章的外部图片 URL 清单（按 URL 去重）。
 * 字段：cover_url, gallery_urls[]
 */
export async function GET(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) return NextResponse.json({ error: 'no db' }, { status: 500 });
  const sql = postgres(DATABASE_URL, { ssl: 'require', max: 2, connect_timeout: 15 });

  try {
    const products = (await sql<
      Array<{
        id: string;
        slug?: string | null;
        cover_url?: string | null;
        gallery_urls?: string[] | null;
      }>
    >`select id, slug, cover_url, gallery_urls from content_products`);

    const articles = (await sql<
      Array<{ id: string; slug?: string | null; cover_url?: string | null }>
    >`select id, slug, cover_url from content_articles`);

    const allUrls = new Set<string>();
    const productUsage = new Map<string, Array<{ id: string; slug?: string | null; field: 'cover' | 'gallery' }>>();
    const articleUsage = new Map<string, Array<{ id: string; slug?: string | null }>>();

    for (const p of products) {
      if (isExternal(p.cover_url)) {
        allUrls.add(p.cover_url.trim());
        const list = productUsage.get(p.cover_url.trim()) || [];
        list.push({ id: p.id, slug: p.slug, field: 'cover' });
        productUsage.set(p.cover_url.trim(), list);
      }
      if (Array.isArray(p.gallery_urls)) {
        for (const g of p.gallery_urls) {
          if (isExternal(g)) {
            allUrls.add(g.trim());
            const list = productUsage.get(g.trim()) || [];
            list.push({ id: p.id, slug: p.slug, field: 'gallery' });
            productUsage.set(g.trim(), list);
          }
        }
      }
    }

    for (const a of articles) {
      if (isExternal(a.cover_url)) {
        allUrls.add(a.cover_url.trim());
        const list = articleUsage.get(a.cover_url.trim()) || [];
        list.push({ id: a.id, slug: a.slug });
        articleUsage.set(a.cover_url.trim(), list);
      }
    }

    const urls = Array.from(allUrls).sort();
    return NextResponse.json({
      count: urls.length,
      urls,
      // 每个 URL 被哪些产品/文章引用（便于本地快速确认）
      usage: {
        products: Object.fromEntries(productUsage),
        articles: Object.fromEntries(articleUsage),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  } finally {
    await sql.end({ timeout: 5 });
  }
}
