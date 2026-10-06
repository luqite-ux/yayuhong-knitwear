import { NextRequest, NextResponse } from 'next/server';
import { sql, deepParseJson } from '@/lib/db';
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

  const parsedProducts = deepParseJson(products) as Array<{
    id: string;
    slug: string;
    name: Record<string, string>;
    summary: Record<string, string>;
    cover_url: string;
    gallery_urls: string[] | null;
    model: string;
    is_active: boolean;
    sort: number;
    category_slug: string;
  }>;

  const parsedCategories = deepParseJson(categories) as Array<{
    id: string;
    slug: string;
    name: Record<string, string>;
    sort: number;
  }>;

  const result = parsedProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: localizeText(p.name, locale),
    summary: localizeText(p.summary, locale),
    coverUrl: p.cover_url,
    galleryUrls: p.gallery_urls || [],
    model: p.model,
    categorySlug: p.category_slug,
  }));

  const catResult = parsedCategories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: localizeText(c.name, locale),
    sort: c.sort,
  }));

  return NextResponse.json({ products: result, categories: catResult });
}
