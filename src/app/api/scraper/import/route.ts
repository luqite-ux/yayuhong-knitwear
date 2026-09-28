import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import slugify from 'slugify';
import { getPlatform } from '@/lib/scraper/platforms';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const API_KEY = process.env.PRODUCT_IMPORT_API_KEY;

interface ScrapedProductInput {
  platform_id?: string;
  platform_product_id?: string;
  name: { en: string; zh?: string };
  model?: string;
  image_url: string;
  gallery_urls?: string[];
  price?: { amount: number; currency: string };
  original_price?: { amount: number; currency: string };
  rating?: number;
  review_count?: number;
  sales_count?: number;
  is_hot?: boolean;
  material?: { en: string; zh?: string };
  description?: { en: string; zh?: string };
  tags?: string[];
  product_url?: string;
  source?: string;
  sort?: number;
  is_active?: boolean;
}

function validateApiKey(req: NextRequest): boolean {
  if (!API_KEY) return false;
  const key = req.headers.get('x-api-key') || req.headers.get('X-API-Key');
  return key === API_KEY;
}

/**
 * POST /api/scraper/import
 *
 * Import scraped products directly into the database.
 * Accepts single product or array of up to 100 products.
 *
 * Header: X-API-Key: <your-api-key>
 *
 * Body:
 * {
 *   "category_slug": "womens",   // our internal category slug
 *   "products": [
 *     {
 *       "name": { "en": "Knit Sweater" },
 *       "image_url": "https://...",
 *       "source": "shein",
 *       ...
 *     }
 *   ]
 * }
 *
 * OR simplified format (for backward compat with /api/public/products/import):
 * {
 *   "category_slug": "womens",
 *   "name": { "en": "..." },
 *   "image_url": "...",
 *   ...
 * }
 */
export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: 'Invalid API key. Set X-API-Key header.' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const categorySlug = body.category_slug;
  if (!categorySlug) {
    return NextResponse.json({ error: 'category_slug is required' }, { status: 400 });
  }

  // Normalize products array
  let products: ScrapedProductInput[];
  if (body.products && Array.isArray(body.products)) {
    products = body.products;
  } else if (body.name && body.image_url) {
    products = [body];
  } else {
    return NextResponse.json(
      { error: 'Either "products" array or a single product with name + image_url is required' },
      { status: 400 }
    );
  }

  if (products.length === 0) {
    return NextResponse.json({ error: 'No products provided' }, { status: 400 });
  }
  if (products.length > 100) {
    return NextResponse.json({ error: 'Maximum 100 products per request' }, { status: 400 });
  }

  // Validate required fields
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!p.name?.en) {
      return NextResponse.json(
        { error: `Product ${i + 1}: name.en is required` },
        { status: 400 }
      );
    }
    if (!p.image_url) {
      return NextResponse.json(
        { error: `Product ${i + 1}: image_url is required` },
        { status: 400 }
      );
    }
  }

  // Get category id
  const categories = await sql`
    select id, slug from content_categories where slug = ${categorySlug}
  `;
  if (categories.length === 0) {
    return NextResponse.json(
      { error: `Category "${categorySlug}" not found` },
      { status: 400 }
    );
  }
  const categoryId = categories[0].id;

  const results: {
    index: number;
    id?: number;
    slug?: string;
    name?: string;
    error?: string;
    skipped?: boolean;
    skip_reason?: string;
  }[] = [];

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const source = p.source || body.source || 'scraper';

    try {
      // Check for duplicate by platform product ID or exact name match
      if (p.platform_product_id) {
        const existing = await sql`
          select id from content_products
          where summary->>'platform_product_id' = ${p.platform_product_id}
             or summary->>'platform_id' = ${p.platform_id || source}
            and name->>'en' = ${p.name.en}
          limit 1
        `;
        if (existing.length > 0) {
          skipped++;
          results.push({
            index: i,
            name: p.name.en,
            skipped: true,
            skip_reason: 'Duplicate product',
          });
          continue;
        }
      }

      // Build name object
      const nameObj: Record<string, string> = { en: p.name.en };
      if (p.name.zh) nameObj.zh = p.name.zh;

      // Build summary with all extra metadata
      const summaryObj: Record<string, string> = {};
      if (p.material?.en) summaryObj.material_en = p.material.en;
      if (p.material?.zh) summaryObj.material_zh = p.material.zh;
      if (p.description?.en) summaryObj.description_en = p.description.en;
      if (p.description?.zh) summaryObj.description_zh = p.description.zh;
      if (p.price) summaryObj.price = `${p.price.amount} ${p.price.currency}`;
      if (p.original_price) summaryObj.original_price = `${p.original_price.amount} ${p.original_price.currency}`;
      if (p.rating !== undefined) summaryObj.rating = String(p.rating);
      if (p.review_count !== undefined) summaryObj.review_count = String(p.review_count);
      if (p.sales_count !== undefined) summaryObj.sales_count = String(p.sales_count);
      if (p.is_hot !== undefined) summaryObj.is_hot = String(p.is_hot);
      if (p.product_url) summaryObj.product_url = p.product_url;
      if (p.platform_id) summaryObj.platform_id = p.platform_id;
      if (p.platform_product_id) summaryObj.platform_product_id = p.platform_product_id;
      if (p.tags && p.tags.length > 0) summaryObj.tags = p.tags.join(', ');
      summaryObj.source = source;

      // Generate slug
      let slug = p.model
        ? slugify(p.model, { lower: true, strict: true })
        : slugify(p.name.en, { lower: true, strict: true });
      if (!slug) slug = `${source}-${Date.now()}-${i}`;

      // Ensure unique slug
      const slugExists = await sql`select id from content_products where slug = ${slug}`;
      if (slugExists.length > 0) {
        slug = `${slug}-${Date.now()}${i}`;
      }

      // Gallery URLs
      const galleryUrls = p.gallery_urls && p.gallery_urls.length > 0 ? p.gallery_urls : null;

      // Sites
      const sites = ['global'];

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

      created++;
      results.push({
        index: i,
        id: rows[0].id,
        slug: rows[0].slug,
        name: p.name.en,
      });
    } catch (err: any) {
      failed++;
      results.push({
        index: i,
        name: p.name?.en || `product_${i}`,
        error: err.message,
      });
    }
  }

  return NextResponse.json({
    success: true,
    category: categorySlug,
    total: products.length,
    created,
    skipped,
    failed,
    results,
  });
}
