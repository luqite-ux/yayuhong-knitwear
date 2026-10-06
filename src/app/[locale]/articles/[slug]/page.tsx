import { setRequestLocale } from 'next-intl/server';
import { sql, deepParseJson } from '@/lib/db';
import { localizeText } from '@/lib/zh-hant';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSiteKey } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale } = await params;
  const siteKey = await getCurrentSiteKey();
  const rows = await sql`
    select title, meta_description, excerpt, cover_url
    from content_articles
    where slug = ${slug} and status = 'published'
      and sites && array['global', ${siteKey}]::text[]
    limit 1
  `;
  if (rows.length === 0) return {};
  const a = deepParseJson(rows[0]) as {
    title: Record<string, string>;
    meta_description: Record<string, string>;
    excerpt: Record<string, string>;
    cover_url: string;
  };
  const title = localizeText(a.title, locale);
  const desc = localizeText(a.meta_description, locale) ||
    localizeText(a.excerpt, locale);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com';

  return {
    title,
    description: desc,
    alternates: { canonical: `${baseUrl}/${locale}/articles/${slug}` },
    openGraph: {
      title,
      description: desc,
      type: 'article',
      url: `${baseUrl}/${locale}/articles/${slug}`,
      images: a.cover_url ? [{ url: a.cover_url }] : undefined,
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const siteKey = await getCurrentSiteKey();

  const rows = await sql`
    select slug, title, excerpt, content_html, meta_description, cover_url,
           supporting_keywords, faq_schema, article_schema, published_at, locale as article_locale
    from content_articles
    where slug = ${slug} and status = 'published'
      and sites && array['global', ${siteKey}]::text[]
    limit 1
  `;

  if (rows.length === 0) notFound();

  const a = deepParseJson(rows[0]) as {
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
    article_locale: string;
  };

  const title = localizeText(a.title, locale);
  const contentHtml = localizeText(a.content_html, locale);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com';

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    ...(a.article_schema as object),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: `${baseUrl}/${locale}/articles` },
      { '@type': 'ListItem', position: 3, name: title, item: `${baseUrl}/${locale}/articles/${slug}` },
    ],
  };

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {a.faq_schema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(a.faq_schema) }} />
      )}

      <nav className="text-sm text-gray-400 mb-6">
        <Link href={`/${locale}`} className="hover:text-gray-600">Home</Link>
        {' / '}
        <Link href={`/${locale}/articles`} className="hover:text-gray-600">Articles</Link>
      </nav>

      {a.cover_url && (
        <img src={a.cover_url} alt={title} className="w-full aspect-video object-cover rounded-2xl mb-8" />
      )}

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h1>

      {a.published_at && (
        <time className="text-sm text-gray-400 mb-6 block">
          {new Date(a.published_at).toLocaleDateString(locale)}
        </time>
      )}

      <div
        className="prose prose-lg max-w-none [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_p]:text-gray-600 [&_p]:leading-relaxed [&_img]:rounded-xl [&_a]:text-blue-600 [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {Array.isArray(a.supporting_keywords) && a.supporting_keywords.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-400 mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {a.supporting_keywords.map((kw, i) => (
              <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">{kw}</span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
