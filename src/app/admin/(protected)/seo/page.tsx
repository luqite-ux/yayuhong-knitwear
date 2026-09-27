import { sql } from '@/lib/db';
import { pick } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function SeoPage() {
  const [drafts, runs, keywords] = await Promise.all([
    sql`
      select d.id, d.style, d.slug, d.title, d.status, d.scheduled_at, d.published_at,
             d.cover_missing, d.human_review_flags, d.locale
      from seo_article_drafts d
      order by d.created_at desc limit 20
    `,
    sql`
      select id, job, trigger, status, started_at, success_count, failure_count, cost_usd
      from seo_generation_runs
      order by started_at desc limit 10
    `,
    sql`select count(*)::text as total, count(*) filter (where is_tracked)::text as tracked from seo_keywords`,
  ]);

  const draftList = drafts.map((d) => ({
    ...d,
    title_text: pick(d.title as Record<string, string>, 'zh'),
  })) as any[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">SEO 文章流水线</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="admin-card">
          <p className="text-sm text-gray-500">关键词总数</p>
          <p className="text-2xl font-bold text-gray-900">{keywords[0].total}</p>
          <p className="text-xs text-gray-400 mt-1">追踪中 {keywords[0].tracked}</p>
        </div>
        <div className="admin-card">
          <p className="text-sm text-gray-500">待审草稿</p>
          <p className="text-2xl font-bold text-gray-900">
            {draftList.filter((d) => d.status === 'pending_review').length}
          </p>
        </div>
        <div className="admin-card">
          <p className="text-sm text-gray-500">已发布</p>
          <p className="text-2xl font-bold text-gray-900">
            {draftList.filter((d) => d.status === 'published').length}
          </p>
        </div>
      </div>

      <div className="admin-card mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">草稿列表</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 px-3">标题</th>
                <th className="py-2 px-3">风格</th>
                <th className="py-2 px-3">状态</th>
                <th className="py-2 px-3">封面</th>
                <th className="py-2 px-3">待审标记</th>
                <th className="py-2 px-3">时间</th>
              </tr>
            </thead>
            <tbody>
              {draftList.length === 0 ? (
                <tr><td colSpan={6} className="py-4 text-center text-gray-400">暂无草稿。接入向导完成后可一键启动。</td></tr>
              ) : draftList.map((d) => (
                <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium text-gray-900">{d.title_text || d.slug}</td>
                  <td className="py-2 px-3 text-gray-600">{d.style}</td>
                  <td className="py-2 px-3">
                    <span className={`admin-badge ${
                      d.status === 'published' ? 'admin-badge-green' :
                      d.status === 'scheduled' ? 'admin-badge-blue' :
                      d.status === 'rejected' ? 'admin-badge-red' :
                      'admin-badge-yellow'
                    }`}>{d.status}</span>
                  </td>
                  <td className="py-2 px-3">
                    {d.cover_missing ? <span className="admin-badge admin-badge-red">待补充</span> : '✓'}
                  </td>
                  <td className="py-2 px-3 text-gray-600 text-xs">
                    {Array.isArray(d.human_review_flags) && d.human_review_flags.length > 0
                      ? d.human_review_flags.join(', ') : '—'}
                  </td>
                  <td className="py-2 px-3 text-gray-400 text-xs">
                    {d.published_at ? new Date(d.published_at).toLocaleDateString('zh-CN') :
                     d.scheduled_at ? '定于 ' + new Date(d.scheduled_at).toLocaleDateString('zh-CN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="font-semibold text-gray-900 mb-4">生成任务</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 px-3">任务</th>
                <th className="py-2 px-3">触发</th>
                <th className="py-2 px-3">状态</th>
                <th className="py-2 px-3">成功/失败</th>
                <th className="py-2 px-3">费用</th>
                <th className="py-2 px-3">时间</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr><td colSpan={6} className="py-4 text-center text-gray-400">暂无任务。</td></tr>
              ) : runs.map((r) => (
                <tr key={r.id} className="border-b border-gray-100">
                  <td className="py-2 px-3 text-gray-700">{r.job}</td>
                  <td className="py-2 px-3 text-gray-600">{r.trigger}</td>
                  <td className="py-2 px-3">
                    <span className={`admin-badge ${
                      r.status === 'success' ? 'admin-badge-green' :
                      r.status === 'failed' ? 'admin-badge-red' : 'admin-badge-yellow'
                    }`}>{r.status}</span>
                  </td>
                  <td className="py-2 px-3 text-gray-600">{r.success_count}/{r.failure_count}</td>
                  <td className="py-2 px-3 text-gray-600">${r.cost_usd || '0'}</td>
                  <td className="py-2 px-3 text-gray-400 text-xs">
                    {r.started_at ? new Date(r.started_at).toLocaleString('zh-CN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
