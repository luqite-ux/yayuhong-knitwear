-- 0001_init.sql
-- 澄海雅育鸿针织厂 管理后台 初始表结构
-- 多语言字段为 jsonb，键为 zh|en|ru|es|de|fr|pt|ja|ar

create extension if not exists pgcrypto;

create table if not exists schema_migrations (
  name text primary key,
  applied_at timestamptz not null default now()
);

-- ========== 站点与配置 ==========
create table if not exists site_profile (
  id uuid primary key default gen_random_uuid(),
  site_name jsonb not null default '{}'::jsonb,
  company_name text not null default '',
  domain text not null default '',
  default_locale text not null default 'zh',
  logo_url text,
  contact jsonb not null default '{}'::jsonb,
  intro jsonb not null default '{}'::jsonb,
  brand_voice text,
  google_verification text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists seo_config (
  id uuid primary key default gen_random_uuid(),
  enabled boolean not null default false,
  keyword_seeds text[] not null default '{}',
  target_countries text[] not null default '{}',
  competitor_domains text[] not null default '{}',
  brand_voice text,
  writing_locale text not null default 'en',
  target_locales text[] not null default '{en,ru,zh}',
  monthly_articles int not null default 4 check (monthly_articles between 0 and 20),
  publish_mode text not null default 'auto' check (publish_mode in ('auto','review')),
  style_quota jsonb not null default '{"technical":1,"buying_guide":1,"application":1,"trend":1}'::jsonb,
  geo_monthly_budget_usd numeric(10,2) not null default 0,
  indexing_enabled boolean not null default true,
  onboarding_steps jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists integration_secrets (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  ciphertext bytea,
  iv bytea,
  tag bytea,
  masked text,
  meta jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','connected','failed','skipped')),
  last_tested_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_sync_sources (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  config_encrypted bytea,
  last_sync_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== 内容 ==========
create table if not exists content_categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references content_categories(id) on delete set null,
  name jsonb not null default '{}'::jsonb,
  slug text not null unique,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references content_categories(id) on delete set null,
  name jsonb not null default '{}'::jsonb,
  model text,
  slug text not null unique,
  summary jsonb not null default '{}'::jsonb,
  detail_html jsonb not null default '{}'::jsonb,
  features jsonb not null default '{}'::jsonb,
  applications jsonb not null default '{}'::jsonb,
  advantages jsonb not null default '{}'::jsonb,
  specs jsonb not null default '{}'::jsonb,
  cover_url text,
  gallery_urls text[] not null default '{}',
  is_active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_articles (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null default '{}'::jsonb,
  slug text not null unique,
  excerpt jsonb not null default '{}'::jsonb,
  content_html jsonb not null default '{}'::jsonb,
  cover_url text,
  meta_description jsonb not null default '{}'::jsonb,
  supporting_keywords text[] not null default '{}',
  faq_schema jsonb,
  article_schema jsonb,
  locale text not null default 'en',
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  source text not null default 'manual' check (source in ('manual','seo_pipeline')),
  draft_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_content_articles_status_pub on content_articles(status, published_at desc);

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  email text not null default '',
  phone text,
  company text,
  subject text,
  message text not null default '',
  locale text,
  ip text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ========== SEO 流水线 ==========
create table if not exists seo_generation_runs (
  id uuid primary key default gen_random_uuid(),
  trigger text not null check (trigger in ('manual','cron','bootstrap')),
  triggered_by text,
  model text,
  prompt_hash text,
  requested int not null default 0,
  succeeded int not null default 0,
  failed int not null default 0,
  prompt_tokens int not null default 0,
  completion_tokens int not null default 0,
  cost_usd numeric(10,4) not null default 0,
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists seo_article_drafts (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references seo_generation_runs(id) on delete set null,
  style text not null check (style in ('technical','buying_guide','application','trend')),
  title jsonb not null default '{}'::jsonb,
  slug text not null,
  excerpt jsonb not null default '{}'::jsonb,
  content_html jsonb not null default '{}'::jsonb,
  meta_description jsonb not null default '{}'::jsonb,
  supporting_keywords text[] not null default '{}',
  faq_schema jsonb,
  article_schema jsonb,
  human_review_flags jsonb not null default '[]'::jsonb,
  cover_url text,
  cover_product_id uuid references content_products(id) on delete set null,
  cover_missing boolean not null default false,
  status text not null default 'pending_review' check (status in ('pending_review','scheduled','published','rejected')),
  scheduled_at timestamptz,
  published_at timestamptz,
  article_id uuid references content_articles(id) on delete set null,
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_seo_drafts_status_sched on seo_article_drafts(status, scheduled_at);

create table if not exists seo_keywords (
  id uuid primary key default gen_random_uuid(),
  keyword text not null,
  locale text,
  country text not null default '',
  source text not null default 'manual' check (source in ('seed','llm','gsc','manual')),
  is_tracked boolean not null default true,
  created_at timestamptz not null default now(),
  unique(keyword, country)
);

create table if not exists seo_keyword_rankings (
  id uuid primary key default gen_random_uuid(),
  keyword_id uuid not null references seo_keywords(id) on delete cascade,
  date date not null,
  position numeric(8,2),
  impressions int not null default 0,
  clicks int not null default 0,
  ctr numeric(8,4),
  best_url text,
  unique(keyword_id, date)
);
create index if not exists idx_seo_keyword_rankings_date on seo_keyword_rankings(date);

create table if not exists seo_gsc_properties (
  id uuid primary key default gen_random_uuid(),
  property text not null unique,
  status text not null default 'pending_dns' check (status in ('pending_dns','pending_verification','verified','failed')),
  txt_name text,
  txt_value text,
  cloudflare_record_id text,
  verified_at timestamptz,
  sitemap_submitted_at timestamptz,
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists seo_daily_metrics (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  impressions int not null default 0,
  clicks int not null default 0,
  ctr numeric(8,4),
  avg_position numeric(8,2)
);

create table if not exists seo_indexed_urls (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  url_type text not null default 'other' check (url_type in ('home','product','article','other')),
  in_sitemap boolean not null default true,
  missing_since timestamptz,
  inspection_status text,
  coverage_state text,
  last_inspected_at timestamptz,
  last_index_request_at timestamptz,
  request_count int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_seo_indexed_urls_status on seo_indexed_urls(inspection_status);

create table if not exists seo_optimization_logs (
  id uuid primary key default gen_random_uuid(),
  url text,
  kind text not null check (kind in ('title','meta','jsonld','canonical','internal_link','llms','suggestion')),
  auto boolean not null default false,
  status text not null default 'todo' check (status in ('applied','pending_confirm','failed','todo','dismissed')),
  before jsonb,
  after jsonb,
  error text,
  applied_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists seo_sitemap_submissions (
  id uuid primary key default gen_random_uuid(),
  sitemap_url text not null,
  status text not null,
  response text,
  created_at timestamptz not null default now()
);

-- ========== GEO ==========
create table if not exists geo_projects (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  domain text not null,
  engines text[] not null default '{}',
  monthly_budget_usd numeric(10,2) not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists geo_queries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references geo_projects(id) on delete cascade,
  question text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists geo_monitor_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references geo_projects(id) on delete cascade,
  trigger text not null default 'cron',
  engine_count int not null default 0,
  query_count int not null default 0,
  cost_usd numeric(10,4) not null default 0,
  status text not null default 'running',
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists geo_monitor_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references geo_monitor_runs(id) on delete cascade,
  query_id uuid references geo_queries(id) on delete set null,
  engine text not null,
  mentioned boolean not null default false,
  position int,
  cited_urls text[] not null default '{}',
  answer_excerpt text,
  cost_usd numeric(10,4) not null default 0,
  raw jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_geo_results_run on geo_monitor_results(run_id);

-- ========== 数据 ==========
create table if not exists ga4_daily_metrics (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  country text not null default '',
  page_path text not null default '',
  users int not null default 0,
  pageviews int not null default 0,
  unique(date, country, page_path)
);
create index if not exists idx_ga4_daily_date on ga4_daily_metrics(date);

create table if not exists seo_monthly_reports (
  id uuid primary key default gen_random_uuid(),
  month date not null unique,
  html_url text,
  summary jsonb,
  notified_at timestamptz,
  status text not null default 'pending',
  error text,
  created_at timestamptz not null default now()
);

-- ========== 运行 ==========
create table if not exists job_runs (
  id uuid primary key default gen_random_uuid(),
  job text not null,
  trigger text not null check (trigger in ('cron','manual')),
  triggered_by text,
  status text not null default 'running' check (status in ('running','success','partial','failed','skipped')),
  success_count int not null default 0,
  failure_count int not null default 0,
  cost_usd numeric(10,4) not null default 0,
  summary jsonb,
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists idx_job_runs_job_started on job_runs(job, started_at desc);

create table if not exists admin_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  target text,
  detail jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_logs_created on audit_logs(created_at desc);

-- 单例行
insert into site_profile (site_name, company_name, domain, default_locale, contact, intro)
select
  '{"zh":"澄海雅育鸿针织厂","en":"Yayuhong Knitwear","ru":"Yayuhong Knitwear"}'::jsonb,
  '澄海雅育鸿针织厂（Yayuhong Knitwear）',
  'xiuyuknit.com',
  'zh',
  '{}'::jsonb,
  '{"zh":"针织服装 OEM/ODM 制造商，主营毛衣、家居服、童装、宠物服与配饰，面向海外 B2B 客户。","en":"Knitwear OEM/ODM manufacturer of sweaters, loungewear, kidswear, pet apparel and accessories for overseas B2B buyers."}'::jsonb
where not exists (select 1 from site_profile);

insert into seo_config (enabled)
select false where not exists (select 1 from seo_config);
