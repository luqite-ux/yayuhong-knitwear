import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/guard';
import { logAudit } from '@/lib/audit';
import slugify from 'slugify';
import { newProducts, buildSeoName, buildSeoSummary } from '@/lib/product-seed-new';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET() {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  return new Response(
    `<!DOCTYPE html><html><head><title>导入家居服产品</title></head><body style="font-family:system-ui;padding:40px;">
    <h2>导入家居服产品（新款）</h2>
    <p>点击按钮导入 ${newProducts.length} 款家居服产品到数据库。</p>
    <p style="color:#666;">款号范围：63015-63039（图1/图3/图4），全部分类为"家居服套装"</p>
    <p style="color:#f59e0b;">注意：产品图片暂为空，导入后请在后台管理中逐个上传产品图片。</p>
    <form method="POST">
    <button type="submit" id="importBtn" style="padding:12px 24px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:16px;">开始导入</button>
    </form>
    <div id="result" style="margin-top:20px;white-space:pre-wrap;"></div>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

export async function POST() {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const categories = await sql`
    select id, slug from content_categories where slug is not null
  `;
  const catMap = new Map(categories.map((c) => [c.slug, c.id]));

  const results: { model: string; status: string; error?: string }[] = [];
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < newProducts.length; i++) {
    const p = newProducts[i];
    const categoryId = catMap.get('loungewear-set');

    if (!categoryId) {
      results.push({ model: p.model, status: 'fail', error: 'Category loungewear-set not found' });
      failed++;
      continue;
    }

    const existing = await sql`select id from content_products where model = ${p.model}`;
    if (existing.length > 0) {
      results.push({ model: p.model, status: 'skip' });
      skipped++;
      continue;
    }

    const seoName = buildSeoName(p.zh, p.en);
    const seoSummary = buildSeoSummary(p.zh, p.en, p.color);

    let slug = slugify(`${p.model}-${p.en}`, { lower: true, strict: true });
    if (!slug) slug = `product-${p.model}`;

    const slugExists = await sql`select id from content_products where slug = ${slug}`;
    if (slugExists.length > 0) {
      slug = `${slug}-${i}`;
    }

    try {
      await sql`
        insert into content_products (
          category_id, name, summary, model, slug, cover_url, gallery_urls,
          is_active, sort, sites
        ) values (
          ${categoryId},
          ${JSON.stringify(seoName)}::jsonb,
          ${JSON.stringify(seoSummary)}::jsonb,
          ${p.model},
          ${slug},
          ${p.image_url || null},
          ${p.image_url ? [p.image_url] : []},
          true,
          ${i + 1},
          ${['global']}::text[]
        )
      `;
      results.push({ model: p.model, status: 'ok' });
      created++;
    } catch (err: any) {
      results.push({ model: p.model, status: 'fail', error: err.message });
      failed++;
    }
  }

  await logAudit('admin', 'bulk_import', 'product', {
    total: newProducts.length,
    created,
    skipped,
    failed,
    batch: 'loungewear-63015-63039',
  });

  return NextResponse.json({
    ok: true,
    total: newProducts.length,
    created,
    skipped,
    failed,
    results,
  });
}
