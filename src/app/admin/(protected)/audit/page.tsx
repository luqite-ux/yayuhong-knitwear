import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
  const logs = await sql`
    select id, actor, action, target, detail, created_at
    from audit_logs
    order by created_at desc limit 100
  `;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">审计日志</h1>

      <div className="admin-card overflow-x-auto">
        {logs.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">暂无日志</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 px-3">操作者</th>
                <th className="py-2 px-3">动作</th>
                <th className="py-2 px-3">对象</th>
                <th className="py-2 px-3">详情</th>
                <th className="py-2 px-3">时间</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-700">{l.actor}</td>
                  <td className="py-2 px-3 text-gray-600">{l.action}</td>
                  <td className="py-2 px-3 text-gray-600">{l.target}</td>
                  <td className="py-2 px-3 text-gray-400 text-xs max-w-xs truncate">
                    {l.detail ? JSON.stringify(l.detail).slice(0, 100) : '—'}
                  </td>
                  <td className="py-2 px-3 text-gray-400 text-xs">{new Date(l.created_at).toLocaleString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
