import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Ga4Page() {
  const metrics = await sql`
    select date, country, page_path, users, pageviews
    from ga4_daily_metrics
    order by date desc limit 50
  `;

  const byDate = metrics.reduce((acc: Record<string, { users: number; pageviews: number }>, m) => {
    const d = m.date;
    if (!acc[d]) acc[d] = { users: 0, pageviews: 0 };
    acc[d].users += Number(m.users);
    acc[d].pageviews += Number(m.pageviews);
    return acc;
  }, {});

  const dates = Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 30);

  const countries = metrics.reduce((acc: Record<string, number>, m) => {
    if (m.country) acc[m.country] = (acc[m.country] || 0) + Number(m.users);
    return acc;
  }, {});
  const topCountries = Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">GA4 统计</h1>

      {metrics.length === 0 && (
        <div className="admin-card border-l-4 border-yellow-400 mb-6">
          <p className="text-sm text-gray-600">
            GA4 未接通或暂无数据。请在接入向导中配置 GA4 Measurement ID 和 Property ID。
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <h2 className="font-semibold text-gray-900 mb-4">每日趋势</h2>
          {dates.length === 0 ? (
            <p className="text-sm text-gray-400">暂无数据。</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-1 px-2">日期</th>
                <th className="py-1 px-2">访客</th>
                <th className="py-1 px-2">浏览量</th>
              </tr></thead>
              <tbody>
                {dates.map(([date, v]) => (
                  <tr key={date} className="border-b border-gray-50">
                    <td className="py-1 px-2 text-gray-600">{date}</td>
                    <td className="py-1 px-2 text-gray-700">{v.users}</td>
                    <td className="py-1 px-2 text-gray-700">{v.pageviews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-card">
          <h2 className="font-semibold text-gray-900 mb-4">热门国家</h2>
          {topCountries.length === 0 ? (
            <p className="text-sm text-gray-400">暂无数据。</p>
          ) : (
            <div className="space-y-2">
              {topCountries.map(([country, users]) => (
                <div key={country} className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-700">{country}</span>
                  <span className="text-sm font-medium text-gray-900">{users}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="admin-card mt-6">
        <h2 className="font-semibold text-gray-900 mb-4">热门页面</h2>
        {metrics.length === 0 ? (
          <p className="text-sm text-gray-400">暂无数据。</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-1 px-2">页面</th>
              <th className="py-1 px-2">国家</th>
              <th className="py-1 px-2">访客</th>
              <th className="py-1 px-2">浏览量</th>
            </tr></thead>
            <tbody>
              {metrics.slice(0, 20).map((m, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-1 px-2 text-gray-700 max-w-xs truncate">{m.page_path}</td>
                  <td className="py-1 px-2 text-gray-500">{m.country || '—'}</td>
                  <td className="py-1 px-2 text-gray-600">{m.users}</td>
                  <td className="py-1 px-2 text-gray-600">{m.pageviews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
