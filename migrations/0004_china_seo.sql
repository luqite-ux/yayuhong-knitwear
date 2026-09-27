-- 0004_china_seo.sql
-- 国内站 SEO + GEO 扩展字段

-- ========== site_profile 扩展 ==========
alter table site_profile
  add column if not exists baidu_verification text,           -- 百度站点验证
  add column if not exists baidu_analytics text,               -- 百度统计 ID
  add column if not exists baidu_push_token text,              -- 百度主动推送 token
  add column if not exists haosou_verification text,           -- 360好搜验证
  add column if not exists sogou_verification text,            -- 搜狗验证
  add column if not exists shenma_verification text,           -- 神马验证
  add column if not exists doubao_verification text,           -- 豆包AI搜索验证
  add column if not exists china_seo jsonb not null default '{}'::jsonb,  -- 国内SEO额外配置
  add column if not exists china_geo jsonb not null default '{}'::jsonb;  -- 国内GEO(AI搜索)配置

-- ========== 百度收录记录表 ==========
create table if not exists china_baidu_index_log (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  action text not null,             -- push / check / update
  status text not null,             -- success / failed
  response jsonb,
  checked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_baidu_index_url on china_baidu_index_log(url);
create index if not exists idx_baidu_index_created on china_baidu_index_log(created_at);

-- ========== 国内 GEO 监控表 ==========
create table if not exists china_geo_monitor (
  id uuid primary key default gen_random_uuid(),
  query text not null,              -- 监控的搜索词
  engine text not null,             -- doubao / kimi / wenxin / tongyi
  position int,                     -- 排名位置
  has_citation boolean default false, -- 是否有引用
  snippet text,                     -- AI引用的摘要
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_geo_monitor_query on china_geo_monitor(query);
create index if not exists idx_geo_monitor_engine on china_geo_monitor(engine);
