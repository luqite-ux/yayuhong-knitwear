import { NextRequest, NextResponse } from 'next/server';
import { sql, deepParseJson } from '@/lib/db';
import { requireAdmin } from '@/lib/guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const rows = await sql`
    select * from content_ready_stock
    order by sort, id asc
  `;

  const readyStock = deepParseJson(rows) as Array<{
    id: string;
    name: Record<string, string>;
    model: string | null;
    cover_url: string | null;
    price_range: string | null;
    sort: number;
    sites: string[];
    is_active: boolean;
  }>;

  return NextResponse.json({ readyStock });
}

export async function POST(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { name, model, cover_url, price_range, sort, sites, is_active } = body;

  const effectiveSites = Array.isArray(sites) && sites.length > 0 ? sites : ['global'];

  try {
    const rows = await sql`
      insert into content_ready_stock (
        name, model, cover_url, price_range, sort, sites, is_active
      ) values (
        ${JSON.stringify(name || {})}::jsonb,
        ${model || null},
        ${cover_url || null},
        ${price_range || null},
        ${sort || 0},
        ${effectiveSites}::text[],
        ${is_active !== false}
      )
      returning id
    `;
    const parsed = deepParseJson(rows) as Array<{ id: string }>;
    await logAudit('admin', 'create', 'ready_stock', { id: parsed[0].id, name });
    return NextResponse.json({ ok: true, id: parsed[0].id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { id, name, model, cover_url, price_range, sort, sites, is_active } = body;
  const effectiveSites = Array.isArray(sites) && sites.length > 0 ? sites : ['global'];

  try {
    await sql`
      update content_ready_stock set
        name = ${JSON.stringify(name || {})}::jsonb,
        model = ${model || null},
        cover_url = ${cover_url || null},
        price_range = ${price_range || null},
        sort = ${sort || 0},
        sites = ${effectiveSites}::text[],
        is_active = ${is_active !== false},
        updated_at = now()
      where id = ${id}
    `;
    await logAudit('admin', 'update', 'ready_stock', { id, name });
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

  await sql`delete from content_ready_stock where id = ${id}`;
  await logAudit('admin', 'delete', 'ready_stock', { id });
  return NextResponse.json({ ok: true });
}
