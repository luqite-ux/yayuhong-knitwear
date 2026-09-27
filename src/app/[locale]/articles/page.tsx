import { setRequestLocale, getTranslations } from 'next-intl/server';
import { sql } from '@/lib/db';
import { pick } from '@/lib/i18n';
import { getCurrentSiteKey } from '@/lib/site';
import Link from 'next/link';

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export const dynamic = 'force-dynamic';

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const siteKey = await getCurrentSiteKey();

  const articles = await sql`
    select slug, title, excerpt, cover_url, published_at, locale as article_locale
    from content_articles
    where status = 'published'
      and sites && array['global', ${siteKey}]::text[]
    order by published_at desc
  `;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {locale === 'zh' ? '文章资讯' : locale === 'ru' ? 'Статьи' : 'Articles'}
      </h1>
      <p className="text-gray-500 mb-8">
        {locale === 'zh' ? '行业资讯、采购指南与技术深度分享'
          : locale === 'ru' ? 'Отраслевые статьи, руководства и технический анализ'
          : 'Industry insights, buying guides and technical deep-dives'}
      </p>

      {articles.length === 0 ? (
        <p className="text-gray-400 py-12 text-center">No articles yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/${locale}/articles/${a.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              {a.cover_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={a.cover_url}
                    alt={pick(a.title as Record<string, string>, locale)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {pick(a.title as Record<string, string>, locale)}
                </h2>
                <p className="text-sm text-gray-500 line-clamp-3 mb-3">
                  {pick(a.excerpt as Record<string, string>, locale)}
                </p>
                <div className="flex items-center text-xs text-gray-400">
                  {a.published_at && new Date(a.published_at).toLocaleDateString(locale)}
                  <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
