import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

function fmtDate(v: unknown): string {
  if (!v) return '-';
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toISOString().slice(0, 10);
}

export default async function GscPage() {
  let properties: any[] = [];
  let metrics: any[] = [];
  let keywords: any[] = [];
  let dbError: string | null = null;

  try {
    const res = await Promise.all([
      sql`select * from seo_gsc_properties order by created_at`,
      sql`select * from seo_daily_metrics order by date desc limit 30`,
      sql`select keyword, locale, source, is_tracked from seo_keywords where source = 'gsc' order by created_at desc limit 20`,
    ]);
    properties = res[0] as any[];
    metrics = res[1] as any[];
    keywords = res[2] as any[];
  } catch (err: any) {
    dbError = err?.message || String(err);
    console.error('[admin/gsc] 数据读取失败:', dbError);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Google Search Console</h1>

      {dbError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold mb-1">数据读取失败</p>
          <p className="break-all">{dbError}</p>
        </div>
      )}

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
                    <td className="py-1 px-2 text-gray-600">{fmtDate(m.date)}</td>
                    <td className="py-1 px-2 text-gray-600">{Number(m.impressions ?? 0)}</td>
                    <td className="py-1 px-2 text-gray-600">{Number(m.clicks ?? 0)}</td>
                    <td className="py-1 px-2 text-gray-600">{(Number(m.ctr ?? 0) * 100).toFixed(1)}%</td>
                    <td className="py-1 px-2 text-gray-600">{Number(m.avg_position ?? 0).toFixed(1)}</td>
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
