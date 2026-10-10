import { setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function TestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="pt-28 pb-12 bg-[var(--color-cream)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">
          Test Page
        </h1>
        <p className="text-gray-600 mt-4">This is a test page to debug hydration issues.</p>
        <p className="text-gray-500 mt-2">Locale: {locale}</p>
      </div>
    </div>
  );
}
