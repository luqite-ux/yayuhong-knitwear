import { NextRequest, NextResponse } from 'next/server';
import { sql, deepParseJson } from '@/lib/db';
import { requireAdmin } from '@/lib/guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const blockKey = searchParams.get('block_key');

  let rows;
  if (blockKey) {
    rows = await sql`
      select * from content_blocks
      where block_key = ${blockKey}
      limit 1
    `;
  } else {
    rows = await sql`
      select * from content_blocks
      order by sort, id asc
    `;
  }

  const blocks = deepParseJson(rows) as Array<{
    id: string;
    block_key: string;
    title: Record<string, string>;
    subtitle: Record<string, string>;
    content: Record<string, string>;
    image_url: string | null;
    items: unknown;
    config: Record<string, unknown>;
    sort: number;
    sites: string[];
    is_active: boolean;
  }>;

  if (blockKey && blocks.length > 0) {
    return NextResponse.json({ block: blocks[0] });
  }

  return NextResponse.json({ blocks });
}

export async function POST(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { block_key, title, subtitle, content, image_url, items, config, sort, sites, is_active } = body;

  const effectiveSites = Array.isArray(sites) && sites.length > 0 ? sites : ['global'];

  try {
    const rows = await sql`
      insert into content_blocks (
        block_key, title, subtitle, content, image_url, items, config, sort, sites, is_active
      ) values (
        ${block_key},
        ${JSON.stringify(title || {})}::jsonb,
        ${JSON.stringify(subtitle || {})}::jsonb,
        ${JSON.stringify(content || {})}::jsonb,
        ${image_url || null},
        ${JSON.stringify(items || [])}::jsonb,
        ${JSON.stringify(config || {})}::jsonb,
        ${sort || 0},
        ${effectiveSites}::text[],
        ${is_active !== false}
      )
      returning id
    `;
    const parsed = deepParseJson(rows) as Array<{ id: string }>;
    await logAudit('admin', 'create', 'block', { id: parsed[0].id, block_key });
    return NextResponse.json({ ok: true, id: parsed[0].id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { id, title, subtitle, content, image_url, items, config, sort, sites, is_active } = body;
  const effectiveSites = Array.isArray(sites) && sites.length > 0 ? sites : ['global'];

  try {
    await sql`
      update content_blocks set
        title = ${JSON.stringify(title || {})}::jsonb,
        subtitle = ${JSON.stringify(subtitle || {})}::jsonb,
        content = ${JSON.stringify(content || {})}::jsonb,
        image_url = ${image_url || null},
        items = ${JSON.stringify(items || [])}::jsonb,
        config = ${JSON.stringify(config || {})}::jsonb,
        sort = ${sort || 0},
        sites = ${effectiveSites}::text[],
        is_active = ${is_active !== false},
        updated_at = now()
      where id = ${id}
    `;
    await logAudit('admin', 'update', 'block', { id });
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

  await sql`delete from content_blocks where id = ${id}`;
  await logAudit('admin', 'delete', 'block', { id });
  return NextResponse.json({ ok: true });
}
