import { sql, deepParseJson } from '@/lib/db';
import { pick } from '@/lib/i18n';
import ArticlesManager from '@/components/admin/ArticlesManager';

export const dynamic = 'force-dynamic';

export default async function ArticlesPage() {
  const rows = await sql`
    select id, slug, title, excerpt, content_html, meta_description, cover_url, status, locale, published_at, source, sites,
           supporting_keywords, faq_schema, article_schema, created_at
    from content_articles
    order by created_at desc
  `;

  const articles = deepParseJson(rows) as any[];

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
