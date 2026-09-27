import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { detectSiteKey } from '@/lib/site';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

const ALL_LOCALES = ['zh', 'en', 'ru', 'es', 'de', 'fr', 'pt', 'ja', 'ar'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = h.get('host') || '';
  const siteKey = detectSiteKey(host);

  const isChina = siteKey === 'china';
  const baseUrl = isChina
    ? 'https://xiuyumaoshan.cn'
    : (process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com');

  // 静态路由
  const staticRoutes = [
    { path: '', priority: 1, changefreq: 'weekly' as const },
    { path: '/products', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/factory', priority: 0.7, changefreq: 'monthly' as const },
    { path: '/services', priority: 0.8, changefreq: 'monthly' as const },
    { path: '/contact', priority: 0.6, changefreq: 'monthly' as const },
    { path: '/faq', priority: 0.5, changefreq: 'monthly' as const },
    { path: '/articles', priority: 0.7, changefreq: 'weekly' as const },
  ];

  // 文章列表
  const articles = await sql`
    select slug, updated_at, published_at
    from content_articles
    where status = 'published'
      and sites && array['global', ${siteKey}]::text[]
    order by published_at desc
  `;

  const entries: MetadataRoute.Sitemap = [];

  if (isChina) {
    // 国内站：无 locale 前缀，只有中文
    for (const route of staticRoutes) {
      entries.push({
        url: `${baseUrl}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changefreq,
        priority: route.priority,
      });
    }
    for (const a of articles) {
      entries.push({
        url: `${baseUrl}/articles/${a.slug}`,
        lastModified: a.updated_at || a.published_at || new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  } else {
    // 海外站：多语言 locale 前缀
    const locales = ALL_LOCALES;
    for (const route of staticRoutes) {
      entries.push({
        url: `${baseUrl}/zh${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changefreq,
        priority: route.priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((locale) => [locale, `${baseUrl}/${locale}${route.path}`]),
          ),
        },
      });
    }
    for (const a of articles) {
      entries.push({
        url: `${baseUrl}/zh/articles/${a.slug}`,
        lastModified: a.updated_at || a.published_at || new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((locale) => [locale, `${baseUrl}/${locale}/articles/${a.slug}`]),
          ),
        },
      });
    }
  }

  return entries;
}
