import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const MIGRATIONS: { name: string; sql: string }[] = [
  {
    name: '0001_init.sql',
    sql: `
create extension if not exists pgcrypto;

create table if not exists schema_migrations (
  name text primary key,
  applied_at timestamptz not null default now()
);

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

insert into site_profile (site_name, company_name, domain, default_locale, contact, intro)
select
  '{"zh":"澄海雅育鸿针织厂","en":"Yayuhong Knitwear","ru":"Yayuhong Knitwear"}'::jsonb,
  '澄海雅育鸿针织厂（Yayuhong Knitwear）',
  'yayuhong-knitwear.vercel.app',
  'en',
  '{}'::jsonb,
  '{"zh":"针织服装 OEM/ODM 制造商，主营毛衣、家居服、童装、宠物服与配饰，面向海外 B2B 客户。","en":"Knitwear OEM/ODM manufacturer of sweaters, loungewear, kidswear, pet apparel and accessories for overseas B2B buyers."}'::jsonb
where not exists (select 1 from site_profile);

insert into seo_config (enabled)
select false where not exists (select 1 from seo_config);
`,
  },
  {
    name: '0002_faq_inquiry_status.sql',
    sql: `
create table if not exists content_faqs (
  id uuid primary key default gen_random_uuid(),
  category text,
  question jsonb not null default '{}'::jsonb,
  answer jsonb not null default '{}'::jsonb,
  sort int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_faqs_active on content_faqs(is_active);
create index if not exists idx_faqs_category on content_faqs(category);
create index if not exists idx_faqs_sort on content_faqs(sort);

alter table inquiries
  add column if not exists status text not null default 'new'
    check (status in ('new','contacting','quoted','won','lost','spam')),
  add column if not exists source text not null default 'website',
  add column if not exists assignee text,
  add column if not exists admin_note text,
  add column if not exists whatsapp text,
  add column if not exists country text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_inquiries_status on inquiries(status);
create index if not exists idx_inquiries_created on inquiries(created_at desc);

create table if not exists inquiry_follow_ups (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references inquiries(id) on delete cascade,
  action text not null,
  content text not null default '',
  status_before text,
  status_after text,
  created_by text not null default 'admin',
  created_at timestamptz not null default now()
);
create index if not exists idx_follow_ups_inquiry on inquiry_follow_ups(inquiry_id);
create index if not exists idx_follow_ups_created on inquiry_follow_ups(created_at desc);
`,
  },
  {
    name: '0003_multi_site.sql',
    sql: `
create table if not exists sites (
  key text primary key,
  domain text not null unique,
  name jsonb not null default '{}'::jsonb,
  default_locale text not null default 'zh',
  is_active boolean not null default true,
  logo_url text,
  seo jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into sites (key, domain, name, default_locale)
values
  ('overseas', 'yayuhong-knitwear.vercel.app', '{"zh":"亚裕鸿毛织（海外）","en":"Yayuhong Knitwear"}', 'en'),
  ('china', 'xiuyumaoshan.cn', '{"zh":"修育毛衫厂"}', 'zh')
on conflict (key) do nothing;

alter table content_categories
  add column if not exists sites text[] not null default '{"global"}';

alter table content_products
  add column if not exists sites text[] not null default '{"global"}';

alter table content_articles
  add column if not exists sites text[] not null default '{"global"}';

alter table content_faqs
  add column if not exists sites text[] not null default '{"global"}';

create index if not exists idx_categories_sites on content_categories using gin(sites);
create index if not exists idx_products_sites on content_products using gin(sites);
create index if not exists idx_articles_sites on content_articles using gin(sites);
create index if not exists idx_faqs_sites on content_faqs using gin(sites);
`,
  },
  {
    name: '0004_china_seo.sql',
    sql: `
alter table site_profile
  add column if not exists baidu_verification text,
  add column if not exists baidu_analytics text,
  add column if not exists baidu_push_token text,
  add column if not exists haosou_verification text,
  add column if not exists sogou_verification text,
  add column if not exists shenma_verification text,
  add column if not exists doubao_verification text,
  add column if not exists china_seo jsonb not null default '{}'::jsonb,
  add column if not exists china_geo jsonb not null default '{}'::jsonb;

create table if not exists china_baidu_index_log (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  action text not null,
  status text not null,
  response jsonb,
  checked_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_baidu_index_url on china_baidu_index_log(url);
create index if not exists idx_baidu_index_created on china_baidu_index_log(created_at);

create table if not exists china_geo_monitor (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  engine text not null,
  position int,
  has_citation boolean default false,
  snippet text,
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_geo_monitor_query on china_geo_monitor(query);
create index if not exists idx_geo_monitor_engine on china_geo_monitor(engine);
`,
  },
  {
    name: '0005_cms_extension.sql',
    sql: `
alter table site_profile
  add column if not exists stats jsonb not null default '{}'::jsonb,
  add column if not exists social_links jsonb not null default '{}'::jsonb,
  add column if not exists footer_config jsonb not null default '{}'::jsonb,
  add column if not exists hero_config jsonb not null default '{}'::jsonb;

create table if not exists content_factory_equipments (
  id uuid primary key default gen_random_uuid(),
  name jsonb not null default '{}'::jsonb,
  quantity int not null default 0,
  icon_key text,
  sort int not null default 0,
  sites text[] not null default '{"global"}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_factory_equipments_sites on content_factory_equipments using gin (sites);
create index if not exists idx_factory_equipments_active on content_factory_equipments(is_active);

create table if not exists content_factory_processes (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  step_number int not null default 0,
  icon_key text,
  sort int not null default 0,
  sites text[] not null default '{"global"}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_factory_processes_sites on content_factory_processes using gin (sites);
create index if not exists idx_factory_processes_active on content_factory_processes(is_active);

create table if not exists content_services (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null default '{}'::jsonb,
  summary jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  highlights jsonb not null default '{}'::jsonb,
  icon_key text,
  gradient_from text,
  gradient_to text,
  sort int not null default 0,
  sites text[] not null default '{"global"}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_content_services_sites on content_services using gin (sites);
create index if not exists idx_content_services_active on content_services(is_active);

create table if not exists content_ready_stock (
  id uuid primary key default gen_random_uuid(),
  name jsonb not null default '{}'::jsonb,
  model text,
  cover_url text,
  price_range text,
  sort int not null default 0,
  sites text[] not null default '{"global"}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_ready_stock_sites on content_ready_stock using gin(sites);
create index if not exists idx_ready_stock_active on content_ready_stock(is_active);

create table if not exists content_blocks (
  id uuid primary key default gen_random_uuid(),
  block_key text not null unique,
  title jsonb not null default '{}'::jsonb,
  subtitle jsonb not null default '{}'::jsonb,
  content jsonb not null default '{}'::jsonb,
  image_url text,
  items jsonb not null default '[]'::jsonb,
  config jsonb not null default '{}'::jsonb,
  sort int not null default 0,
  sites text[] not null default '{"global"}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_content_blocks_key on content_blocks(block_key);
create index if not exists idx_content_blocks_sites on content_blocks using gin(sites);
create index if not exists idx_content_blocks_active on content_blocks(is_active);

create table if not exists content_features (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'home',
  title jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  icon_key text,
  sort int not null default 0,
  sites text[] not null default '{"global"}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_features_category on content_features(category);
create index if not exists idx_features_sites on content_features using gin(sites);
create index if not exists idx_features_active on content_features(is_active);

do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'content_faqs' and column_name = 'category') then
    alter table content_faqs add column category text not null default 'general';
    create index idx_faqs_category on content_faqs(category);
  end if;
end $$;
`,
  },
  {
    name: '0006_api_keys.sql',
    sql: `
create table if not exists admin_api_keys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  key_hash text not null unique,
  key_prefix text not null,
  permissions text[] not null default '{"*"}',
  rate_limit int not null default 1000,
  is_active boolean not null default true,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists idx_api_keys_hash on admin_api_keys(key_hash);
create index if not exists idx_api_keys_active on admin_api_keys(is_active);
`,
  },
];

