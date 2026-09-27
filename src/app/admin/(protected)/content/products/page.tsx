import { sql } from '@/lib/db';
import { pick } from '@/lib/i18n';
import ProductsManager from '@/components/admin/ProductsManager';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    sql`
      select p.*, c.name as category_name
      from content_products p
      left join content_categories c on p.category_id = c.id
      order by p.sort, p.created_at desc
    `,
    sql`select id, name, slug from content_categories order by sort`,
  ]);

  const productList = products.map((p) => ({
    ...p,
    name_text: pick(p.name as Record<string, string>, 'zh'),
    category_name_text: p.category_name ? pick(p.category_name as Record<string, string>, 'zh') : '',
  })) as any[];

  const categoryList = categories.map((c) => ({
    ...c,
    name_text: pick(c.name as Record<string, string>, 'zh'),
  })) as any[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">产品管理</h1>
      <ProductsManager products={productList} categories={categoryList} />
    </div>
  );
}
