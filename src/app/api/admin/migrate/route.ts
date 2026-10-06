import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  try {
    // 检查 schema_migrations 表
    await sql`create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )`;
    const applied = await sql`select name from schema_migrations order by name`;
    return NextResponse.json({
      ok: true,
      applied: applied.map((r: any) => r.name),
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  try {
    await sql`create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )`;

    // 执行 0005_cms_extension.sql
    const migrationName = '0005_cms_extension.sql';
    const existing = await sql`select name from schema_migrations where name = ${migrationName}`;
    if (existing.length > 0) {
      return NextResponse.json({ ok: true, skipped: true, message: 'Migration already applied' });
    }

    // 用事务执行
    const result = await sql.begin(async (tx: any) => {
      // 1. 扩展 site_profile
      await tx`
        alter table site_profile
          add column if not exists stats jsonb not null default '{}'::jsonb,
          add column if not exists social_links jsonb not null default '{}'::jsonb,
          add column if not exists footer_config jsonb not null default '{}'::jsonb,
          add column if not exists hero_config jsonb not null default '{}'::jsonb
      `;

      // 2. 工厂设备表
      await tx`
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
        )
      `;
      await tx`create index if not exists idx_factory_equipments_sites on content_factory_equipments using gin (sites)`;
      await tx`create index if not exists idx_factory_equipments_active on content_factory_equipments(is_active)`;

      // 3. 工厂生产流程表
      await tx`
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
        )
      `;
      await tx`create index if not exists idx_factory_processes_sites on content_factory_processes using gin (sites)`;
      await tx`create index if not exists idx_factory_processes_active on content_factory_processes(is_active)`;

      // 4. 服务项目表
      await tx`
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
        )
      `;
      await tx`create index if not exists idx_content_services_sites on content_services using gin (sites)`;
      await tx`create index if not exists idx_content_services_active on content_services(is_active)`;

      // 5. 现货产品表
      await tx`
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
        )
      `;
      await tx`create index if not exists idx_ready_stock_sites on content_ready_stock using gin (sites)`;
      await tx`create index if not exists idx_ready_stock_active on content_ready_stock(is_active)`;

      // 6. 通用内容区块表
      await tx`
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
        )
      `;
      await tx`create index if not exists idx_content_blocks_key on content_blocks(block_key)`;
      await tx`create index if not exists idx_content_blocks_sites on content_blocks using gin (sites)`;
      await tx`create index if not exists idx_content_blocks_active on content_blocks(is_active)`;

      // 7. 优势/特点表
      await tx`
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
        )
      `;
      await tx`create index if not exists idx_features_category on content_features(category)`;
      await tx`create index if not exists idx_features_sites on content_features using gin (sites)`;
      await tx`create index if not exists idx_features_active on content_features(is_active)`;

      // 8. FAQ 表增加 category 字段
      try {
        await tx`alter table content_faqs add column category text not null default 'general'`;
        await tx`create index idx_faqs_category on content_faqs(category)`;
      } catch {
        // 字段可能已存在，忽略
      }

      // 记录 migration
      await tx`insert into schema_migrations (name) values (${migrationName})`;

      return { success: true, migration: migrationName };
    });

    await logAudit('admin', 'migrate', 'database', { migration: migrationName });

    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    console.error('Migration failed:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
