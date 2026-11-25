import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function IndexingPage() {
  const [statsRows, urls, submissions] = await Promise.all([
    sql`select
          count(*)::int as total,
          count(*) filter (where coverage_state ilike '%indexed%' and coverage_state not ilike '%not indexed%')::int as indexed,
          count(*) filter (where last_inspected_at is null)::int as pending,
          count(*) filter (where last_inspected_at is not null and coverage_state is null)::int as unknown
        from seo_indexed_urls`,
    sql`select url, url_type, in_sitemap, inspection_status, coverage_state,
               last_inspected_at, last_error
        from seo_indexed_urls
        order by (coverage_state ilike '%indexed%' and coverage_state not ilike '%not indexed%') desc,
                 last_inspected_at desc nulls last, url
        limit 100`,
    sql`select * from seo_sitemap_submissions order by created_at desc limit 10`,
  ]);

  const stats = statsRows[0] || { total: 0, indexed: 0, pending: 0, unknown: 0 };
  const notIndexed = stats.total - stats.indexed - stats.pending - stats.unknown;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">收录管理</h1>
      <p className="text-sm text-gray-500 mb-6">
        收录状态以 Google URL Inspection 返回的 coverageState 为准；Google Indexing API 不支持普通页面，已停用，
        改由 sitemap + IndexNow + GSC 请求编入索引。
      </p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="admin-card"><p className="text-sm text-gray-500">总 URL</p><p className="text-2xl font-bold">{stats.total}</p></div>
        <div className="admin-card"><p className="text-sm text-gray-500">已收录</p><p className="text-2xl font-bold text-green-600">{stats.indexed}</p></div>
        <div className="admin-card"><p className="text-sm text-gray-500">未收录</p><p className="text-2xl font-bold text-red-500">{notIndexed}</p></div>
        <div className="admin-card"><p className="text-sm text-gray-500">待检测</p><p className="text-2xl font-bold text-gray-400">{stats.pending + stats.unknown}</p></div>
      </div>

      <div className="admin-card mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">URL 列表（按收录状态排序，最多显示 100 条）</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2 px-3">URL</th>
              <th className="py-2 px-3">类型</th>
              <th className="py-2 px-3">在 Sitemap</th>
              <th className="py-2 px-3">Google 覆盖状态</th>
              <th className="py-2 px-3">最后检测</th>
              <th className="py-2 px-3">错误</th>
            </tr></thead>
            <tbody>
              {urls.length === 0 ? (
                <tr><td colSpan={6} className="py-4 text-center text-gray-400">暂无数据。</td></tr>
              ) : urls.map((u) => {
                const indexed = !!u.coverage_state
                  && String(u.coverage_state).toLowerCase().includes('indexed')
                  && !String(u.coverage_state).toLowerCase().includes('not indexed');
                return (
                  <tr key={u.url} className="border-b border-gray-50">
                    <td className="py-1 px-3 text-gray-700 max-w-xs truncate" title={u.url}>{u.url}</td>
                    <td className="py-1 px-3 text-gray-500">{u.url_type}</td>
                    <td className="py-1 px-3">{u.in_sitemap ? '✓' : '✗'}</td>
                    <td className="py-1 px-3">
                      <span className={`admin-badge ${
                        indexed ? 'admin-badge-green' :
                        u.coverage_state ? 'admin-badge-red' : 'admin-badge-gray'
                      }`}>{u.coverage_state || '未检测'}</span>
                    </td>
                    <td className="py-1 px-3 text-gray-400 text-xs">
                      {u.last_inspected_at ? new Date(u.last_inspected_at).toLocaleString('zh-CN') : '—'}
                    </td>
                    <td className="py-1 px-3 text-gray-400 text-xs max-w-xs truncate" title={u.last_error || ''}>{u.last_error || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="font-semibold text-gray-900 mb-4">Sitemap 提交记录</h2>
        {submissions.length === 0 ? (
          <p className="text-sm text-gray-400">暂无提交记录。</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2 px-3">Sitemap URL</th>
              <th className="py-2 px-3">状态</th>
              <th className="py-2 px-3">时间</th>
            </tr></thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-b border-gray-50">
                  <td className="py-1 px-3 text-gray-700">{s.sitemap_url}</td>
                  <td className="py-1 px-3"><span className="admin-badge admin-badge-blue">{s.status}</span></td>
                  <td className="py-1 px-3 text-gray-400 text-xs">{new Date(s.created_at).toLocaleString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
