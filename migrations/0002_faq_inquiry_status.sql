-- 0002_faq_inquiry_status.sql
-- FAQ 管理 + 询盘状态流转 + 跟进记录

-- ========== FAQ ==========
create table if not exists content_faqs (
  id uuid primary key default gen_random_uuid(),
  category text,
  question jsonb not null default '{}'::jsonb,   -- 多语言问题 zh/en/ru...
  answer jsonb not null default '{}'::jsonb,      -- 多语言答案
  sort int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_faqs_active on content_faqs(is_active);
create index if not exists idx_faqs_category on content_faqs(category);
create index if not exists idx_faqs_sort on content_faqs(sort);

-- ========== 询盘状态扩展 ==========
-- 新增状态字段和来源字段
alter table inquiries
  add column if not exists status text not null default 'new'
    check (status in ('new','contacting','quoted','won','lost','spam')),
  add column if not exists source text not null default 'website',
  add column if not exists assignee text,
  add column if not exists admin_note text,
  add column if not exists whatsapp text,
  add column if not exists country text,
  add column if not exists updated_at timestamptz not null default now();

-- 已有的 is_read 保留兼容，以 status 为主
create index if not exists idx_inquiries_status on inquiries(status);
create index if not exists idx_inquiries_created on inquiries(created_at desc);

-- ========== 询盘跟进记录 ==========
create table if not exists inquiry_follow_ups (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references inquiries(id) on delete cascade,
  action text not null,                 -- note / call / email / whatsapp / quote / status_change
  content text not null default '',
  status_before text,
  status_after text,
  created_by text not null default 'admin',
  created_at timestamptz not null default now()
);

create index if not exists idx_follow_ups_inquiry on inquiry_follow_ups(inquiry_id);
create index if not exists idx_follow_ups_created on inquiry_follow_ups(created_at desc);
