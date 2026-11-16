-- 0011_inquiry_attribution.sql
-- 询盘归因字段：用于追踪询盘来源（UTM、Referrer、落地页、提交页、UA）

alter table inquiries
  add column if not exists referrer text,
  add column if not exists landing_page text,
  add column if not exists submit_page text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_term text,
  add column if not exists utm_content text,
  add column if not exists user_agent text;

-- 首次触点记录时间（用于归因分析）
alter table inquiries
  add column if not exists first_touch_at timestamptz;

-- 便于按来源统计
create index if not exists idx_inquiries_utm_source on inquiries(utm_source);
create index if not exists idx_inquiries_landing on inquiries(landing_page);
