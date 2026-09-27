import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function IndexingPage() {
  const [urls, submissions] = await Promise.all([
    sql`select url, url_type, in_sitemap, inspection_status, coverage_state,
               request_count, last_index_request_at, last_error, missing_since
        from seo_indexed_urls
        order by last_inspected_at desc nulls last
        limit 50`,
    sql`select * from seo_sitemap_submissions order by submitted_at desc limit 10`,
  ]);

  const indexed = urls.filter((u) => u.inspection_status === 'INDEXED').length;
  const notIndexed = urls.filter((u) => u.inspection_status && u.inspection_status !== 'INDEXED').length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">收录管理</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="admin-card"><p className="text-sm text-gray-500">总 URL</p><p className="text-2xl font-bold">{urls.length}</p></div>
        <div className="admin-card"><p className="text-sm text-gray-500">已收录</p><p className="text-2xl font-bold text-green-600">{indexed}</p></div>
        <div className="admin-card"><p className="text-sm text-gray-500">未收录</p><p className="text-2xl font-bold text-red-500">{notIndexed}</p></div>
        <div className="admin-card"><p className="text-sm text-gray-500">待检测</p><p className="text-2xl font-bold text-gray-400">{urls.length - indexed - notIndexed}</p></div>
      </div>

      <div className="admin-card mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">URL 列表</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2 px-3">URL</th>
              <th className="py-2 px-3">类型</th>
              <th className="py-2 px-3">在 Sitemap</th>
              <th className="py-2 px-3">收录状态</th>
              <th className="py-2 px-3">请求次数</th>
              <th className="py-2 px-3">错误</th>
            </tr></thead>
            <tbody>
              {urls.length === 0 ? (
                <tr><td colSpan={6} className="py-4 text-center text-gray-400">暂无数据。</td></tr>
              ) : urls.map((u, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-1 px-3 text-gray-700 max-w-xs truncate" title={u.url}>{u.url}</td>
                  <td className="py-1 px-3 text-gray-500">{u.url_type}</td>
                  <td className="py-1 px-3">{u.in_sitemap ? '✓' : '✗'}</td>
                  <td className="py-1 px-3">
                    <span className={`admin-badge ${
                      u.inspection_status === 'INDEXED' ? 'admin-badge-green' :
                      u.inspection_status ? 'admin-badge-red' : 'admin-badge-gray'
                    }`}>{u.inspection_status || '未检测'}</span>
                  </td>
                  <td className="py-1 px-3 text-gray-500">{u.request_count || 0}</td>
                  <td className="py-1 px-3 text-gray-400 text-xs max-w-xs truncate" title={u.last_error || ''}>{u.last_error || '—'}</td>
                </tr>
              ))}
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
                  <td className="py-1 px-3 text-gray-400 text-xs">{new Date(s.submitted_at).toLocaleString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
