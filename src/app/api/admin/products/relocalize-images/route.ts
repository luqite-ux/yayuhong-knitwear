import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import crypto from 'node:crypto';
import { requireAdmin } from '@/lib/guard';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * 批量把 cover_url / gallery_urls 里的外部 URL 改成本地路径。
 * 请求体：{ mappings: { url: string, localPath: string }[] }
 * localPath 应该是类似 "/products/local/xxxx.hash.jpg" 的绝对路径（不含 host）。
 */
export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = (await req.json()) as { mappings?: Array<{ url: string; localPath: string }> };
  const mappings = body?.mappings || [];
  if (mappings.length === 0) {
    return NextResponse.json({ updated: 0, note: '空 mappings，跳过' });
  }

  const map = new Map<string, string>();
  for (const m of mappings) {
    if (!m?.url || !m?.localPath) continue;
    map.set(m.url.trim(), m.localPath.trim());
  }

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) return NextResponse.json({ error: 'no db' }, { status: 500 });
  const sql = postgres(DATABASE_URL, { ssl: 'require', max: 3, connect_timeout: 15 });

  let productsCoverUpdated = 0;
  let productsGalleryUpdated = 0;
  let articlesCoverUpdated = 0;

  try {
    const products = await sql<
      Array<{
        id: string;
        cover_url?: string | null;
        gallery_urls?: string[] | null;
      }>
    >`select id, cover_url, gallery_urls from content_products`;

    for (const p of products) {
      let newCover: string | null | undefined = p.cover_url;
      let coverChanged = false;
      if (p.cover_url) {
        const mapped = map.get(p.cover_url.trim());
        if (mapped && mapped !== p.cover_url) {
          newCover = mapped;
          coverChanged = true;
        }
      }
      let newGallery = p.gallery_urls;
      let galleryChanged = false;
      if (Array.isArray(p.gallery_urls) && p.gallery_urls.length) {
        const mappedList = p.gallery_urls.map((g) => {
          const m = map.get(g.trim());
          if (m && m !== g) {
            galleryChanged = true;
            return m;
          }
          return g;
        });
        if (galleryChanged) newGallery = mappedList;
      }
      if (coverChanged || galleryChanged) {
        await sql`
          update content_products
          set cover_url = ${(newCover ?? '') as string},
              gallery_urls = ${newGallery as any},
              updated_at = now()
          where id = ${p.id}
        `;
        if (coverChanged) productsCoverUpdated++;
        if (galleryChanged) productsGalleryUpdated++;
      }
    }

    const articles = await sql<Array<{ id: string; cover_url?: string | null }>>`
      select id, cover_url from content_articles
    `;
    for (const a of articles) {
      if (a.cover_url) {
        const mapped = map.get(a.cover_url.trim());
        if (mapped && mapped !== a.cover_url) {
          await sql`update content_articles set cover_url = ${mapped}, updated_at = now() where id = ${a.id}`;
          articlesCoverUpdated++;
        }
      }
    }

    const report = {
      received: mappings.length,
      uniqueUrls: map.size,
      productsCoverUpdated,
      productsGalleryUpdated,
      articlesCoverUpdated,
    };

    // 顺便提交一次 sitemap（DB 改动不影响 sitemap，但 force resubmit 留个干净记录）
    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err), mappings }, { status: 500 });
  } finally {
    await sql.end({ timeout: 5 });
  }
}
