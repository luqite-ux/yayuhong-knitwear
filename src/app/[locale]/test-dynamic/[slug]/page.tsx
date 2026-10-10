import { setRequestLocale } from 'next-intl/server';
import { sql, deepParseJson } from '@/lib/db';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  try {
    const { slug, locale } = await params;
    return {
      title: `Test: ${slug}`,
      description: `Test page for slug: ${slug}`,
    };
  } catch (e) {
    return {};
  }
}

async function getData(slug: string) {
  const rows = await sql`
    select slug, name
    from content_products
    where slug = ${slug}
    limit 1
  `;
  if (rows.length === 0) return null;
  return deepParseJson(rows[0]) as { slug: string; name: Record<string, string> };
}

export default async function TestDynamicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  try {
    const { slug, locale } = await params;
    setRequestLocale(locale);

    const data = await getData(slug);
    if (!data) notFound();

    const name = data.name?.[locale] || data.name?.en || slug;

    return (
      <div className="pt-28 pb-12 bg-[var(--color-cream)] min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">
            Test Dynamic: {name}
          </h1>
          <p className="text-gray-600 mt-4">Slug: {slug}</p>
          <p className="text-gray-500 mt-2">Locale: {locale}</p>
        </div>
      </div>
    );
  } catch (e) {
    notFound();
  }
}
