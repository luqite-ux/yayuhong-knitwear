import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { detectSiteKey } from '@/lib/site';
import { sql } from '@/lib/db';
import { LOCALES } from '@/lib/i18n';
import { hreflangCode, GLOBAL_SITE_URL, CHINA_SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

function languageAlternates(path: string, includeVn: boolean) {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    if (locale === 'vn' && !includeVn) continue;
    languages[hreflangCode(locale)] = `${GLOBAL_SITE_URL}/${locale}${path}`;
  }
  languages['x-default'] = `${GLOBAL_SITE_URL}/en${path}`;
  return languages;
}

function lastModified(value: unknown): Date | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = h.get('host') || '';
  const siteKey = detectSiteKey(host);

  const isChina = siteKey === 'china';
  const baseUrl = isChina ? CHINA_SITE_URL : GLOBAL_SITE_URL;

  // 静态路由（lastmod 不填：这类页面没有真实更新时间，避免每次请求都变化被 Google 忽略）
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

  // 产品分类（越南站分类单独处理，不混入其他语言版本）
  const categories = await sql`
    select slug, updated_at
    from content_categories
    where slug not like 'vn-%'
    order by sort, created_at
  `;

  // 产品列表（同上，vn-% 仅属于越南语版本）
  const products = await sql`
    select slug, updated_at
    from content_products
    where is_active = true
      and slug not like 'vn-%'
      and sites && array['global', ${siteKey}]::text[]
    order by created_at desc
  `;

  const vnCategories = isChina
    ? []
    : await sql`
        select slug, updated_at
        from content_categories
        where slug like 'vn-%'
        order by sort, created_at
      `;

  const vnProducts = isChina
    ? []
    : await sql`
        select slug, updated_at
        from content_products
        where is_active = true
          and slug like 'vn-%'
        order by created_at desc
      `;

  const entries: MetadataRoute.Sitemap = [];

  if (isChina) {
    // 国内站：无 locale 前缀，只有中文
    for (const route of staticRoutes) {
      entries.push({
        url: `${baseUrl}${route.path}`,
        changeFrequency: route.changefreq,
        priority: route.priority,
      });
    }

    for (const cat of categories) {
      entries.push({
        url: `${baseUrl}/products/category/${cat.slug}`,
        lastModified: lastModified(cat.updated_at),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    for (const p of products) {
      entries.push({
        url: `${baseUrl}/products/${p.slug}`,
        lastModified: lastModified(p.updated_at),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }

    for (const a of articles) {
      entries.push({
        url: `${baseUrl}/articles/${a.slug}`,
        lastModified: lastModified(a.updated_at || a.published_at),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  } else {
    // 海外站：以英文为主条目（x-default 指向 /en），其他语言通过 hreflang 关联
    for (const route of staticRoutes) {
      entries.push({
        url: `${baseUrl}/en${route.path}`,
        changeFrequency: route.changefreq,
        priority: route.priority,
        alternates: { languages: languageAlternates(route.path, true) },
      });
    }

    // 分类页（全球分类只出现在非越南语版本）
    for (const cat of categories) {
      const path = `/products/category/${cat.slug}`;
      entries.push({
        url: `${baseUrl}/en${path}`,
        lastModified: lastModified(cat.updated_at),
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: { languages: languageAlternates(path, false) },
      });
    }

    // 产品详情页（全球产品只出现在非越南语版本）
    for (const p of products) {
      const path = `/products/${p.slug}`;
      entries.push({
        url: `${baseUrl}/en${path}`,
        lastModified: lastModified(p.updated_at),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: { languages: languageAlternates(path, false) },
      });
    }

    // 越南语版本专属分类与产品（仅 vn，不声明其他语言版本）
    for (const cat of vnCategories) {
      entries.push({
        url: `${baseUrl}/vn/products/category/${cat.slug}`,
        lastModified: lastModified(cat.updated_at),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    for (const p of vnProducts) {
      entries.push({
        url: `${baseUrl}/vn/products/${p.slug}`,
        lastModified: lastModified(p.updated_at),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }

    for (const a of articles) {
      const path = `/articles/${a.slug}`;
      entries.push({
        url: `${baseUrl}/en${path}`,
        lastModified: lastModified(a.updated_at || a.published_at),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: { languages: languageAlternates(path, true) },
      });
    }
  }

  return entries;
}
