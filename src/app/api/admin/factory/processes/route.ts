import { NextRequest, NextResponse } from 'next/server';
import { sql, deepParseJson } from '@/lib/db';
import { requireAdmin } from '@/lib/guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const rows = await sql`
    select * from content_factory_processes
    order by sort, step_number, id asc
  `;

  const processes = deepParseJson(rows) as Array<{
    id: string;
    title: Record<string, string>;
    description: Record<string, string>;
    step_number: number;
    icon_key: string | null;
    sort: number;
    sites: string[];
    is_active: boolean;
  }>;

  return NextResponse.json({ processes });
}

export async function POST(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { title, description, step_number, icon_key, sort, sites, is_active } = body;

  const effectiveSites = Array.isArray(sites) && sites.length > 0 ? sites : ['global'];

  try {
    const rows = await sql`
      insert into content_factory_processes (
        title, description, step_number, icon_key, sort, sites, is_active
      ) values (
        ${JSON.stringify(title || {})}::jsonb,
        ${JSON.stringify(description || {})}::jsonb,
        ${step_number || 0},
        ${icon_key || null},
        ${sort || 0},
        ${effectiveSites}::text[],
        ${is_active !== false}
      )
      returning id
    `;
    const parsed = deepParseJson(rows) as Array<{ id: string }>;
    await logAudit('admin', 'create', 'factory_process', { id: parsed[0].id, title });
    return NextResponse.json({ ok: true, id: parsed[0].id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { id, title, description, step_number, icon_key, sort, sites, is_active } = body;
  const effectiveSites = Array.isArray(sites) && sites.length > 0 ? sites : ['global'];

  try {
    await sql`
      update content_factory_processes set
        title = ${JSON.stringify(title || {})}::jsonb,
        description = ${JSON.stringify(description || {})}::jsonb,
        step_number = ${step_number || 0},
        icon_key = ${icon_key || null},
        sort = ${sort || 0},
        sites = ${effectiveSites}::text[],
        is_active = ${is_active !== false},
        updated_at = now()
      where id = ${id}
    `;
    await logAudit('admin', 'update', 'factory_process', { id, title });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 });

  await sql`delete from content_factory_processes where id = ${id}`;
  await logAudit('admin', 'delete', 'factory_process', { id });
  return NextResponse.json({ ok: true });
}
