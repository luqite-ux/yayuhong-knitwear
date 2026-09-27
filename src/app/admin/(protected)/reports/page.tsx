import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const reports = await sql`
    select month, html_url, summary, status, error, notified_at, created_at
    from seo_monthly_reports
    order by month desc limit 12
  `;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">月报</h1>

      {reports.length === 0 ? (
        <div className="admin-card border-l-4 border-yellow-400">
          <p className="text-sm text-gray-600">暂无月报。系统每月 1 日自动生成上月报告。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((r) => (
            <div key={r.id} className="admin-card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{r.month}</h3>
                <span className={`admin-badge ${
                  r.status === 'success' ? 'admin-badge-green' :
                  r.status === 'failed' ? 'admin-badge-red' : 'admin-badge-yellow'
                }`}>{r.status}</span>
              </div>
              {r.html_url && (
                <a href={r.html_url} target="_blank" rel="noopener" className="text-sm text-blue-600 hover:underline">
                  查看报告 →
                </a>
              )}
              {r.error && <p className="text-sm text-red-500 mt-2">{r.error}</p>}
              {r.notified_at && (
                <p className="text-xs text-gray-400 mt-2">通知于 {new Date(r.notified_at).toLocaleString('zh-CN')}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
