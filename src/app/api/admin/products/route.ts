import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/guard';
import { logAudit } from '@/lib/audit';
import slugify from 'slugify';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const [products, countRes] = await Promise.all([
    sql`
      select p.*, c.name as category_name, c.slug as category_slug
      from content_products p
      left join content_categories c on p.category_id = c.id
      order by p.sort, p.created_at desc
      limit ${limit} offset ${offset}
    `,
    sql`select count(*)::text as total from content_products`,
  ]);

  return NextResponse.json({
    products,
    total: Number(countRes[0].total),
    page,
    totalPages: Math.ceil(Number(countRes[0].total) / limit),
  });
}

export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { name, summary, detail_html, features, applications, advantages, specs, model, category_id, cover_url, gallery_urls, is_active, sort, sites } = body;

  let slug = body.slug || slugify(model || (typeof name === 'object' ? name.en || name.zh : name), { lower: true, strict: true });
  if (!slug) slug = `product-${Date.now()}`;

  const effectiveSites = Array.isArray(sites) && sites.length > 0 ? sites : ['global'];

  try {
    const rows = await sql`
      insert into content_products (
        category_id, name, summary, detail_html, features, applications, advantages, specs,
        model, slug, cover_url, gallery_urls, is_active, sort, sites
      ) values (
        ${category_id || null},
        ${JSON.stringify(name)}::jsonb,
        ${JSON.stringify(summary || {})}::jsonb,
        ${JSON.stringify(detail_html || {})}::jsonb,
        ${JSON.stringify(features || {})}::jsonb,
        ${JSON.stringify(applications || {})}::jsonb,
        ${JSON.stringify(advantages || {})}::jsonb,
        ${JSON.stringify(specs || {})}::jsonb,
        ${model || null},
        ${slug},
        ${cover_url || null},
        ${gallery_urls || null},
        ${is_active !== false},
        ${sort || 0},
        ${effectiveSites}::text[]
      )
      returning id, slug
    `;
    await logAudit('admin', 'create', 'product', { id: rows[0].id, slug });
    return NextResponse.json({ ok: true, id: rows[0].id, slug: rows[0].slug });
  } catch (err: any) {
    if (err.code === '23505') {
      return NextResponse.json({ error: 'slug 已存在，请更换' }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { id, name, summary, detail_html, features, applications, advantages, specs, model, slug, category_id, cover_url, gallery_urls, is_active, sort, sites } = body;
  const effectiveSites = Array.isArray(sites) && sites.length > 0 ? sites : ['global'];

  try {
    await sql`
      update content_products set
        category_id = ${category_id || null},
        name = ${JSON.stringify(name || {})}::jsonb,
        summary = ${JSON.stringify(summary || {})}::jsonb,
        detail_html = ${JSON.stringify(detail_html || {})}::jsonb,
        features = ${JSON.stringify(features || {})}::jsonb,
        applications = ${JSON.stringify(applications || {})}::jsonb,
        advantages = ${JSON.stringify(advantages || {})}::jsonb,
        specs = ${JSON.stringify(specs || {})}::jsonb,
        model = ${model || null},
        slug = ${slug || null},
        cover_url = ${cover_url || null},
        gallery_urls = ${gallery_urls || null},
        is_active = ${is_active !== false},
        sort = ${sort || 0},
        sites = ${effectiveSites}::text[],
        updated_at = now()
      where id = ${id}
    `;
    await logAudit('admin', 'update', 'product', { id });
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

  await sql`delete from content_products where id = ${id}`;
  await logAudit('admin', 'delete', 'product', { id });
  return NextResponse.json({ ok: true });
}
