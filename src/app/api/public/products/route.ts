import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { localizeText } from '@/lib/zh-hant';
import { detectSiteKey } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get('locale') || 'en';
  const host = req.headers.get('host') || '';
  const siteKey = detectSiteKey(host);
  const siteParam = searchParams.get('site');
  const effectiveSite = siteParam || siteKey;

  const [products, categories] = await Promise.all([
    sql`
      select
        p.id, p.slug, p.name, p.summary, p.cover_url, p.gallery_urls,
        p.model, p.is_active, p.sort,
        c.slug as category_slug
      from content_products p
      left join content_categories c on p.category_id = c.id
      where p.is_active = true
        and p.sites && array['global', ${effectiveSite}]::text[]
      order by p.sort, p.created_at
    `,
    sql`
      select id, slug, name, sort
      from content_categories
      order by sort, created_at
    `,
  ]);

  const result = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: localizeText(p.name as Record<string, string>, locale),
    summary: localizeText(p.summary as Record<string, string>, locale),
    coverUrl: p.cover_url,
    galleryUrls: p.gallery_urls || [],
    model: p.model,
    categorySlug: p.category_slug,
  }));

  const catResult = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: localizeText(c.name as Record<string, string>, locale),
    sort: c.sort,
  }));

  return NextResponse.json({ products: result, categories: catResult });
}
