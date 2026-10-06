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

  const rows = await sql`
    select id, slug, title, excerpt, cover_url, published_at, locale
    from content_articles
    where status = 'published'
      and sites && array['global', ${effectiveSite}]::text[]
    order by published_at desc
  `;

  const articles = deepParseJson(rows) as Array<{
    id: string;
    slug: string;
    title: Record<string, string>;
    excerpt: Record<string, string>;
    cover_url: string;
    published_at: string;
    locale: string;
  }>;

  const result = articles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: localizeText(a.title, locale),
    excerpt: localizeText(a.excerpt, locale),
    coverUrl: a.cover_url,
    publishedAt: a.published_at,
    locale: a.locale,
  }));

  return NextResponse.json({ articles: result });
}
