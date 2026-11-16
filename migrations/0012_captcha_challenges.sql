create table if not exists captcha_challenges (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_captcha_challenges_expires_at
  on captcha_challenges(expires_at);
