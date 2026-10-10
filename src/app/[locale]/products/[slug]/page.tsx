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
    <div className="pt-28 pb-12 bg-[var(--color-cream)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">
          {productName}
        </h1>
        <p className="text-gray-600 mt-4">{summary}</p>
        <img src={product.cover_url} alt={productName} className="w-64 h-64 object-cover mt-4 rounded-lg" />
      </div>
    </div>
  );
  } catch (err) {
    console.error('Error in product detail page:', err);
    notFound();
  }
}
