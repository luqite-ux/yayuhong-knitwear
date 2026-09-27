import Link from 'next/link';
import { sql } from '@/lib/db';
import { pick } from '@/lib/i18n';

// 默认产品（数据库不可用时展示）
const DEFAULT_PRODUCTS = [
  { id: 1, slug: 'womens-sweater', name: { zh: '女装毛衫' }, cover_url: '', model: 'W001' },
  { id: 2, slug: 'kids-sweater', name: { zh: '童装毛衣' }, cover_url: '', model: 'K001' },
  { id: 3, slug: 'mens-sweater', name: { zh: '男装针织' }, cover_url: '', model: 'M001' },
  { id: 4, slug: 'cardigan', name: { zh: '开衫外套' }, cover_url: '', model: 'C001' },
  { id: 5, slug: 'dress', name: { zh: '针织连衣裙' }, cover_url: '', model: 'D001' },
  { id: 6, slug: 'hoodie', name: { zh: '连帽卫衣' }, cover_url: '', model: 'H001' },
  { id: 7, slug: 'vest', name: { zh: '针织马甲' }, cover_url: '', model: 'V001' },
  { id: 8, slug: 'scarf', name: { zh: '围巾配饰' }, cover_url: '', model: 'S001' },
];

export default async function ChinaProducts() {
  let products: Array<{
    id: number;
    slug: string;
    name: Record<string, string> | string;
    cover_url: string | null;
    model?: string;
  }> = [];

  try {
    if (process.env.DATABASE_URL) {
      products = await sql`
        select p.id, p.slug, p.name, p.summary, p.cover_url, p.model
        from content_products p
        where p.is_active = true
          and p.sites && array['global', 'china']::text[]
        order by p.sort, p.created_at desc
        limit 8
      ` as any;
    }
  } catch (e) {
    console.error('获取产品列表失败，使用默认值:', e);
  }

  if (products.length === 0) {
    products = DEFAULT_PRODUCTS as any;
  }

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
