import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getCurrentSiteKey } from '@/lib/site';
import { zhText } from '@/lib/zh-hant';
import { getSiteProfile } from '@/lib/site-profile';
import { getReadyStockProducts, getFeatures } from '@/lib/content';

// 海外站组件
import Hero from '@/components/Hero';
import Advantages from '@/components/Advantages';
import ProductShowcase from '@/components/ProductShowcase';
import FactorySection from '@/components/FactorySection';
import ChenghaiHeritage from '@/components/ChenghaiHeritage';
import Services from '@/components/Services';
import ProcessTimeline from '@/components/ProcessTimeline';
import CTA from '@/components/CTA';
import FloatingContact from '@/components/FloatingContact';

// 国内站组件
import ChinaHero from '@/components/china/ChinaHero';
import ChinaAdvantages from '@/components/china/ChinaAdvantages';
import ChinaProducts from '@/components/china/ChinaProducts';
import ChinaFactory from '@/components/china/ChinaFactory';
import ChenghaiHistory from '@/components/china/ChenghaiHistory';
import ChinaServices from '@/components/china/ChinaServices';
import ChinaProcess from '@/components/china/ChinaProcess';
import ChinaCTA from '@/components/china/ChinaCTA';

// 仅非中文locale显示的组件
import ReadyStock from '@/components/ReadyStock';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const siteKey = await getCurrentSiteKey();
  const t = await getTranslations({ locale, namespace: 'metadata' });

  if (siteKey === 'china') {
    return {
      title: '亚裕鸿毛织厂 - 专业毛衣OEM/ODM定制 | 汕头澄海源头工厂',
      description: '亚裕鸿毛织厂，20年毛织经验，专业提供毛衣OEM贴牌、ODM设计开发、来图来样定制服务。300+台电脑横机，月产能100万件，MOQ 50件起订，7天快速打样。',
      keywords: '毛衫厂,毛衣定制,毛织厂,澄海毛织厂,汕头毛织厂,毛衣OEM,毛衣ODM,来样加工,小单快反,毛衫加工厂',
    };
  }
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: zhText(
      locale,
      '毛织厂,针织厂,毛衣定制,快时尚毛衫,汕头毛织厂,澄海毛织厂,女装毛衫,童装毛衣,男装毛衣',
      'knitwear manufacturer, sweater factory, custom knitwear, fast fashion sweaters, womens sweaters, kids sweaters, mens sweaters, China knitwear factory',
    ),
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const siteKey = await getCurrentSiteKey();

  // 国内站：独立版式
  if (siteKey === 'china') {
    return (
      <>
        <ChinaHero />
        <ChinaAdvantages />
        <ChinaProducts />
        <ChinaFactory />
        <ChenghaiHistory />
        <ChinaServices />
        <ChinaProcess />
        <ChinaCTA />
      </>
    );
  }

  // 海外站：读取数据库数据（全部 try-catch，失败用兜底）
  let readyStockProducts: Awaited<ReturnType<typeof getReadyStockProducts>> = [];
  let homeFeatures: Awaited<ReturnType<typeof getFeatures>> = [];
  let siteProfile: Awaited<ReturnType<typeof getSiteProfile>> = null;

  try {
    [readyStockProducts, homeFeatures, siteProfile] = await Promise.all([
      getReadyStockProducts(),
      getFeatures('home'),
      getSiteProfile(),
    ]);
  } catch (err) {
    console.error('HomePage: failed to fetch data from DB, using fallbacks', err);
  }

  // 从 site_profile 提取 hero badges
  const heroBadges = siteProfile?.hero_config?.trust_texts && Array.isArray(siteProfile.hero_config.trust_texts)
    ? siteProfile.hero_config.trust_texts
    : undefined;

  // 从 site_profile 提取 stats
  const heroStats = siteProfile?.stats
    ? {
        years: siteProfile.stats.years,
        dailyCapacity: siteProfile.stats.daily_capacity,
        moq: siteProfile.stats.moq,
        delivery: siteProfile.stats.delivery_days,
      }
    : undefined;

  // 准备 advantages items
  const advantageItems = homeFeatures.length > 0
    ? homeFeatures.map((f) => ({
        icon: f.icon,
        title: f.title,
        desc: f.desc,
      }))
    : undefined;

  // 准备 ready stock products
  const readyStockItems = readyStockProducts.length > 0
    ? readyStockProducts.map((p) => ({
        code: p.code,
        image_url: p.image_url,
        label: p.label,
      }))
    : undefined;

  const whatsappNumber = siteProfile?.contact?.whatsapp || undefined;

  // 海外站：原版式
  return (
    <>
      <Hero badges={heroBadges} stats={heroStats} />
      <Advantages items={advantageItems} />
      <ProductShowcase />
      {locale !== 'zh' && <ReadyStock products={readyStockItems} />}
      <FactorySection />
      <ChenghaiHeritage />
      <Services />
      <ProcessTimeline />
      <CTA />
      <FloatingContact whatsappNumber={whatsappNumber} />
    </>
  );
}
