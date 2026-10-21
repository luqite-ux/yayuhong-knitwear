import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getCurrentSiteKey } from '@/lib/site';
import { zhText } from '@/lib/zh-hant';
import { sql, deepParseJson } from '@/lib/db';

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

  // 越南站：拉取越南专属产品（与内页 /products 一致），首页展示越南本土产品图
  const isVn = locale === 'vn';
  let vnFeaturedProducts: Array<{
    slug: string;
    name: Record<string, string>;
    model: string;
    cover_url: string;
  }> = [];
  let vnCategories: Array<{
    slug: string;
    name: Record<string, string>;
    cover: string;
    count: number;
  }> = [];

  if (isVn) {
    try {
      const [prodRows, catRows] = await Promise.all([
        sql`
          select slug, name, model, cover_url
          from content_products
          where is_active = true and slug like 'vn-%'
          order by sort, created_at
          limit 6
        `,
        sql`
          select c.slug, c.name,
                 (select cover_url from content_products p
                  where p.category_id = c.id and p.is_active = true and p.slug like 'vn-%'
                  order by p.sort, p.created_at limit 1) as cover,
                 (select count(*)::int from content_products p
                  where p.category_id = c.id and p.is_active = true and p.slug like 'vn-%') as count
          from content_categories c
          where c.slug like 'vn-%'
          order by c.sort, c.created_at
        `,
      ]);

      vnFeaturedProducts = (prodRows as any[]).map((p) => ({
        slug: p.slug,
        model: p.model,
        cover_url: p.cover_url,
        name: deepParseJson(p.name) as Record<string, string>,
      }));

      vnCategories = (catRows as any[])
        .filter((c) => c.count > 0 && c.cover)
        .map((c) => ({
          slug: c.slug,
          cover: c.cover,
          count: Number(c.count),
          name: deepParseJson(c.name) as Record<string, string>,
        }));
    } catch (err) {
      console.error('Failed to load Vietnam homepage products:', err);
    }
  }

  // 海外站：原版式
  return (
    <>
      <Hero />
      <Advantages />
      <ProductShowcase vnCategories={isVn ? vnCategories : undefined} />
      {locale !== 'zh' && <ReadyStock vnProducts={isVn ? vnFeaturedProducts : undefined} />}
      <FactorySection />
      <ChenghaiHeritage />
      <Services />
      <ProcessTimeline />
      <CTA />
      <FloatingContact />
    </>
  );
}
