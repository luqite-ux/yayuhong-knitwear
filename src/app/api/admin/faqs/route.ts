import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/guard';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const faqs = await sql`
    select id, category, question, answer, sort, is_active, sites, created_at, updated_at
    from content_faqs
    order by sort, created_at desc
  `;

  return NextResponse.json({ faqs });
}

export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  try {
    const body = await req.json();
    const { category, question, answer, sort, is_active, sites } = body;
    const effectiveSites = Array.isArray(sites) && sites.length > 0 ? sites : ['global'];

    const rows = await sql`
      insert into content_faqs (category, question, answer, sort, is_active, sites)
      values (
        ${category || null},
        ${JSON.stringify(question || {})}::jsonb,
        ${JSON.stringify(answer || {})}::jsonb,
        ${Number(sort) || 0},
        ${is_active !== false},
        ${effectiveSites}::text[]
      )
      returning id
    `;

    await logAudit('admin', 'faq_create', rows[0].id, { category });
    return NextResponse.json({ ok: true, id: rows[0].id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, category, question, answer, sort, is_active, sites } = body;
    if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 });
    const effectiveSites = Array.isArray(sites) && sites.length > 0 ? sites : ['global'];

    await sql`
      update content_faqs set
        category = ${category || null},
        question = ${JSON.stringify(question || {})}::jsonb,
        answer = ${JSON.stringify(answer || {})}::jsonb,
        sort = ${Number(sort) || 0},
        is_active = ${is_active !== false},
        sites = ${effectiveSites}::text[],
        updated_at = now()
      where id = ${id}
    `;

    await logAudit('admin', 'faq_update', id, { category });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 });

    await sql`delete from content_faqs where id = ${id}`;
    await logAudit('admin', 'faq_delete', id, {});
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
