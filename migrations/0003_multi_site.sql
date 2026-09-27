-- 0003_multi_site.sql
-- 多站点支持：海外站 xiuyuknit.com + 国内站 xiuyumaoshan.cn

-- ========== 站点配置 ==========
create table if not exists sites (
  key text primary key,             -- 'overseas' | 'china'
  domain text not null unique,
  name jsonb not null default '{}'::jsonb,  -- 站点名称（多语言）
  default_locale text not null default 'zh',
  is_active boolean not null default true,
  logo_url text,
  seo jsonb not null default '{}'::jsonb,    -- 站点级 SEO 默认值
  settings jsonb not null default '{}'::jsonb, -- 其他配置（像素ID、社媒等）
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 插入两个站点（默认数据，后台可改）
insert into sites (key, domain, name, default_locale)
values
  ('overseas', 'xiuyuknit.com', '{"zh":"亚裕鸿毛织（海外）","en":"Yayuhong Knitwear"}', 'en'),
  ('china', 'xiuyumaoshan.cn', '{"zh":"修育毛衫厂"}', 'zh')
on conflict (key) do nothing;

-- ========== 内容表加 sites 字段 ==========
-- sites 为 text[]，值为 'overseas' | 'china' | 'global'
-- global = 两站都显示
-- 默认为 '{"global"}'，兼容现有数据

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