export async function GET() {
  try {
    const check = await sql`
      select count(*) as cnt from information_schema.tables 
      where table_name = 'schema_migrations'
    `;
    
    const exists = Number(check[0].cnt) > 0;
    
    if (exists) {
      const applied = await sql`select name from schema_migrations order by name`;
      return NextResponse.json({
        ok: true,
        initialized: true,
        applied: applied.map((r: any) => r.name),
      });
    }
    
    return NextResponse.json({
      ok: true,
      initialized: false,
      migrations: MIGRATIONS.map((m) => m.name),
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    await sql`
      create table if not exists schema_migrations (
        name text primary key,
        applied_at timestamptz not null default now()
      )
    `;
    
    const applied: string[] = [];
    const skipped: string[] = [];
    const errors: string[] = [];
    
    for (const migration of MIGRATIONS) {
      const existing = await sql`
        select name from schema_migrations where name = ${migration.name}
      `;
      
      if (existing.length > 0) {
        skipped.push(migration.name);
        continue;
      }
      
      try {
        await sql.unsafe(migration.sql);
        
        await sql`
          insert into schema_migrations (name) values (${migration.name})
        `;
        
        applied.push(migration.name);
      } catch (err: any) {
        errors.push(`${migration.name}: ${err.message}`);
        try {
          await sql`
            insert into schema_migrations (name) values (${migration.name})
            on conflict (name) do nothing
          `;
        } catch {
          // ignore
        }
      }
    }
    
    // 插入初始分类数据
    await sql.unsafe(`
insert into content_categories (name, slug, sort, sites)
values
  ('{"zh":"毛衣套装","en":"Sweater Sets","ru":"\u0421\u0432\u0438\u0442\u0435\u0440\u043d\u044b\u0435 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442\u044b"}', 'sweater-set', 1, '{"global"}'),
  ('{"zh":"家居服套装","en":"Loungewear Sets","ru":"\u0414\u043e\u043c\u0430\u0448\u043d\u0438\u0435 \u043a\u043e\u0441\u0442\u044e\u043c\u044b"}', 'loungewear-set', 2, '{"global"}'),
  ('{"zh":"童装","en":"Kidswear","ru":"\u0414\u0435\u0442\u0441\u043a\u044f\u044f \u043e\u0434\u0435\u0436\u0434\u0430"}', 'kidswear', 3, '{"global"}'),
  ('{"zh":"宠物服饰","en":"Pet Apparel","ru":"\u041e\u0434\u0435\u0436\u0434\u0430 \u0434\u043b\u044f \u043f\u0438\u0442\u043e\u043c\u0446\u0435\u0432"}', 'pet-apparel', 4, '{"global"}'),
  ('{"zh":"配饰","en":"Accessories","ru":"\u0410\u043a\u0441\u0435\u0441\u0441\u0443\u0430\u0440\u044b"}', 'accessories', 5, '{"global"}')
on conflict (slug) do nothing;
`);
    
    return NextResponse.json({
      ok: true,
      applied,
      skipped,
      errors,
      total: MIGRATIONS.length,
      seeded: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message, stack: err.stack },
      { status: 500 },
    );
  }
}
