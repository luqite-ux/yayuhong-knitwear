import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/**
 * 执行越南市场产品数据迁移
 * 支持两种认证方式：
 * 1. Admin session cookie（后台登录后可用）
 * 2. MIGRATION_TOKEN 环境变量 + Authorization: Bearer <token>
 */
async function checkAuth(req: NextRequest): Promise<boolean> {
  // 方式1: Admin session
  try {
    const { cookies } = await import('next/headers');
    const { verifySession } = await import('@/lib/auth');
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (token && (await verifySession(token))) return true;
  } catch {}

  // 方式2: Bearer token 匹配环境变量
  const authHeader = req.headers.get('authorization');
  const migrationToken = process.env.MIGRATION_TOKEN;
  if (authHeader?.startsWith('Bearer ') && migrationToken) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (token === migrationToken) return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  const ok = await checkAuth(req);
  if (!ok) return NextResponse.json({ error: '未授权' }, { status: 401 });

  const migrationName = '0007_vietnam_products.sql';

  try {
    // 检查是否已执行
    const existing = await sql`select name from schema_migrations where name = ${migrationName}`;
    if (existing.length > 0) {
      return NextResponse.json({ ok: true, skipped: true, message: 'Migration already applied' });
    }

    const result = await sql.begin(async (tx: any) => {
      // 1. 插入产品分类
      await tx`
        insert into content_categories (slug, name, sort, sites)
        values
          ('vn-cardigan', '{"zh":"薄款开衫","en":"Lightweight Cardigans","vn":"Áo Cardigan Mỏng"}', 1, '{"overseas"}'),
          ('vn-knit-tee', '{"zh":"针织T恤","en":"Summer Knit Tees","vn":"Áo Thun Dệt Kim"}', 2, '{"overseas"}'),
          ('vn-polo-knit', '{"zh":"针织POLO","en":"Knit Polo Shirts","vn":"Áo Polo Dệt Kim"}', 3, '{"overseas"}'),
          ('vn-sun-protection', '{"zh":"防晒针织","en":"Sun Protection Knit","vn":"Áo Dệt Kim Chống Nắng"}', 4, '{"overseas"}'),
          ('vn-loungewear', '{"zh":"薄款家居服","en":"Lightweight Loungewear","vn":"Đồ Mặc Nhà Mỏng"}', 5, '{"overseas"}')
        on conflict (slug) do update set
          name = excluded.name,
          sort = excluded.sort,
          sites = excluded.sites
      `;

      // 2. 插入产品 (使用子查询获取 category_id)
      const products = [
        {
          slug: 'vn-tencel-sun-protection-cardigan',
          model: 'VN-CD-001',
          catSlug: 'vn-sun-protection',
          name: { zh: 'Tencel防晒长袖针织开衫', en: 'Tencel Sun Protection Long Sleeve Knit Cardigan', vn: 'Áo Len Chống Nắng Plain Feel Tencel Dài Tay' },
          summary: { zh: 'Tencel混纺防晒长袖开衫，9色可选。凉感透气，V领宽松版型，适合越南夏季防晒通勤。', en: 'Tencel blend sun protection long sleeve cardigan, 9 colors. Cooling and breathable, V-neck loose fit.', vn: 'Áo len chống nắng Plain Feel Tencel dài tay, 9 màu. Mát lạnh thoáng khí, cổ V form rộng.' },
          sort: 1,
        },
        {
          slug: 'vn-mesh-knit-cardigan-fg063',
          model: 'VN-CD-002',
          catSlug: 'vn-cardigan',
          name: { zh: '薄款网眼针织开衫', en: 'Lightweight Mesh Knit Cardigan', vn: 'Áo Cardigan Lưới Dệt Kim Mỏng' },
          summary: { zh: '薄款网眼针织开衫，宽松版型，白/米/棕3色。Shopee同款热卖32,500+件。', en: 'Lightweight mesh knit cardigan, loose fit, white/beige/brown 3 colors. Shopee bestseller 32,500+ sold.', vn: 'Áo cardigan lưới dệt kim mỏng, form rộng, trắng/kem/nâu 3 màu. Shopee bán 32,500+ chiếc.' },
          sort: 2,
        },
        {
          slug: 'vn-half-turtleneck-cotton-knit',
          model: 'VN-KT-003',
          catSlug: 'vn-cardigan',
          name: { zh: '半高领纯棉薄款针织衫', en: 'Half Turtleneck Cotton Thin Knit', vn: 'Áo Len Mỏng Cổ 3 Phân' },
          summary: { zh: '半高领纯棉薄款针织衫，修身版型，粉/绿/灰3色。100% Cotton，适合春秋通勤和叠穿。', en: 'Half turtleneck 100% cotton thin knit, slim fit, pink/green/gray 3 colors. Perfect for layering.', vn: 'Áo len mỏng cổ 3 phân 100% cotton, form ôm, hồng/xanh/xám 3 màu. Phù hợp mặc lớp.' },
          sort: 3,
        },
        {
          slug: 'vn-gathered-long-cardigan',
          model: 'VN-CD-004',
          catSlug: 'vn-cardigan',
          name: { zh: '抽褶长款薄针织开衫', en: 'Gathered Long Thin Knit Cardigan', vn: 'Áo Cardigan Dài Tay Rút Nhún Dáng Dài' },
          summary: { zh: '抽褶长款薄针织开衫，棉质薄针织面料，黑/红2色。弹性好显瘦，适合通勤叠穿。', en: 'Gathered long thin knit cardigan, cotton blend, black/red 2 colors. Stretchy and slimming.', vn: 'Áo cardigan dài tay rút nhún dáng dài, vải cotton dệt mỏng, đen/đỏ 2 màu. Co giãn tốt tôn dáng.' },
          sort: 4,
        },
        {
          slug: 'vn-blue-stripe-cotton-knit',
          model: 'VN-KT-005',
          catSlug: 'vn-cardigan',
          name: { zh: '蓝条纹纯棉薄针织衫', en: 'Blue Stripe Cotton Thin Knit', vn: 'Áo Len Mỏng Kẻ Xanh' },
          summary: { zh: '蓝白条纹纯棉薄针织衫，盒型宽松版型，100% Cotton。柔软轻量，休闲舒适。', en: 'Blue-white stripe 100% cotton thin knit, boxy loose fit. Soft and lightweight.', vn: 'Áo len mỏng kẻ xanh trắng 100% cotton, dáng rộng boxy. Mềm nhẹ thoải mái.' },
          sort: 5,
        },
        {
          slug: 'vn-ribbed-turtleneck-basic',
          model: 'VN-KT-006',
          catSlug: 'vn-cardigan',
          name: { zh: '3cm高领罗纹薄针织衫', en: '3cm High Neck Ribbed Thin Knit', vn: 'Áo Len Nữ Gân Tăm Cổ Cao 3cm' },
          summary: { zh: '3cm高领罗纹薄针织衫，多色可选，修身版型。轻薄基础款，适合内搭和叠穿。', en: '3cm high neck ribbed thin knit, multi-color, slim fit. Lightweight basic for layering.', vn: 'Áo len nữ gân tăm cổ cao 3cm, nhiều màu, form ôm. Mỏng nhẹ mẫu cơ bản.' },
          sort: 6,
        },
        {
          slug: 'vn-chiffon-sun-cardigan',
          model: 'VN-CD-007',
          catSlug: 'vn-sun-protection',
          name: { zh: '雪纺防晒针织开衫', en: 'Chiffon Sun Protection Knit Cardigan', vn: 'Áo Khoác Cardigan Voan Chống Nắng' },
          summary: { zh: '雪纺面料防晒针织开衫，薄款长袖。轻盈飘逸，适合夏季防晒和空调房叠穿。', en: 'Chiffon sun protection knit cardigan, thin long sleeve. Light and flowy for summer.', vn: 'Áo khoác cardigan voan chống nắng, mỏng tay dài. Nhẹ bay bổng mùa hè.' },
          sort: 7,
        },
        {
          slug: 'vn-pink-short-sleeve-cardigan',
          model: 'VN-CD-008',
          catSlug: 'vn-cardigan',
          name: { zh: '粉色短袖薄针织开衫', en: 'Pink Short Sleeve Thin Knit Cardigan', vn: 'Cardigan Nữ Áo Dệt Kim Ngắn Tay Len Mỏng' },
          summary: { zh: '粉色短袖薄针织开衫，粉/米白2色。短袖设计，适合夏季通勤和休闲。', en: 'Pink short sleeve thin knit cardigan, pink/beige 2 colors. Summer commute and casual.', vn: 'Cardigan nữ áo dệt kim ngắn tay len mỏng, hồng/kem 2 màu. Mùa hè đi làm thường ngày.' },
          sort: 8,
        },
        {
          slug: 'vn-croptop-pastel-cardigan',
          model: 'VN-CD-009',
          catSlug: 'vn-cardigan',
          name: { zh: 'Pastel色短款针织开衫', en: 'Pastel Croptop Knit Cardigan', vn: 'Áo Cardigan Croptop Mỏng Nhẹ Màu Pastel' },
          summary: { zh: 'Pastel色短款针织开衫，薄款长袖纽扣设计。年轻时尚，搭配高腰裤显腿长。', en: 'Pastel croptop knit cardigan, thin long sleeve button design. Youthful and trendy.', vn: 'Áo cardigan croptop mỏng nhẹ màu pastel, tay dài đính nút. Trẻ thời trang.' },
          sort: 9,
        },
        {
          slug: 'vn-micro-knit-polo',
          model: 'VN-PL-010',
          catSlug: 'vn-polo-knit',
          name: { zh: 'Micro Knit细针织POLO衫', en: 'Micro Knit Polo Sweater', vn: 'Áo Polo Dệt Kim Micro Knit' },
          summary: { zh: 'Micro Knit细针织POLO衫，多色可选。质感通勤风，细针织面料显高级。', en: 'Micro knit polo sweater, multi-color. Textured commute style, fine knit premium look.', vn: 'Áo polo dệt kim micro knit, nhiều màu. Chất đi làm, vải dệt kim mịn cao cấp.' },
          sort: 10,
        },
        {
          slug: 'vn-cable-knit-polo',
          model: 'VN-PL-011',
          catSlug: 'vn-polo-knit',
          name: { zh: 'Cable Knit绞花针织POLO衫', en: 'Cable Knit Polo Sweater', vn: 'Áo Polo Dệt Kim Cable Knit' },
          summary: { zh: 'Cable Knit绞花针织POLO衫，多色可选。经典绞花纹理，质感通勤。', en: 'Cable knit polo sweater, multi-color. Classic cable texture, textured commute style.', vn: 'Áo polo dệt kim cable knit, nhiều màu. Hoạ tiết cable cổ điển, chất đi làm.' },
          sort: 11,
        },
        {
          slug: 'vn-rib-stripe-polo',
          model: 'VN-PL-012',
          catSlug: 'vn-polo-knit',
          name: { zh: '竖条纹针织POLO衫', en: 'Vertical Rib Knit Polo', vn: 'Áo Thun Có Cổ Dệt Kim' },
          summary: { zh: '竖条纹针织POLO衫，灰/棕2色。竖条纹肌理，质感通勤休闲两不误。', en: 'Vertical rib knit polo, gray/brown 2 colors. Vertical stripe texture, commute and casual.', vn: 'Áo thun có cổ dệt kim, xám/nâu 2 màu. Hoạ tiết sổ dọc, đi làm thường ngày.' },
          sort: 12,
        },
        {
          slug: 'vn-basic-crew-neck-knit',
          model: 'VN-KT-013',
          catSlug: 'vn-knit-tee',
          name: { zh: '圆领基础薄款针织衫', en: 'Basic Crew Neck Thin Knit', vn: 'Áo Len Mỏng Cổ Tròn Basic' },
          summary: { zh: '圆领基础薄款针织衫，多色可选。基础百搭款，适合通勤叠穿和日常休闲。', en: 'Basic crew neck thin knit, multi-color. Versatile basic for layering and daily casual.', vn: 'Áo len mỏng cổ tròn basic, nhiều màu. Mẫu cơ bản dễ mix match.' },
          sort: 13,
        },
        {
          slug: 'vn-moss-green-stripe-knit',
          model: 'VN-KT-014',
          catSlug: 'vn-knit-tee',
          name: { zh: '苔藓绿条纹薄针织衫', en: 'Moss Green Stripe Thin Knit', vn: 'Áo Len Mỏng Dải Xanh Rêu' },
          summary: { zh: '苔藓绿条纹薄针织衫，优雅通勤风。清新自然色调，适合春秋叠穿。', en: 'Moss green stripe thin knit, elegant commute style. Fresh natural tone for layering.', vn: 'Áo len mỏng dải xanh rêu, phong cách đi làm thanh lịch. Tông màu tươi tự nhiên.' },
          sort: 14,
        },
        {
          slug: 'vn-lightweight-loungewear-set',
          model: 'VN-LW-015',
          catSlug: 'vn-loungewear',
          name: { zh: '薄款针织家居服套装', en: 'Lightweight Knit Loungewear Set', vn: 'Set Đồ Mặc Nhà Dệt Kim Mỏng' },
          summary: { zh: '薄款针织家居服套装，短袖+短裤组合。柔软亲肤，透气不闷热，适合热带气候居家穿着。', en: 'Lightweight knit loungewear set, short sleeve + shorts. Soft breathable, tropical home wear.', vn: 'Set đồ mặc nhà dệt kim mỏng, combo áo ngắn + quần đùi. Mềm thoáng khí, mặc nhà nhiệt đới.' },
          sort: 15,
        },
      ];

      for (const p of products) {
        await tx`
          insert into content_products (slug, name, model, summary, cover_url, category_id, sites, sort, is_active)
          values (
            ${p.slug},
            ${JSON.stringify(p.name)}::jsonb,
            ${p.model},
            ${JSON.stringify(p.summary)}::jsonb,
            '',
            (select id from content_categories where slug = ${p.catSlug}),
            '{"overseas"}',
            ${p.sort},
            true
          )
          on conflict (slug) do nothing
        `;
      }

      // 3. 记录迁移
      await tx`insert into schema_migrations (name) values (${migrationName}) on conflict do nothing`;

      return { success: true, migration: migrationName, productsCount: products.length };
    });

    await logAudit('api', 'migrate', 'database', { migration: migrationName });

    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    console.error('Vietnam migration failed:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
