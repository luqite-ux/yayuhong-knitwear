import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { pick } from '@/lib/i18n';
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

  const a = rows[0];
  return NextResponse.json({
    article: {
      id: a.id,
      slug: a.slug,
      title: pick(a.title as Record<string, string>, locale),
      excerpt: pick(a.excerpt as Record<string, string>, locale),
      contentHtml: pick(a.content_html as Record<string, string>, locale),
      metaDescription: pick(a.meta_description as Record<string, string>, locale),
      coverUrl: a.cover_url,
      supportingKeywords: a.supporting_keywords || [],
      faqSchema: a.faq_schema,
      articleSchema: a.article_schema,
      publishedAt: a.published_at,
      locale: a.locale,
    },
  });
}
