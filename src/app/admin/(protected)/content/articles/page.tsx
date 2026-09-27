import { sql } from '@/lib/db';
import { pick } from '@/lib/i18n';
import ArticlesManager from '@/components/admin/ArticlesManager';

export const dynamic = 'force-dynamic';

export default async function ArticlesPage() {
  const articles = await sql`
    select id, slug, title, excerpt, cover_url, status, locale, published_at, source, created_at
    from content_articles
    order by created_at desc
  `;

  const list = articles.map((a) => ({
    ...a,
    title_text: pick(a.title as Record<string, string>, 'zh'),
    excerpt_text: pick(a.excerpt as Record<string, string>, 'zh'),
  })) as any[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">文章管理</h1>
      <ArticlesManager articles={list} />
    </div>
  );
}
