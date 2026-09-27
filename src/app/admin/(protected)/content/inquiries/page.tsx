import { sql } from '@/lib/db';
import InquiriesManager from '@/components/admin/InquiriesManager';

export const dynamic = 'force-dynamic';

export default async function InquiriesPage() {
  const inquiries = await sql`
    select id, name, email, phone, whatsapp, company, subject, message, locale, ip,
           status, source, admin_note, country, created_at
    from inquiries
    order by created_at desc
    limit 200
  `;

  const stats = await sql`
    select status, count(*)::int as count
    from inquiries
    group by status
    order by status
  `;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">询盘管理</h1>
      <InquiriesManager initialInquiries={inquiries as any[]} initialStats={stats as any[]} />
    </div>
  );
}
