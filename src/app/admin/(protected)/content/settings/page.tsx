import { sql } from '@/lib/db';
import SettingsForm from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const profile = await sql`select * from site_profile where id = 1`;
  const p = profile[0];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">站点设置</h1>
      <SettingsForm profile={p} />
    </div>
  );
}
