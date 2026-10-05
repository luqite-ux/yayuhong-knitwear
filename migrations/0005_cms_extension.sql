-- 0005_cms_extension.sql
-- CMS 扩展：工厂数据、服务内容、通用区块、站点配置扩展

-- ============================================
-- 1. 扩展 site_profile 表
-- ============================================

-- 扩展 contact 字段用途，新增 stats 和 footer 配置
alter table site_profile
  add column if not exists stats jsonb not null default '{}'::jsonb,
  add column if not exists social_links jsonb not null default '{}'::jsonb,
  add column if not exists footer_config jsonb not null default '{}'::jsonb,
  add column if not exists hero_config jsonb not null default '{}'::jsonb;

-- stats 字段结构说明：
-- {
--   "years_experience": "20+",       -- 年行业经验
--   "daily_capacity": "30,000+",    -- 日产能（件）
--   "moq": "50",                    -- 最小起订量
--   "sample_days": "7",             -- 打样天数
--   "design_styles": "500+",        -- 年设计款式
--   "factory_area": "8,000㎡",      -- 厂房面积
--   "workers_count": "200+",        -- 工人数
--   "countries_served": "30+"       -- 服务国家数
-- }

-- social_links 字段结构说明：
-- {
--   "facebook": "https://...",
--   "instagram": "https://...",
--   "linkedin": "https://...",
--   "youtube": "https://...",
--   "tiktok": "https://...",
--   "pinterest": "https://...",
--   "wechat_qr_url": "/images/wechat-qr.png",
--   "whatsapp_qr_url": "/images/whatsapp-qr.png"
-- }

-- footer_config 字段结构说明：
-- {
--   "copyright": "© 2024 Yayuhong Knitwear. All rights reserved.",
--   "icp": "粤ICP备XXXXXXXX号",
--   "company_footer": "运营主体公司名",
--   "address_footer": "地址",
--   "quick_links": [
--     { "label": { "zh": "产品", "en": "Products" }, "href": "/products" }
--   ]
-- }

-- hero_config 字段结构说明：
-- {
--   "badges": ["ISO9001", "BSCI", "OEKO-TEX"],
--   "trust_texts": {
--     "zh": ["1000+ 合作客户", "20年行业经验"],
--     "en": ["1000+ Clients", "20 Years Experience"]
--   }
-- }

-- ============================================
-- 2. 工厂设备表
-- ============================================

create table if not exists content_factory_equipments (
  id          uuid primary key default gen_random_uuid(),
  name        jsonb not null default '{}'::jsonb,   -- 设备名（多语言）
  quantity    int not null default 0,                -- 数量
  icon_key    text,                                   -- 图标标识（可选）
  sort        int not null default 0,
  sites       text[] not null default '{"global"}',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_factory_equipments_sites on content_factory_equipments using gin (sites);
create index if not exists idx_factory_equipments_active on content_factory_equipments(is_active);

-- ============================================
-- 3. 工厂生产流程表
-- ============================================

create table if not exists content_factory_processes (
  id          uuid primary key default gen_random_uuid(),
  title       jsonb not null default '{}'::jsonb,   -- 步骤标题（多语言）
  description jsonb not null default '{}'::jsonb,   -- 步骤描述（多语言）
  step_number int not null default 0,                -- 步骤序号
  icon_key    text,                                   -- 图标标识
  sort        int not null default 0,
  sites       text[] not null default '{"global"}',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_factory_processes_sites on content_factory_processes using gin (sites);
create index if not exists idx_factory_processes_active on content_factory_processes(is_active);

-- ============================================
-- 4. 服务项目表
-- ============================================

create table if not exists content_services (
  id          uuid primary key default gen_random_uuid(),
  title       jsonb not null default '{}'::jsonb,   -- 服务标题
  summary     jsonb not null default '{}'::jsonb,   -- 简短描述
  description jsonb not null default '{}'::jsonb,   -- 详细描述
  highlights  jsonb not null default '{}'::jsonb,   -- 亮点列表 { "en": ["...", ...], "zh": [...] }
  icon_key    text,                                   -- 图标标识
  gradient_from text,                                 -- 渐变起始色（卡片用）
  gradient_to   text,                                 -- 渐变结束色
  sort        int not null default 0,
  sites       text[] not null default '{"global"}',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_content_services_sites on content_services using gin (sites);
create index if not exists idx_content_services_active on content_services(is_active);

-- ============================================
-- 5. 现货/热销产品表（独立于产品表，用于首页现货展示）
-- ============================================

create table if not exists content_ready_stock (
  id          uuid primary key default gen_random_uuid(),
  name        jsonb not null default '{}'::jsonb,   -- 产品名
  model       text,                                   -- 款号
  cover_url   text,                                   -- 封面图
  price_range text,                                   -- 价格区间（可选）
  sort        int not null default 0,
  sites       text[] not null default '{"global"}',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_ready_stock_sites on content_ready_stock using gin (sites);
create index if not exists idx_ready_stock_active on content_ready_stock(is_active);

-- ============================================
-- 6. 通用内容区块表（灵活存储各类可配置区块）
-- ============================================

create table if not exists content_blocks (
  id          uuid primary key default gen_random_uuid(),
  block_key   text not null unique,                   -- 区块唯一标识（如 "home_cta", "factory_about"）
  title       jsonb not null default '{}'::jsonb,   -- 标题
  subtitle    jsonb not null default '{}'::jsonb,   -- 副标题
  content     jsonb not null default '{}'::jsonb,   -- 主内容（多语言富文本/HTML）
  image_url   text,                                   -- 配图
  items       jsonb not null default '[]'::jsonb,   -- 列表项（灵活结构）
  config      jsonb not null default '{}'::jsonb,   -- 其他配置
  sort        int not null default 0,
  sites       text[] not null default '{"global"}',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_content_blocks_key on content_blocks(block_key);
create index if not exists idx_content_blocks_sites on content_blocks using gin (sites);
create index if not exists idx_content_blocks_active on content_blocks(is_active);

-- ============================================
-- 7. 优势/特点表（通用，用于首页优势、工厂特点等）
-- ============================================

create table if not exists content_features (
  id          uuid primary key default gen_random_uuid(),
  category    text not null default 'home',          -- 分类：home / factory / services 等
  title       jsonb not null default '{}'::jsonb,   -- 标题
  description jsonb not null default '{}'::jsonb,   -- 描述
  icon_key    text,                                   -- 图标标识
  sort        int not null default 0,
  sites       text[] not null default '{"global"}',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_features_category on content_features(category);
create index if not exists idx_features_sites on content_features using gin (sites);
create index if not exists idx_features_active on content_features(is_active);

-- ============================================
-- 8. FAQ 表增加 category 字段（已有？确认一下，如果没有就加）
-- ============================================

do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'content_faqs' and column_name = 'category') then
    alter table content_faqs add column category text not null default 'general';
    create index idx_faqs_category on content_faqs(category);
  end if;
end $$;
