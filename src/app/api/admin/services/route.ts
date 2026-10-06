import { NextRequest, NextResponse } from 'next/server';
import { sql, deepParseJson } from '@/lib/db';
import { requireAdmin } from '@/lib/guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const rows = await sql`
    select * from content_services
    order by sort, id asc
  `;

  const services = deepParseJson(rows) as Array<{
    id: string;
    title: Record<string, string>;
    summary: Record<string, string>;
    description: Record<string, string>;
    highlights: Record<string, string[]>;
    icon_key: string | null;
    gradient_from: string | null;
    gradient_to: string | null;
    sort: number;
    sites: string[];
    is_active: boolean;
  }>;

  return NextResponse.json({ services });
}

export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { title, summary, description, highlights, icon_key, gradient_from, gradient_to, sort, sites, is_active } = body;

  const effectiveSites = Array.isArray(sites) && sites.length > 0 ? sites : ['global'];

  try {
    const rows = await sql`
      insert into content_services (
        title, summary, description, highlights, icon_key, gradient_from, gradient_to, sort, sites, is_active
      ) values (
        ${JSON.stringify(title || {})}::jsonb,
        ${JSON.stringify(summary || {})}::jsonb,
        ${JSON.stringify(description || {})}::jsonb,
        ${JSON.stringify(highlights || {})}::jsonb,
        ${icon_key || null},
        ${gradient_from || null},
        ${gradient_to || null},
        ${sort || 0},
        ${effectiveSites}::text[],
        ${is_active !== false}
      )
      returning id
    `;
    const parsed = deepParseJson(rows) as Array<{ id: string }>;
    await logAudit('admin', 'create', 'service', { id: parsed[0].id, title });
    return NextResponse.json({ ok: true, id: parsed[0].id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { id, title, summary, description, highlights, icon_key, gradient_from, gradient_to, sort, sites, is_active } = body;
  const effectiveSites = Array.isArray(sites) && sites.length > 0 ? sites : ['global'];

  try {
    await sql`
      update content_services set
        title = ${JSON.stringify(title || {})}::jsonb,
        summary = ${JSON.stringify(summary || {})}::jsonb,
        description = ${JSON.stringify(description || {})}::jsonb,
        highlights = ${JSON.stringify(highlights || {})}::jsonb,
        icon_key = ${icon_key || null},
        gradient_from = ${gradient_from || null},
        gradient_to = ${gradient_to || null},
        sort = ${sort || 0},
        sites = ${effectiveSites}::text[],
        is_active = ${is_active !== false},
        updated_at = now()
      where id = ${id}
    `;
    await logAudit('admin', 'update', 'service', { id, title });
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

  await sql`delete from content_services where id = ${id}`;
  await logAudit('admin', 'delete', 'service', { id });
  return NextResponse.json({ ok: true });
}
