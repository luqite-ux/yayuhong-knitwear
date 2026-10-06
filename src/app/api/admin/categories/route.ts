import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/guard';
import { logAudit } from '@/lib/audit';
import slugify from 'slugify';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const categories = await sql`
    select c.*, p.name as parent_name
    from content_categories c
    left join content_categories p on c.parent_id = p.id
    order by c.sort, c.created_at
  `;
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { name, slug, parent_id, sort } = await req.json();
  const finalSlug = slug || slugify(typeof name === 'object' ? name.en || name.zh : name, { lower: true, strict: true }) || `cat-${Date.now()}`;

  try {
    const rows = await sql`
      insert into content_categories (name, slug, parent_id, sort)
      values (${JSON.stringify(name)}::jsonb, ${finalSlug}, ${parent_id || null}, ${sort || 0})
      returning id, slug
    `;
    await logAudit('admin', 'create', 'category', { id: rows[0].id, slug: rows[0].slug });
    return NextResponse.json({ ok: true, id: rows[0].id, slug: rows[0].slug });
  } catch (err: any) {
    if (err.code === '23505') {
      return NextResponse.json({ error: 'slug 已存在' }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { id, name, slug, parent_id, sort } = await req.json();
  try {
    await sql`
      update content_categories set
        name = ${JSON.stringify(name)}::jsonb,
        slug = ${slug},
        parent_id = ${parent_id || null},
        sort = ${sort || 0},
        updated_at = now()
      where id = ${id}
    `;
    await logAudit('admin', 'update', 'category', { id });
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

  await sql`delete from content_categories where id = ${id}`;
  await logAudit('admin', 'delete', 'category', { id });
  return NextResponse.json({ ok: true });
}
