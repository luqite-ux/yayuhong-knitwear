import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import slugify from 'slugify';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const API_KEY = process.env.PRODUCT_IMPORT_API_KEY;

interface ProductImport {
  category_slug: string;
  name: { en: string; zh?: string };
  model?: string;
  image_url: string;
  gallery_urls?: string[];
  material?: { en: string; zh?: string };
  summary?: { en?: string; zh?: string };
  source?: string;
  sort?: number;
  is_active?: boolean;
  sites?: string[];
}

function validateApiKey(req: NextRequest): boolean {
  if (!API_KEY) return false;
  const key = req.headers.get('x-api-key') || req.headers.get('X-API-Key');
  return key === API_KEY;
}

export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  let body: ProductImport | ProductImport[];
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const products = Array.isArray(body) ? body : [body];

  if (products.length === 0) {
    return NextResponse.json({ error: 'No products provided' }, { status: 400 });
  }

  if (products.length > 100) {
    return NextResponse.json({ error: 'Maximum 100 products per request' }, { status: 400 });
  }

  // Validate required fields
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!p.category_slug) {
      return NextResponse.json({ error: `Product ${i + 1}: missing category_slug` }, { status: 400 });
    }
    if (!p.name?.en) {
      return NextResponse.json({ error: `Product ${i + 1}: missing name.en` }, { status: 400 });
    }
    if (!p.image_url) {
      return NextResponse.json({ error: `Product ${i + 1}: missing image_url` }, { status: 400 });
    }
  }

  // Get all category slugs
  const categories = await sql`
    select id, slug from content_categories where slug is not null
  `;
  const catMap = new Map(categories.map((c) => [c.slug, c.id]));

  const results: { index: number; id?: number; slug?: string; error?: string }[] = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];

    const categoryId = catMap.get(p.category_slug);
    if (!categoryId) {
      results.push({ index: i, error: `Category "${p.category_slug}" not found` });
      continue;
    }

    // Build name object
    const nameObj: Record<string, string> = { en: p.name.en };
    if (p.name.zh) nameObj.zh = p.name.zh;

    // Build summary from material if provided
    const summaryObj: Record<string, string> = {};
    if (p.material?.en) {
      summaryObj.en = `Material: ${p.material.en}`;
    }
    if (p.material?.zh) {
      summaryObj.zh = `材质：${p.material.zh}`;
    }
    if (p.summary?.en) summaryObj.en = p.summary.en;
    if (p.summary?.zh) summaryObj.zh = p.summary.zh;

    // Generate slug
    let slug = p.model
      ? slugify(p.model, { lower: true, strict: true })
      : slugify(p.name.en, { lower: true, strict: true });
    if (!slug) slug = `product-${Date.now()}-${i}`;

    // Ensure unique slug
    const existing = await sql`select id from content_products where slug = ${slug}`;
    if (existing.length > 0) {
      slug = `${slug}-${Date.now()}${i}`;
    }

    // Gallery URLs
    const galleryUrls = p.gallery_urls && p.gallery_urls.length > 0 ? p.gallery_urls : null;

    // Sites
    const sites = p.sites && p.sites.length > 0 ? p.sites : ['global'];

    try {
      const rows = await sql`
        insert into content_products (
          category_id, name, summary, model, slug, cover_url, gallery_urls,
          is_active, sort, sites
        ) values (
          ${categoryId},
          ${JSON.stringify(nameObj)}::jsonb,
          ${JSON.stringify(summaryObj)}::jsonb,
          ${p.model || null},
          ${slug},
          ${p.image_url},
          ${galleryUrls || null},
          ${p.is_active !== false},
          ${p.sort || 0},
          ${sites}::text[]
        )
        returning id, slug
      `;
      results.push({ index: i, id: rows[0].id, slug: rows[0].slug });
    } catch (err: any) {
      results.push({ index: i, error: err.message });
    }
  }

  const successCount = results.filter((r) => r.id).length;
  const failCount = results.filter((r) => r.error).length;

  return NextResponse.json({
    success: true,
    total: products.length,
    created: successCount,
    failed: failCount,
    results,
  });
}

export async function GET(req: NextRequest) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get('category');

  const countRes = categorySlug
    ? await sql`
        select count(*)::text as total
        from content_products p
        left join content_categories c on p.category_id = c.id
        where c.slug = ${categorySlug}
      `
    : await sql`select count(*)::text as total from content_products`;

  const categories = await sql`
    select id, slug, name, sort
    from content_categories
    order by sort, created_at
  `;

  return NextResponse.json({
    total_products: Number(countRes[0].total),
    categories: categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      sort: c.sort,
    })),
  });
}
