import { NextRequest, NextResponse } from 'next/server';
import { sql, deepParseJson } from '@/lib/db';
import { localizeText } from '@/lib/zh-hant';
import { detectSiteKey } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get('locale') || 'en';
  const host = req.headers.get('host') || '';
  const siteKey = detectSiteKey(host);
  const siteParam = searchParams.get('site');
  const effectiveSite = siteParam || siteKey;

  const rows = await sql`
    select
      id, slug, title, excerpt, content_html, meta_description, cover_url,
      supporting_keywords, faq_schema, article_schema, published_at, locale
    from content_articles
    where slug = ${slug} and status = 'published'
      and sites && array['global', ${effectiveSite}]::text[]
    limit 1
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  }

  const a = deepParseJson(rows[0]) as {
    id: string;
    slug: string;
    title: Record<string, string>;
    excerpt: Record<string, string>;
    content_html: Record<string, string>;
    meta_description: Record<string, string>;
    cover_url: string;
    supporting_keywords: string[];
    faq_schema: unknown;
    article_schema: unknown;
    published_at: string;
    locale: string;
  };
  return NextResponse.json({
    article: {
      id: a.id,
      slug: a.slug,
      title: localizeText(a.title, locale),
      excerpt: localizeText(a.excerpt, locale),
      contentHtml: localizeText(a.content_html, locale),
      metaDescription: localizeText(a.meta_description, locale),
      coverUrl: a.cover_url,
      supportingKeywords: a.supporting_keywords || [],
      faqSchema: a.faq_schema,
      articleSchema: a.article_schema,
      publishedAt: a.published_at,
      locale: a.locale,
    },
  });
}
