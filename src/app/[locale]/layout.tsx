import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { isRTL, LOCALES } from '@/lib/i18n';
import { zhText } from '@/lib/zh-hant';
import { getCurrentSiteKey } from '@/lib/site';
import { getChinaSeoConfig, getChinaSeoMetas } from '@/lib/china-seo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChinaHeader from '@/components/china/ChinaHeader';
import ChinaFooter from '@/components/china/ChinaFooter';
import ChinaSeoHead from '@/components/china/ChinaSeoHead';
import ChinaGeoFooter from '@/components/china/ChinaGeoFooter';
import Ga4Script from '@/components/Ga4Script';
import SiteUrlNormalizer from '@/components/SiteUrlNormalizer';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const OG_LOCALES: Record<string, string> = {
  zh: 'zh_CN',
  'zh-TW': 'zh_TW',
  en: 'en_US',
  ru: 'ru_RU',
  es: 'es_ES',
  de: 'de_DE',
  fr: 'fr_FR',
  pt: 'pt_PT',
  ja: 'ja_JP',
  ar: 'ar_SA',
};

function hreflang(locale: string) {
  if (locale === 'zh') return 'zh-CN';
  if (locale === 'zh-TW') return 'zh-Hant';
  return locale;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const siteKey = await getCurrentSiteKey();

  // 国内站独立元数据
  if (siteKey === 'china') {
    const seoConfig = await getChinaSeoConfig();
    const seoMetas = getChinaSeoMetas(seoConfig as Record<string, unknown>);
    const other: Record<string, string> = {};
    for (const m of seoMetas) {
      if (m.name && m.content) {
        other[m.name] = m.content;
      }
    }

    return {
      title: {
        default: '亚裕鸿毛织厂 - 专业毛衣OEM/ODM定制 | 汕头澄海源头工厂',
        template: '%s | 亚裕鸿毛织厂',
      },
      description: '亚裕鸿毛织厂，20年毛织经验，专业提供毛衣OEM贴牌、ODM设计开发、来图来样定制服务。300+台电脑横机，月产能100万件，MOQ 50件起订，7天快速打样。',
      keywords: '毛衫厂,毛衣定制,毛织厂,澄海毛织厂,汕头毛织厂,毛衣OEM,毛衣ODM,来样加工,小单快反,毛衫加工厂',
      alternates: {
        canonical: 'https://xiuyumaoshan.cn',
      },
      openGraph: {
        title: '亚裕鸿毛织厂 - 专业毛衣OEM/ODM定制',
        description: '20年毛织经验，源头工厂直供，OEM/ODM/来图来样一站式服务',
        type: 'website',
        locale: 'zh_CN',
        url: 'https://xiuyumaoshan.cn',
        siteName: '亚裕鸿毛织厂',
      },
      other,
    };
  }

  // 海外站
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com';
  const ogLocale = OG_LOCALES[locale] || 'en_US';
  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    keywords: zhText(
      locale,
      '毛织厂,毛衫加工,毛衣定制,澄海毛织,快时尚毛衫,源头工厂,ODM,OEM,小单快反',
      'knitwear manufacturer, sweater factory, custom knitwear, China sweater supplier, OEM knitwear, ODM sweater, fast fashion, small MOQ',
    ),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: Object.fromEntries(
        LOCALES.map((l) => [hreflang(l), `${baseUrl}/${l}`]),
      ),
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: ogLocale,
      url: `${baseUrl}/${locale}`,
      siteName: 'Yayuhong Knitwear',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const siteKey = await getCurrentSiteKey();

  const messages = await getMessages();
  const dir = isRTL(locale) ? 'rtl' : 'ltr';
  const isChina = siteKey === 'china';
  const htmlLang = locale === 'zh' ? 'zh-Hans' : locale === 'zh-TW' ? 'zh-Hant' : locale;

  return (
    <html lang={htmlLang} dir={dir} suppressHydrationWarning>
      <body className={`min-h-screen flex flex-col ${isChina ? 'bg-white' : 'bg-[var(--color-cream)]'}`}>
        <NextIntlClientProvider messages={messages}>
          <SiteUrlNormalizer />
          {isChina && <ChinaSeoHead />}
          {!isChina && <Ga4Script />}
          {isChina ? <ChinaHeader /> : <Header />}
          <main className="flex-1">{children}</main>
          {isChina ? <ChinaFooter /> : <Footer />}
          {isChina && <ChinaGeoFooter />}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
