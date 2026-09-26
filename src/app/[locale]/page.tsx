import { setRequestLocale, getTranslations } from 'next-intl/server';
import Hero from '@/components/Hero';
import Advantages from '@/components/Advantages';
import ProductShowcase from '@/components/ProductShowcase';
import FactorySection from '@/components/FactorySection';
import Services from '@/components/Services';
import ProcessTimeline from '@/components/ProcessTimeline';
import CTA from '@/components/CTA';
import FloatingContact from '@/components/FloatingContact';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: locale === 'zh' 
      ? '毛织厂,针织厂,毛衣定制,快时尚毛衫,汕头毛织厂,澄海毛织厂,女装毛衫,童装毛衣,男装毛衣'
      : 'knitwear manufacturer, sweater factory, custom knitwear, fast fashion sweaters, womens sweaters, kids sweaters, mens sweaters, China knitwear factory',
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  return (
    <>
      <Hero />
      <Advantages />
      <ProductShowcase />
      <FactorySection />
      <Services />
      <ProcessTimeline />
      <CTA />
      <FloatingContact />
    </>
  );
}
