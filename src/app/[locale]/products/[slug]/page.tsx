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
  try {
    const { slug, locale } = await params;
    const siteKey = await getCurrentSiteKey();
    const t = await getTranslations({ locale, namespace: 'products' });

    const isVn = locale === 'vn';
    const rows = isVn
      ? await sql`
          select p.name, p.summary, p.cover_url, p.detail_html,
                 p.model, c.slug as category_slug, c.name as category_name
          from content_products p
          left join content_categories c on p.category_id = c.id
          where p.slug = ${slug} and p.is_active = true
            and (p.slug like 'vn-%' or p.sites && array['global', ${siteKey}]::text[])
          limit 1
        `
      : await sql`
          select p.name, p.summary, p.cover_url, p.detail_html,
                 p.model, c.slug as category_slug, c.name as category_name
          from content_products p
          left join content_categories c on p.category_id = c.id
          where p.slug = ${slug} and p.is_active = true
            and p.sites && array['global', ${siteKey}]::text[]
          limit 1
        `;

    if (rows.length === 0) return {};

    const p = deepParseJson(rows[0]) as {
      name: Record<string, string>;
      summary: Record<string, string>;
      cover_url: string;
      detail_html: Record<string, string>;
      model: string;
      category_slug: string;
      category_name: Record<string, string>;
    };

    const productName = localizeText(p.name, locale);
    const categoryName = localizeText(p.category_name, locale);
    const summary = localizeText(p.summary, locale);
    const metaDesc = zhText(
      locale,
      '专业针织服装厂，20年经验，支持OEM/ODM定制',
      'Professional knitwear manufacturer with 20 years experience. OEM/ODM custom service',
    );
    const description = summary || `${productName} - ${metaDesc} - ${categoryName}. MOQ 50 pcs, 7-day delivery.`;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com';
  const productUrl = `${baseUrl}/${locale}/products/${slug}`;

  const isChina = siteKey === 'china';
  const locales = isChina ? [] : [...LOCALES];

  return {
    title: `${productName} - ${categoryName} | Yayuhong Knitwear`,
    description,
    keywords: [
      productName,
      categoryName,
      'knitwear manufacturer',
      'sweater factory',
      'custom knitwear',
      'OEM sweater',
      'wholesale sweater',
    ],
    alternates: {
      canonical: productUrl,
      languages: isChina ? undefined : Object.fromEntries(
        locales.map((l) => [hreflang(l), `${baseUrl}/${l}/products/${slug}`]),
      ),
    },
    openGraph: {
      title: `${productName} - ${categoryName}`,
      description,
      type: 'product',
      url: productUrl,
      images: p.cover_url ? [{ url: p.cover_url, width: 1200, height: 630, alt: productName }] : undefined,
      siteName: 'Yayuhong Knitwear',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${productName} - ${categoryName}`,
      description,
      images: p.cover_url ? [p.cover_url] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
  };
  } catch (err) {
    console.error('Error in product detail generateMetadata:', err);
    return {};
  }
}

async function getProduct(slug: string, siteKey: string, locale: string) {
  const isVn = locale === 'vn';
  const rows = isVn
    ? await sql`
        select p.id, p.slug, p.name, p.summary, p.detail_html, p.features,
               p.applications, p.advantages, p.specs, p.model, p.cover_url,
               p.gallery_urls, p.sort, p.updated_at,
               c.id as category_id, c.slug as category_slug, c.name as category_name
        from content_products p
        left join content_categories c on p.category_id = c.id
        where p.slug = ${slug} and p.is_active = true
          and (p.slug like 'vn-%' or p.sites && array['global', ${siteKey}]::text[])
        limit 1
      `
    : await sql`
        select p.id, p.slug, p.name, p.summary, p.detail_html, p.features,
               p.applications, p.advantages, p.specs, p.model, p.cover_url,
               p.gallery_urls, p.sort, p.updated_at,
               c.id as category_id, c.slug as category_slug, c.name as category_name
        from content_products p
        left join content_categories c on p.category_id = c.id
        where p.slug = ${slug} and p.is_active = true
          and p.sites && array['global', ${siteKey}]::text[]
        limit 1
      `;

  if (rows.length === 0) return null;

  return deepParseJson(rows[0]) as {
    id: string;
    slug: string;
    name: Record<string, string>;
    summary: Record<string, string>;
    detail_html: Record<string, string>;
    features: Record<string, string[]>;
    applications: Record<string, string[]>;
    advantages: Record<string, string[]>;
    specs: Record<string, string>;
    model: string;
    cover_url: string;
    gallery_urls: string[];
    sort: number;
    updated_at: string;
    category_id: string;
    category_slug: string;
    category_name: Record<string, string>;
  };
}

async function getRelatedProducts(categoryId: string, excludeId: string, siteKey: string, locale: string, limit = 6) {
  const isVn = locale === 'vn';
  const rows = isVn
    ? await sql`
        select p.slug, p.name, p.cover_url, p.model
        from content_products p
        where p.category_id = ${categoryId}
          and p.id != ${excludeId}
          and p.is_active = true
          and p.slug like 'vn-%'
        order by p.sort, p.created_at
        limit ${limit}
      `
    : await sql`
        select p.slug, p.name, p.cover_url, p.model
        from content_products p
        where p.category_id = ${categoryId}
          and p.id != ${excludeId}
          and p.is_active = true
          and p.sites && array['global', ${siteKey}]::text[]
        order by p.sort, p.created_at
        limit ${limit}
      `;

  return (rows as any[]).map((r) => ({
    slug: r.slug,
    model: r.model,
    cover_url: r.cover_url,
    name: deepParseJson(r.name) as Record<string, string>,
  }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  try {
    const { slug, locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'products' });
    const siteKey = await getCurrentSiteKey();

    const product = await getProduct(slug, siteKey, locale);
    if (!product) notFound();

  const productName = localizeText(product.name, locale);
  const categoryName = localizeText(product.category_name, locale);
  const summary = localizeText(product.summary, locale);
  const detailHtml = localizeText(product.detail_html, locale);
  const features = product.features?.[locale] || product.features?.en || [];
  const applications = product.applications?.[locale] || product.applications?.en || [];
  const advantages = product.advantages?.[locale] || product.advantages?.en || [];
  const specs = product.specs?.[locale] || product.specs?.en || '';

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com';
  const productUrl = `${baseUrl}/${locale}/products/${slug}`;

  const relatedProducts = await getRelatedProducts(product.category_id, product.id, siteKey, locale, 6);

  // Product Schema
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    image: product.cover_url ? [product.cover_url] : undefined,
    description: summary || `${productName} - ${categoryName} from Yayuhong Knitwear factory.`,
    sku: product.model || product.slug,
    brand: {
      '@type': 'Brand',
      name: 'Yayuhong Knitwear',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Yayuhong Knitwear',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'USD',
      price: '0',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      description: zhText(locale, '支持定制，MOQ 50件，7天交货', 'Customizable, MOQ 50 pcs, 7-day delivery'),
    },
    additionalProperty: [
      { '@type': 'PropertyValue', name: zhText(locale, '最小起订量', 'MOQ'), value: '50 pcs' },
      { '@type': 'PropertyValue', name: zhText(locale, '交货时间', 'Delivery Time'), value: '7 days' },
      { '@type': 'PropertyValue', name: zhText(locale, '定制服务', 'Custom Service'), value: 'OEM / ODM / OBM' },
    ],
  };

  // BreadcrumbList Schema
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
        item: `${baseUrl}/${locale}/products/category/${product.category_slug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: productName,
        item: productUrl,
      },
    ],
  };

  const gallery = product.gallery_urls?.length ? product.gallery_urls : [product.cover_url];

  return (
    <>
      {/* JSON-LD removed for hydration debug */}
      <section className="pt-28 pb-12 bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6">
            <Link href={`/${locale}`} className="hover:text-[var(--color-primary)]">
              {zhText(locale, '首页', 'Home')}
            </Link>
            {' / '}
            <Link href={`/${locale}/products`} className="hover:text-[var(--color-primary)]">
              {zhText(locale, '产品中心', 'Products')}
            </Link>
            {' / '}
            <Link href={`/${locale}/products/category/${product.category_slug}`} className="hover:text-[var(--color-primary)]">
              {categoryName}
            </Link>
            {' / '}
            <span className="text-gray-700">{productName}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-[var(--color-border)]">
                <img
                  src={product.cover_url}
                  alt={`${productName} - ${categoryName} - Yayuhong Knitwear Factory`}
                  className="w-full h-full object-cover"
                />
              </div>
              {gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {gallery.slice(0, 4).map((img, i) => (
                    <div key={i} className="aspect-square bg-white rounded-lg overflow-hidden border border-[var(--color-border)]">
                      <img
                        src={img}
                        alt={`${productName} view ${i + 1} - ${categoryName}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <p className="text-sm text-[var(--color-accent)] font-medium mb-2">{categoryName}</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)] mb-4">
                {productName}
              </h1>
              {product.model && (
                <p className="text-sm text-gray-500 mb-4">
                  {zhText(locale, '型号：', 'Model: ')}{product.model}
                </p>
              )}

              {summary && (
                <p className="text-gray-600 mb-6 leading-relaxed">{summary}</p>
              )}

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {zhText(locale, '支持定制', 'Customizable')}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {zhText(locale, '50件起订', 'MOQ 50 pcs')}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {zhText(locale, '7天交货', '7-Day Delivery')}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {zhText(locale, 'OEM/ODM', 'OEM / ODM')}
                </div>
              </div>

              {/* CTA */}
              <div className="flex gap-3 mb-8">
                <Link href="/contact" className="btn-primary flex-1 text-center">
                  {zhText(locale, '获取报价', 'Get Quote')}
                </Link>
                <a
                  href="https://wa.me/8613829659110"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </div>

              {/* Specs */}
              {specs && (
                <div className="bg-white rounded-xl p-5 border border-[var(--color-border)]">
                  <h2 className="font-bold text-lg text-[var(--color-primary)] mb-3">
                    {zhText(locale, '产品规格', 'Specifications')}
                  </h2>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{specs}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Product Details */}
      {(detailHtml || features.length > 0 || advantages.length > 0 || applications.length > 0) && (
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Description */}
            {detailHtml && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6">
                  {zhText(locale, '产品详情', 'Product Description')}
                </h2>
                <div
                  className="prose prose-lg max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: detailHtml }}
                />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Features */}
              {features.length > 0 && (
                <div className="bg-[var(--color-cream)] rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {zhText(locale, '产品特点', 'Key Features')}
                  </h2>
                  <ul className="space-y-2">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600">
                        <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Advantages */}
              {advantages.length > 0 && (
                <div className="bg-[var(--color-cream)] rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {zhText(locale, '我们的优势', 'Why Choose Us')}
                  </h2>
                  <ul className="space-y-2">
                    {advantages.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600">
                        <span className="text-[var(--color-accent)] mt-1 flex-shrink-0">★</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Applications */}
            {applications.length > 0 && (
              <div className="mt-8 bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">
                  {zhText(locale, '应用场景', 'Applications')}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {applications.map((app, i) => (
                    <span key={i} className="px-4 py-2 bg-white rounded-full text-sm text-gray-600 border border-[var(--color-border)]">
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-[var(--color-cream)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-8 text-center">
              {zhText(locale, '相关产品', 'Related Products')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedProducts.map((p) => {
                const name = localizeText(p.name, locale);
                return (
                  <Link
                    key={p.slug}
                    href={`/products/${p.slug}`}
                    className="bg-white rounded-xl overflow-hidden card-hover border border-[var(--color-border)]/50 block group"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={p.cover_url}
                        alt={`${name} - ${categoryName}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-[var(--color-primary)] line-clamp-2 min-h-[2.5rem]">
                        {name}
                      </h3>
                      {p.model && (
                        <p className="text-xs text-gray-400 mt-1">{p.model}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-dark)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {zhText(locale, '对这款产品感兴趣？', 'Interested in this product?')}
          </h2>
          <p className="text-white/70 text-lg mb-8">
            {zhText(locale, '立即联系我们获取报价，支持来图来样定制', 'Get a quote today. Custom design services available.')}
          </p>
          <Link href="/contact" className="btn-primary !bg-white !text-[var(--color-primary)]">
            {zhText(locale, '获取报价', 'Get Quote')}
          </Link>
        </div>
      </section>

      <FloatingContact />
    </>
  );
  } catch (err) {
    console.error('Error in product detail page:', err);
    notFound();
  }
}
