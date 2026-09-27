import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/guard';
import { logAudit } from '@/lib/audit';
import slugify from 'slugify';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const page = Number(searchParams.get('page')) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const where = status ? sql`where a.status = ${status}` : sql``;

  const [articles, countRes] = await Promise.all([
    sql`
      select a.id, a.slug, a.title, a.excerpt, a.cover_url, a.status, a.locale,
             a.published_at, a.source, a.created_at
      from content_articles a
      ${where}
      order by a.created_at desc
      limit ${limit} offset ${offset}
    `,
    sql`select count(*)::text as total from content_articles ${where}`,
  ]);

  return NextResponse.json({
    articles,
    total: Number(countRes[0].total),
    page,
    totalPages: Math.ceil(Number(countRes[0].total) / limit),
  });
}

export async function POST(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { title, excerpt, content_html, meta_description, cover_url, supporting_keywords, faq_schema, article_schema, locale, status, sites } = body;

  const titleStr = typeof title === 'object' ? (title.en || title.zh || Object.values(title)[0] || '') : title;
  let slug = body.slug || slugify(titleStr, { lower: true, strict: true });
  if (!slug) slug = `article-${Date.now()}`;

  const effectiveSites = Array.isArray(sites) && sites.length > 0 ? sites : ['global'];

  try {
    const rows = await sql`
      insert into content_articles (
        title, excerpt, content_html, meta_description, slug,
        cover_url, supporting_keywords, faq_schema, article_schema,
        locale, status, published_at, source, sites
      ) values (
        ${JSON.stringify(title || {})}::jsonb,
        ${JSON.stringify(excerpt || {})}::jsonb,
        ${JSON.stringify(content_html || {})}::jsonb,
        ${JSON.stringify(meta_description || {})}::jsonb,
        ${slug},
        ${cover_url || null},
        ${supporting_keywords || null},
        ${JSON.stringify(faq_schema || {})}::jsonb,
        ${JSON.stringify(article_schema || {})}::jsonb,
        ${locale || 'en'},
        ${status || 'published'},
        ${status === 'published' ? new Date() : null},
        'manual',
        ${effectiveSites}::text[]
      )
      returning id, slug
    `;
    await logAudit('admin', 'create', 'article', { id: rows[0].id, slug: rows[0].slug });
    return NextResponse.json({ ok: true, id: rows[0].id, slug: rows[0].slug });
  } catch (err: any) {
    if (err.code === '23505') {
      return NextResponse.json({ error: 'slug 已存在' }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { id, title, excerpt, content_html, meta_description, cover_url, supporting_keywords, faq_schema, article_schema, locale, status, sites } = body;
  const effectiveSites = Array.isArray(sites) && sites.length > 0 ? sites : ['global'];

  const wasPublished = await sql`select status from content_articles where id = ${id}`;
  const nowPublished = status === 'published' && wasPublished[0]?.status !== 'published';

  try {
    await sql`
      update content_articles set
        title = ${JSON.stringify(title || {})}::jsonb,
        excerpt = ${JSON.stringify(excerpt || {})}::jsonb,
        content_html = ${JSON.stringify(content_html || {})}::jsonb,
        meta_description = ${JSON.stringify(meta_description || {})}::jsonb,
        cover_url = ${cover_url || null},
        supporting_keywords = ${supporting_keywords || null},
        faq_schema = ${JSON.stringify(faq_schema || {})}::jsonb,
        article_schema = ${JSON.stringify(article_schema || {})}::jsonb,
        locale = ${locale || 'en'},
        status = ${status || 'published'},
        sites = ${effectiveSites}::text[],
        published_at = ${nowPublished ? new Date() : null},
        updated_at = now()
      where id = ${id}
    `;
    await logAudit('admin', 'update', 'article', { id, status });
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

  await sql`delete from content_articles where id = ${id}`;
  await logAudit('admin', 'delete', 'article', { id });
  return NextResponse.json({ ok: true });
}
