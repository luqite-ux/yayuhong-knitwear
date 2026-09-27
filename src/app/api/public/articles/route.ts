import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { pick } from '@/lib/i18n';
import { detectSiteKey } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get('locale') || 'en';
  const host = req.headers.get('host') || '';
  const siteKey = detectSiteKey(host);
  const siteParam = searchParams.get('site');
  const effectiveSite = siteParam || siteKey;

  const articles = await sql`
    select id, slug, title, excerpt, cover_url, published_at, locale
    from content_articles
    where status = 'published'
      and sites && array['global', ${effectiveSite}]::text[]
    order by published_at desc
  `;

  const result = articles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: pick(a.title as Record<string, string>, locale),
    excerpt: pick(a.excerpt as Record<string, string>, locale),
    coverUrl: a.cover_url,
    publishedAt: a.published_at,
    locale: a.locale,
  }));

  return NextResponse.json({ articles: result });
}
