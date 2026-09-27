import { sql } from '@/lib/db';
import { pick } from '@/lib/i18n';
import CategoriesManager from '@/components/admin/CategoriesManager';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await sql`
    select c.*, p.name as parent_name
    from content_categories c
    left join content_categories p on c.parent_id = p.id
    order by c.sort, c.created_at
  `;

  const list = categories.map((c) => ({
    ...c,
    name_text: pick(c.name as Record<string, string>, 'zh'),
    parent_name_text: c.parent_name ? pick(c.parent_name as Record<string, string>, 'zh') : '',
  })) as any[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">分类管理</h1>
      <CategoriesManager categories={list} />
    </div>
  );
}
