import { setRequestLocale, getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function TestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'products' });
  return <div className="p-8"><h1>Test Page Works</h1><p>Locale: {locale}</p><p>Title: {t('hero.title')}</p></div>;
}
