-- 0006_api_keys.sql
-- API Key 认证：支持通过 Authorization: Bearer <key> 调用 admin API

create table if not exists admin_api_keys (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  key_hash    text not null unique,
  key_prefix  text not null,
  permissions text[] not null default '{"*"}',
  rate_limit  int not null default 1000,
  is_active   boolean not null default true,
  last_used_at timestamptz,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz
);

create index if not exists idx_api_keys_hash on admin_api_keys(key_hash);
create index if not exists idx_api_keys_active on admin_api_keys(is_active);
