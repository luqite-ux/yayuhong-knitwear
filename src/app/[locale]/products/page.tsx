import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { sql, deepParseJson } from '@/lib/db';
import { getCurrentSiteKey } from '@/lib/site';
import { zhText } from '@/lib/zh-hant';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'products' });
  return { title: t('title') + ' - Yayuhong Knitwear', description: t('subtitle') };
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const siteKey = await getCurrentSiteKey();

  let products: any[] = [];
  let errorMsg = '';

  try {
    const rows = await sql`
      select p.id, p.model, p.name, p.cover_url, c.slug as category_slug
      from content_products p
      left join content_categories c on p.category_id = c.id
      where p.is_active = true
        and p.sites && array['global', ${siteKey}]::text[]
      order by p.sort, p.created_at
      limit 30
    `;
    products = rows.map((p: any) => ({
      ...p,
      name: deepParseJson(p.name) as Record<string, string>,
    }));
  } catch (e: any) {
    errorMsg = e?.message || String(e);
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-4">Products Test</h1>
        <p className="mb-4">Total loaded: {products.length}</p>
        {errorMsg && <p className="text-red-500 mb-4">Error: {errorMsg}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-lg p-3 border">
              <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
                {p.cover_url && (
                  <img src={p.cover_url} alt={p.name?.en || p.model} className="w-full h-full object-cover" />
                )}
              </div>
              <p className="text-sm font-medium truncate">{p.name?.en || p.model}</p>
              <p className="text-xs text-gray-500">{p.category_slug}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
