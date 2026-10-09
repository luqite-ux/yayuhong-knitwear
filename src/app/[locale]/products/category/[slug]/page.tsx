import { setRequestLocale, getTranslations } from 'next-intl/server';
import { sql, deepParseJson } from '@/lib/db';
import { localizeText, zhText } from '@/lib/zh-hant';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getCurrentSiteKey } from '@/lib/site';
import { LOCALES } from '@/lib/i18n';
import FloatingContact from '@/components/FloatingContact';

export const dynamic = 'force-dynamic';

function hreflang(locale: string) {
  if (locale === 'zh') return 'zh-CN';
  if (locale === 'zh-TW') return 'zh-Hant';
  return locale;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale } = await params;
  const siteKey = await getCurrentSiteKey();
  const t = await getTranslations({ locale, namespace: 'products' });

  const rows = await sql`
    select slug, name
    from content_categories
    where slug = ${slug}
    limit 1
  `;

  if (rows.length === 0) return {};

  const cat = deepParseJson(rows[0]) as {
    slug: string;
    name: Record<string, string>;
  };

  const categoryName = localizeText(cat.name, locale);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com';
  const categoryUrl = `${baseUrl}/${locale}/products/category/${slug}`;

  const isChina = siteKey === 'china';
  const locales = isChina ? [] : [...LOCALES];

  const description = zhText(
    locale,
    `${categoryName}批发定制 - 秀裕毛衫20年专业针织毛衣工厂，提供${categoryName}OEM/ODM定制服务，50件起订，7天交货，支持来图来样定制。`,
    `Wholesale ${categoryName.toLowerCase()} - Yayuhong Knitwear, a professional sweater manufacturer with 20 years of experience. OEM/ODM custom ${categoryName.toLowerCase()} service, MOQ 50 pcs, 7-day delivery.`,
  );

  return {
    title: `${categoryName} Wholesale - Custom ${categoryName} Factory | Yayuhong Knitwear`,
    description,
    keywords: [
      categoryName,
      `wholesale ${categoryName.toLowerCase()}`,
      `custom ${categoryName.toLowerCase()}`,
      `${categoryName.toLowerCase()} manufacturer`,
      `${categoryName.toLowerCase()} factory`,
      'knitwear supplier',
      'OEM sweater',
    ],
    alternates: {
      canonical: categoryUrl,
      languages: isChina ? undefined : Object.fromEntries(
        locales.map((l) => [hreflang(l), `${baseUrl}/${l}/products/category/${slug}`]),
      ),
    },
    openGraph: {
      title: `${categoryName} Wholesale - ${categoryName} Factory`,
      description,
      type: 'website',
      url: categoryUrl,
      siteName: 'Yayuhong Knitwear',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryName} Wholesale - ${categoryName} Factory`,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

async function getCategoryWithProducts(slug: string, siteKey: string) {
  const catRows = await sql`
    select id, slug, name, sort
    from content_categories
    where slug = ${slug}
    limit 1
  `;

  if (catRows.length === 0) return null;

  const category = deepParseJson(catRows[0]) as {
    id: string;
    slug: string;
    name: Record<string, string>;
    sort: number;
  };

  const productRows = await sql`
    select slug, name, cover_url, model, summary
    from content_products
    where category_id = ${category.id}
      and is_active = true
      and sites && array['global', ${siteKey}]::text[]
    order by sort, created_at
  `;

  const products = (productRows as any[]).map((p) => ({
    slug: p.slug,
    model: p.model,
    cover_url: p.cover_url,
    name: deepParseJson(p.name) as Record<string, string>,
    summary: deepParseJson(p.summary) as Record<string, string>,
  }));

  return { category, products };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'products' });
  const siteKey = await getCurrentSiteKey();

  const data = await getCategoryWithProducts(slug, siteKey);
  if (!data) notFound();

  const { category, products } = data;
  const categoryName = localizeText(category.name, locale);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com';
  const categoryUrl = `${baseUrl}/${locale}/products/category/${slug}`;

  // CollectionPage schema
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName} - Yayuhong Knitwear`,
    description: zhText(
      locale,
      `${categoryName}批发定制，${products.length}款可选，MOQ 50件`,
      `Wholesale ${categoryName.toLowerCase()}, ${products.length} styles available, MOQ 50 pcs`,
    ),
    url: categoryUrl,
    numberOfItems: products.length,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.slice(0, 10).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${baseUrl}/${locale}/products/${p.slug}`,
        name: localizeText(p.name, locale),
      })),
    },
  };

  // BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: zhText(locale, '首页', 'Home'),
        item: `${baseUrl}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: zhText(locale, '产品中心', 'Products'),
        item: `${baseUrl}/${locale}/products`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: categoryUrl,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="hero-gradient pt-32 pb-20 knit-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-white/60 mb-6">
            <Link href={`/${locale}`} className="hover:text-white">
              {zhText(locale, '首页', 'Home')}
            </Link>
            {' / '}
            <Link href={`/${locale}/products`} className="hover:text-white">
              {zhText(locale, '产品中心', 'Products')}
            </Link>
            {' / '}
            <span className="text-white">{categoryName}</span>
          </nav>

          <div className="text-center text-white">
            <p className="text-white/70 mb-2">
              {zhText(locale, '产品分类', 'Product Category')}
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{categoryName}</h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              {zhText(
                locale,
                `专业${categoryName}工厂，${products.length}款可选，支持OEM/ODM定制，50件起订，7天交货`,
                `Professional ${categoryName.toLowerCase()} manufacturer, ${products.length} styles, OEM/ODM custom service, MOQ 50 pcs, 7-day delivery`,
              )}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/contact" className="btn-primary !bg-white !text-[var(--color-primary)]">
                {zhText(locale, '获取报价', 'Get Quote')}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#faf8f5" />
          </svg>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-16 bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[var(--color-primary)]">
              {zhText(locale, '全部款式', 'All Styles')}
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({products.length} {zhText(locale, '款', 'SKUs')})
              </span>
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {zhText(locale, '暂无产品', 'No products yet')}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((p) => {
                const name = localizeText(p.name, locale);
                const summary = localizeText(p.summary, locale);
                return (
                  <Link
                    key={p.slug}
                    href={`/products/${p.slug}`}
                    className="bg-white rounded-xl overflow-hidden card-hover border border-[var(--color-border)]/50 block group"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={p.cover_url}
                        alt={`${name} - ${categoryName} wholesale`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-[var(--color-primary)] mb-1 line-clamp-2 min-h-[2.75rem]">
                        {name}
                      </h3>
                      {p.model && (
                        <p className="text-xs text-gray-400 mb-2">{p.model}</p>
                      )}
                      {summary && (
                        <p className="text-sm text-gray-500 line-clamp-2">{summary}</p>
                      )}
                      <div className="mt-3 text-sm text-[var(--color-accent)] font-medium group-hover:translate-x-1 transition-transform">
                        {zhText(locale, '查看详情 →', 'View Details →')}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Category Intro */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-4">
                {zhText(
                  locale,
                  `专业${categoryName}定制工厂`,
                  `Professional ${categoryName} Manufacturer`,
                )}
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {zhText(
                  locale,
                  `秀裕毛衫拥有20年${categoryName}生产经验，是一家集设计、生产、销售于一体的专业针织服装工厂。我们支持OEM、ODM、OBM等多种合作模式，从样品开发到大货生产，全程质量把控。`,
                  `Yayuhong Knitwear has 20 years of experience in ${categoryName.toLowerCase()} manufacturing. We are a professional knitwear factory integrating design, production and sales. We support OEM, ODM and ODM cooperation models.`,
                )}
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-green-500">✓</span>
                  {zhText(locale, '20年针织行业经验', '20 years of knitwear experience')}
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-green-500">✓</span>
                  {zhText(locale, 'MOQ 50件起订', 'MOQ starting from 50 pieces')}
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-green-500">✓</span>
                  {zhText(locale, '7天快速打样', '7-day sample development')}
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-green-500">✓</span>
                  {zhText(locale, '支持来图来样定制', 'OEM / ODM / Custom design')}
                </li>
              </ul>
              <Link href="/contact" className="btn-primary inline-block">
                {zhText(locale, '立即咨询', 'Contact Us')}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--color-cream)] rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-[var(--color-primary)] mb-2">20+</div>
                <div className="text-gray-500 text-sm">
                  {zhText(locale, '年行业经验', 'Years Experience')}
                </div>
              </div>
              <div className="bg-[var(--color-cream)] rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-[var(--color-primary)] mb-2">50</div>
                <div className="text-gray-500 text-sm">
                  {zhText(locale, '件起订', 'MOQ (pcs)')}
                </div>
              </div>
              <div className="bg-[var(--color-cream)] rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-[var(--color-primary)] mb-2">7</div>
                <div className="text-gray-500 text-sm">
                  {zhText(locale, '天交货', 'Day Delivery')}
                </div>
              </div>
              <div className="bg-[var(--color-cream)] rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-[var(--color-primary)] mb-2">100%</div>
                <div className="text-gray-500 text-sm">
                  {zhText(locale, '质检合格', 'Quality Control')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-dark)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {zhText(
              locale,
              `需要定制${categoryName}？`,
              `Looking for custom ${categoryName.toLowerCase()}?`,
            )}
          </h2>
          <p className="text-white/70 text-lg mb-8">
            {zhText(
              locale,
              '联系我们获取免费报价，专业团队为您量身打造',
              'Contact us for a free quote. Our professional team can bring your ideas to life.',
            )}
          </p>
          <Link href="/contact" className="btn-primary !bg-white !text-[var(--color-primary)]">
            {zhText(locale, '获取免费报价', 'Get Free Quote')}
          </Link>
        </div>
      </section>

      <FloatingContact />
    </>
  );
}
