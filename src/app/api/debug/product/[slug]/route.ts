import { NextResponse } from 'next/server';
import { sql, deepParseJson } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const rows = await sql`
      select id, slug, name, summary, detail_html, features,
             applications, advantages, specs, model, cover_url,
             gallery_urls, sort, sites, category_id
      from content_products
      where slug = ${slug}
      limit 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = deepParseJson(rows[0]);
    const result: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(product as Record<string, unknown>)) {
      result[key] = {
        type: Array.isArray(val) ? 'array' : typeof val,
        value: typeof val === 'object' && val !== null
          ? JSON.parse(JSON.stringify(val))
          : val,
      };
    }

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
