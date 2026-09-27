import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface DashboardStats {
  products_count: string;
  articles_count: string;
  inquiries_unread: string;
  drafts_pending: string;
  last_job_runs: Array<{
    job: string;
    status: string;
    started_at: Date;
    success_count: number | null;
    failure_count: number | null;
  }>;
  secrets: Array<{
    key: string;
    status: string;
    last_error: string | null;
  }>;
  seo_config: {
    enabled: boolean;
    onboarding_steps: Record<string, boolean> | null;
  } | null;
}

export default async function AdminDashboard() {
  const stats = await sql<DashboardStats[]>`
    select
      (select count(*)::text from content_products) as products_count,
      (select count(*)::text from content_articles) as articles_count,
      (select count(*)::text from inquiries where not is_read) as inquiries_unread,
      (select count(*)::text from seo_article_drafts where status = 'pending_review') as drafts_pending
  `;

  const lastJobs = await sql`
    select job, status, started_at, success_count, failure_count
    from job_runs
    order by started_at desc
    limit 10
  `;

  const secrets = await sql`
    select key, status, last_error
    from integration_secrets
    order by key
  `;

  const seoConfig = await sql<{ enabled: boolean; onboarding_steps: unknown }[]>`
    select enabled, onboarding_steps from seo_config limit 1
  `;

  const s = stats[0];
  const cfg = seoConfig[0];
  const onboarding = cfg?.onboarding_steps as Record<string, boolean> | null;
  const onboardingDone = onboarding ? Object.values(onboarding).filter(Boolean).length : 0;
  const onboardingTotal = onboarding ? Object.keys(onboarding).length : 0;

  const SECRET_LABELS: Record<string, string> = {
    llm: '大模型',
    google: 'Google 服务账号',
    ga4: 'GA4',
    cloudflare: 'Cloudflare',
    geo_engine: 'GEO 引擎',
    notification: '通知',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
      </div>

      {cfg && !cfg.enabled && (
        <div className="admin-card mb-6 border-l-4 border-yellow-400">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">系统尚未配置</h2>
              <p className="text-sm text-gray-500 mt-1">
                接入向导已完成 {onboardingDone}/{onboardingTotal} 步。请完成配置以启用自动化功能。
              </p>
            </div>
            <a href="/admin/onboarding" className="admin-btn admin-btn-primary">
              前往接入向导
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: '产品数', value: s.products_count, href: '/admin/content/products' },
          { label: '文章数', value: s.articles_count, href: '/admin/content/articles' },
          { label: '未读询盘', value: s.inquiries_unread, href: '/admin/content/inquiries' },
          { label: '待审草稿', value: s.drafts_pending, href: '/admin/seo' },
        ].map((card) => (
          <a key={card.label} href={card.href} className="admin-card hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <h2 className="font-semibold text-gray-900 mb-4">接入状态</h2>
          <div className="space-y-2">
            {secrets.length === 0 && (
              <p className="text-sm text-gray-400">暂无配置。请前往接入向导。</p>
            )}
            {secrets.map((sec) => (
              <div key={sec.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">
                  {SECRET_LABELS[sec.key] || sec.key}
                </span>
                <span className={`admin-badge ${
                  sec.status === 'connected' ? 'admin-badge-green' :
                  sec.status === 'failed' ? 'admin-badge-red' :
                  sec.status === 'skipped' ? 'admin-badge-gray' :
                  'admin-badge-yellow'
                }`}>
                  {sec.status === 'connected' ? '已连接' :
                   sec.status === 'failed' ? '失败' :
                   sec.status === 'skipped' ? '已跳过' :
                   '待检测'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h2 className="font-semibold text-gray-900 mb-4">最近任务</h2>
          <div className="space-y-2">
            {lastJobs.length === 0 && (
              <p className="text-sm text-gray-400">暂无任务记录。</p>
            )}
            {lastJobs.map((job, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <span className="text-sm text-gray-700">{job.job}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(job.started_at).toLocaleString('zh-CN')}
                  </span>
                </div>
                <span className={`admin-badge ${
                  job.status === 'success' ? 'admin-badge-green' :
                  job.status === 'failed' ? 'admin-badge-red' :
                  job.status === 'partial' ? 'admin-badge-yellow' :
                  job.status === 'skipped' ? 'admin-badge-gray' :
                  'admin-badge-blue'
                }`}>
                  {job.status === 'success' ? '成功' :
                   job.status === 'failed' ? '失败' :
                   job.status === 'partial' ? '部分' :
                   job.status === 'skipped' ? '跳过' :
                   '运行中'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
