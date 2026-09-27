import Link from 'next/link';
import { sql } from '@/lib/db';
import { pick } from '@/lib/i18n';

export default async function ChinaProducts() {
  const products = await sql`
    select p.id, p.slug, p.name, p.summary, p.cover_url, p.model
    from content_products p
    where p.is_active = true
      and p.sites && array['global', 'china']::text[]
    order by p.sort, p.created_at desc
    limit 8
  `;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <span className="text-amber-600 font-medium text-sm tracking-wider">PRODUCTS</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3">
              产品展示
            </h2>
            <p className="text-slate-500 mt-3">
              女装、童装、男装全品类毛衫，支持来图来样定制
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 font-medium"
          >
            查看全部产品
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            产品即将上线，敬请期待
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all"
              >
                <div className="aspect-[3/4] overflow-hidden bg-slate-50">
                  {p.cover_url ? (
                    <img
                      src={p.cover_url}
                      alt={pick(p.name as Record<string, string>, 'zh')}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm">
                      暂无图片
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors">
                    {pick(p.name as Record<string, string>, 'zh')}
                  </h3>
                  {p.model && (
                    <p className="text-xs text-slate-400">款号：{p.model}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
