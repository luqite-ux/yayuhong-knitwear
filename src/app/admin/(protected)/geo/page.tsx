import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function GeoPage() {
  const [projects, results, keywords] = await Promise.all([
    sql`select * from geo_projects order by created_at`,
    sql`
      select r.query_id, q.query_text, r.engine, r.mentioned, r.position,
             r.answer_excerpt, r.cost_usd, r.checked_at, r.cited_urls
      from geo_monitor_results r
      join geo_queries q on r.query_id = q.id
      order by r.checked_at desc limit 30
    `,
    sql`select count(*)::text as total, count(*) filter (where is_active)::text as active from geo_queries`,
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">GEO 监测</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="admin-card">
          <p className="text-sm text-gray-500">监测项目</p>
          <p className="text-2xl font-bold">{projects.length}</p>
        </div>
        <div className="admin-card">
          <p className="text-sm text-gray-500">监测问题</p>
          <p className="text-2xl font-bold">{keywords[0].total}</p>
          <p className="text-xs text-gray-400">活跃 {keywords[0].active}</p>
        </div>
        <div className="admin-card">
          <p className="text-sm text-gray-500">最近结果</p>
          <p className="text-2xl font-bold">{results.length}</p>
        </div>
      </div>

      <div className="admin-card mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">监测项目</h2>
        {projects.length === 0 ? (
          <p className="text-sm text-gray-400">暂无项目。接入向导完成后自动初始化。</p>
        ) : projects.map((p) => (
          <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div>
              <span className="text-sm font-medium text-gray-700">{p.name}</span>
              <span className="text-xs text-gray-400 ml-2">{p.domain}</span>
            </div>
            <span className="admin-badge admin-badge-blue">月预算 ${p.monthly_budget_usd || 0}</span>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <h2 className="font-semibold text-gray-900 mb-4">最近监测结果</h2>
        {results.length === 0 ? (
          <p className="text-sm text-gray-400">暂无结果。</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2 px-3">问题</th>
              <th className="py-2 px-3">引擎</th>
              <th className="py-2 px-3">提及</th>
              <th className="py-2 px-3">位置</th>
              <th className="py-2 px-3">费用</th>
              <th className="py-2 px-3">时间</th>
            </tr></thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-1 px-3 text-gray-700 max-w-xs truncate" title={r.query_text}>{r.query_text}</td>
                  <td className="py-1 px-3 text-gray-500">{r.engine}</td>
                  <td className="py-1 px-3">
                    <span className={`admin-badge ${r.mentioned ? 'admin-badge-green' : 'admin-badge-gray'}`}>
                      {r.mentioned ? '是' : '否'}
                    </span>
                  </td>
                  <td className="py-1 px-3 text-gray-600">{r.position || '—'}</td>
                  <td className="py-1 px-3 text-gray-500">${r.cost_usd || '0'}</td>
                  <td className="py-1 px-3 text-gray-400 text-xs">{new Date(r.checked_at).toLocaleString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
