import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  return new Response(
    `<!DOCTYPE html><html><head><title>批量更新产品图片</title><style>body{font-family:system-ui;padding:40px;max-width:800px;margin:0 auto}h2{color:#1e40af}button{padding:12px 24px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:16px}button:hover{background:#1d4ed8}.warn{background:#fef3c7;border:1px solid #fcd34d;padding:12px;border-radius:6px;margin:16px 0;color:#92400e}</style></head><body>
    <h2>批量更新产品图片</h2>
    <div class="warn">
      <strong>说明：</strong>由于产品图片资源有限，将按以下规则分配图片：<br>
      • 家居服产品 → 循环使用 loungewear 分类图（共2张）<br>
      • 后续你可以在后台管理中逐个替换为真实产品图<br>
      • 已有封面图的产品不会被覆盖
    </div>
    <form method="POST">
    <button type="submit">批量分配图片</button>
    </form>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  try {
    // 获取所有没有封面图的产品
    const products = await sql`
      select id, model, category_id, slug from content_products
      where (cover_url is null or cover_url = '')
      order by sort, created_at
    `;

    // 获取分类映射
    const categories = await sql`
      select id, slug from content_categories
    `;
    const catMap = new Map(categories.map((c) => [c.id, c.slug]));

    const loungewearImages = [
      '/images/products/loungewear-1.jpg',
      '/images/products/loungewear/loungewear00.jpg',
    ];

    const sweaterImages = [
      '/images/products/womens-sweater-1.jpg',
      '/images/products/mens-sweater-1.jpg',
      '/images/ready-stock/style-01.jpg',
      '/images/ready-stock/style-02.jpg',
      '/images/ready-stock/style-03.jpg',
    ];

    const petImages = [
      '/images/products/pet-clothes-1.jpg',
      '/images/products/pet/pet01.jpg',
      '/images/products/pet/pet02.jpg',
      '/images/products/pet/pet03.jpg',
      '/images/products/pet/pet04.jpg',
    ];

    const accImages = [
      '/images/products/accessories-1.jpg',
      '/images/products/accessories/acc01.jpg',
      '/images/products/accessories/acc02.jpg',
      '/images/products/accessories/acc03.jpg',
    ];

    let updated = 0;
    const results: { slug: string; image: string }[] = [];

    for (const product of products) {
      const catSlug = catMap.get(product.category_id) || '';
      let imageUrl = '';

      if (catSlug.includes('loungewear')) {
        imageUrl = loungewearImages[updated % loungewearImages.length];
      } else if (catSlug.includes('sweater')) {
        imageUrl = sweaterImages[updated % sweaterImages.length];
      } else if (catSlug.includes('pet')) {
        imageUrl = petImages[updated % petImages.length];
      } else if (catSlug.includes('accessories') || catSlug.includes('acc')) {
        imageUrl = accImages[updated % accImages.length];
      } else {
        // 默认用毛衣图
        imageUrl = sweaterImages[updated % sweaterImages.length];
      }

      if (imageUrl) {
        await sql`
          update content_products
          set cover_url = ${imageUrl}, updated_at = now()
          where id = ${product.id}
        `;
        updated++;
        results.push({ slug: product.slug, image: imageUrl });
      }
    }

    await logAudit('admin', 'batch_update_product_images', 'products', { updated, total: products.length });

    return NextResponse.json({
      ok: true,
      updated,
      totalNoImage: products.length,
      results: results.slice(0, 10),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message, stack: err.stack },
      { status: 500 },
    );
  }
}
