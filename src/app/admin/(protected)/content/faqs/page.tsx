import { sql } from '@/lib/db';
import { pick } from '@/lib/i18n';
import FaqsManager from '@/components/admin/FaqsManager';

export const dynamic = 'force-dynamic';

export default async function FaqsPage() {
  const faqs = await sql`
    select id, category, question, answer, sort, is_active, created_at
    from content_faqs
    order by sort, created_at desc
  `;

  const list = faqs.map((f) => ({
    ...f,
    question_text: pick(f.question as Record<string, string>, 'zh'),
    answer_text: pick(f.answer as Record<string, string>, 'zh'),
  })) as any[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">FAQ 管理</h1>
      <FaqsManager faqs={list} />
    </div>
  );
}
