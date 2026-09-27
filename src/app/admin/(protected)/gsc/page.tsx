import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function GscPage() {
  const [properties, metrics, keywords] = await Promise.all([
    sql`select * from seo_gsc_properties order by created_at`,
    sql`select * from seo_daily_metrics order by date desc limit 30`,
    sql`select keyword, locale, source, is_tracked from seo_keywords where source = 'gsc' order by created_at desc limit 20`,
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Google Search Console</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="admin-card">
          <h2 className="font-semibold text-gray-900 mb-4">已验证资源</h2>
          {properties.length === 0 ? (
            <p className="text-sm text-gray-400">暂无。接入向导完成后自动添加。</p>
          ) : properties.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <span className="text-sm text-gray-700">{p.property}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {p.last_sync_at ? '上次同步 ' + new Date(p.last_sync_at).toLocaleString('zh-CN') : '未同步'}
                </span>
              </div>
              <span className={`admin-badge ${
                p.status === 'verified' ? 'admin-badge-green' :
                p.status === 'failed' ? 'admin-badge-red' : 'admin-badge-yellow'
              }`}>{p.status}</span>
            </div>
          ))}
        </div>

        <div className="admin-card">
          <h2 className="font-semibold text-gray-900 mb-4">近期指标</h2>
          {metrics.length === 0 ? (
            <p className="text-sm text-gray-400">暂无数据。</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-1 px-2">日期</th>
                <th className="py-1 px-2">展示</th>
                <th className="py-1 px-2">点击</th>
                <th className="py-1 px-2">CTR</th>
                <th className="py-1 px-2">均位</th>
              </tr></thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50">
                    <td className="py-1 px-2 text-gray-600">{m.date}</td>
                    <td className="py-1 px-2 text-gray-600">{m.impressions}</td>
                    <td className="py-1 px-2 text-gray-600">{m.clicks}</td>
                    <td className="py-1 px-2 text-gray-600">{(m.ctr * 100).toFixed(1)}%</td>
                    <td className="py-1 px-2 text-gray-600">{Number(m.avg_position).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="admin-card">
        <h2 className="font-semibold text-gray-900 mb-4">GSC 查询关键词</h2>
        {keywords.length === 0 ? (
          <p className="text-sm text-gray-400">暂无。同步后将自动入库。</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {keywords.map((k, i) => (
              <span key={i} className="admin-badge admin-badge-blue">{k.keyword}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
