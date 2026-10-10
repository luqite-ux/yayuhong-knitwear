import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/**
 * 批量更新越南产品封面图 URL（图片已放在 public/products/vn/ 下）
 * POST body: { token: string }
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const migrationToken = process.env.MIGRATION_TOKEN;

  let authorized = false;
  if (authHeader?.startsWith('Bearer ') && migrationToken) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (token === migrationToken) authorized = true;
  }

  if (!authorized) return NextResponse.json({ error: '未授权' }, { status: 401 });

  try {
    const products = [
      { slug: 'vn-tencel-sun-protection-cardigan', cover: '/products/vn/vn-tencel-sun-cardigan.jpg' },
      { slug: 'vn-mesh-knit-cardigan-fg063', cover: '/products/vn/vn-mesh-knit-cardigan.jpg' },
      { slug: 'vn-half-turtleneck-cotton-knit', cover: '/products/vn/vn-half-turtleneck-knit.jpg' },
      { slug: 'vn-gathered-long-cardigan', cover: '/products/vn/vn-gathered-long-cardigan.jpg' },
      { slug: 'vn-blue-stripe-cotton-knit', cover: '/products/vn/vn-blue-stripe-knit.jpg' },
      { slug: 'vn-ribbed-turtleneck-basic', cover: '/products/vn/vn-ribbed-turtleneck.jpg' },
      { slug: 'vn-chiffon-sun-cardigan', cover: '/products/vn/vn-chiffon-sun-cardigan.jpg' },
      { slug: 'vn-pink-short-sleeve-cardigan', cover: '/products/vn/vn-pink-short-sleeve-cardigan.jpg' },
      { slug: 'vn-croptop-pastel-cardigan', cover: '/products/vn/vn-pastel-croptop-cardigan.jpg' },
      { slug: 'vn-micro-knit-polo', cover: '/products/vn/vn-micro-knit-polo.jpg' },
      { slug: 'vn-cable-knit-polo', cover: '/products/vn/vn-cable-knit-polo.jpg' },
      { slug: 'vn-rib-stripe-polo', cover: '/products/vn/vn-rib-stripe-polo.jpg' },
      { slug: 'vn-basic-crew-neck-knit', cover: '/products/vn/vn-basic-crew-knit.jpg' },
      { slug: 'vn-moss-green-stripe-knit', cover: '/products/vn/vn-moss-green-stripe.jpg' },
      { slug: 'vn-lightweight-loungewear-set', cover: '/products/vn/vn-loungewear-set.jpg' },
    ];

    let updated = 0;
    for (const p of products) {
      const result = await sql`
        update content_products
        set cover_url = ${p.cover}, updated_at = now()
        where slug = ${p.slug}
        returning slug
      `;
      if (result.length > 0) updated++;
    }

    await logAudit('api', 'update_covers', 'products', { count: updated });

    return NextResponse.json({ ok: true, updated, total: products.length });
  } catch (err: any) {
    console.error('Update covers failed:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
