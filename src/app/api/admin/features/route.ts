import { NextRequest, NextResponse } from 'next/server';
import { sql, deepParseJson } from '@/lib/db';
import { requireAdmin } from '@/lib/guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  let rows;
  if (category) {
    rows = await sql`
      select * from content_features
      where category = ${category}
      order by sort, id asc
    `;
  } else {
    rows = await sql`
      select * from content_features
      order by sort, id asc
    `;
  }

  const features = deepParseJson(rows) as Array<{
    id: string;
    category: string;
    title: Record<string, string>;
    description: Record<string, string>;
    icon_key: string | null;
    sort: number;
    sites: string[];
    is_active: boolean;
  }>;

  return NextResponse.json({ features });
}

export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { category, title, description, icon_key, sort, sites, is_active } = body;

  const effectiveSites = Array.isArray(sites) && sites.length > 0 ? sites : ['global'];

  try {
    const rows = await sql`
      insert into content_features (
        category, title, description, icon_key, sort, sites, is_active
      ) values (
        ${category || 'home'},
        ${JSON.stringify(title || {})}::jsonb,
        ${JSON.stringify(description || {})}::jsonb,
        ${icon_key || null},
        ${sort || 0},
        ${effectiveSites}::text[],
        ${is_active !== false}
      )
      returning id
    `;
    const parsed = deepParseJson(rows) as Array<{ id: string }>;
    await logAudit('admin', 'create', 'feature', { id: parsed[0].id, title });
    return NextResponse.json({ ok: true, id: parsed[0].id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { id, category, title, description, icon_key, sort, sites, is_active } = body;
  const effectiveSites = Array.isArray(sites) && sites.length > 0 ? sites : ['global'];

  try {
    await sql`
      update content_features set
        category = ${category || 'home'},
        title = ${JSON.stringify(title || {})}::jsonb,
        description = ${JSON.stringify(description || {})}::jsonb,
        icon_key = ${icon_key || null},
        sort = ${sort || 0},
        sites = ${effectiveSites}::text[],
        is_active = ${is_active !== false},
        updated_at = now()
      where id = ${id}
    `;
    await logAudit('admin', 'update', 'feature', { id, title });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 });

  await sql`delete from content_features where id = ${id}`;
  await logAudit('admin', 'delete', 'feature', { id });
  return NextResponse.json({ ok: true });
}
