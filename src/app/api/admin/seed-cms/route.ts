import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/guard';
import { logAudit } from '@/lib/audit';
import {
  faqSeed,
  equipmentSeed,
  processSeed,
  serviceSeed,
  featureSeed,
  readyStockSeed,
} from '@/lib/cms-seed';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET() {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  return new Response(
    `<!DOCTYPE html><html><head><title>导入全站内容种子数据</title><style>body{font-family:system-ui;padding:40px;max-width:800px;margin:0 auto}h2{color:#1e40af}ul{line-height:2}button{padding:12px 24px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:16px}button:hover{background:#1d4ed8}.box{background:#f0f9ff;border:1px solid #bae6fd;padding:16px;border-radius:8px;margin:16px 0}</style></head><body>
    <h2>导入全站内容种子数据</h2>
    <p>点击按钮将以下内容导入数据库（中英俄三语）：</p>
    <div class="box">
      <ul>
        <li>📋 <strong>FAQ</strong>：${faqSeed.length} 条常见问题解答（分 general/shipping/products/custom 四类）</li>
        <li>🏭 <strong>工厂设备</strong>：${equipmentSeed.length} 种生产设备及数量</li>
        <li>📝 <strong>生产流程</strong>：${processSeed.length} 步完整生产流程</li>
        <li>🛠️ <strong>服务内容</strong>：${serviceSeed.length} 项服务（OEM/ODM/小批量/现货/包装/代发）</li>
        <li>⭐ <strong>首页优势</strong>：${featureSeed.length} 个核心优势亮点</li>
        <li>📦 <strong>现货产品</strong>：${readyStockSeed.length} 款 Ready Stock</li>
      </ul>
    </div>
    <p style="color:#666;font-size:14px;">说明：已存在的相同内容不会重复导入（按唯一标识去重）。导入后可在后台管理中随时修改。</p>
    <form method="POST">
    <button type="submit" id="importBtn">开始导入全部内容</button>
    </form>
    <p style="margin-top:20px;color:#999;font-size:12px;">产品图片更新请使用 /api/admin/products/import-loungewear 接口</p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

export async function POST() {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const results: Record<string, any> = {};

  try {
    // ========== 1. FAQ ==========
    let faqCreated = 0,
      faqSkipped = 0,
      faqFailed = 0;
    for (const faq of faqSeed) {
      try {
        const existing = await sql`
          select id from content_faqs
          where question->>'en' = ${faq.question.en}
          limit 1
        `;
        if (existing.length > 0) {
          faqSkipped++;
          continue;
        }
        await sql`
          insert into content_faqs (question, answer, category, sort, sites)
          values (
            ${JSON.stringify(faq.question)}::jsonb,
            ${JSON.stringify(faq.answer)}::jsonb,
            ${faq.category},
            ${faq.sort},
            array['global']::text[]
          )
        `;
        faqCreated++;
      } catch (e) {
        faqFailed++;
      }
    }
    results.faqs = { total: faqSeed.length, created: faqCreated, skipped: faqSkipped, failed: faqFailed };

    // ========== 2. 工厂设备 ==========
    let eqCreated = 0,
      eqSkipped = 0,
      eqFailed = 0;
    for (const eq of equipmentSeed) {
      try {
        const existing = await sql`
          select id from content_factory_equipments
          where name->>'en' = ${eq.name.en}
          limit 1
        `;
        if (existing.length > 0) {
          eqSkipped++;
          continue;
        }
        await sql`
          insert into content_factory_equipments (name, quantity, icon_key, sort, sites)
          values (
            ${JSON.stringify(eq.name)}::jsonb,
            ${eq.quantity},
            ${eq.icon_key},
            ${eq.sort},
            array['global']::text[]
          )
        `;
        eqCreated++;
      } catch (e) {
        eqFailed++;
      }
    }
    results.equipments = { total: equipmentSeed.length, created: eqCreated, skipped: eqSkipped, failed: eqFailed };

    // ========== 3. 生产流程 ==========
    let procCreated = 0,
      procSkipped = 0,
      procFailed = 0;
    for (const proc of processSeed) {
      try {
        const existing = await sql`
          select id from content_factory_processes
          where step_number = ${proc.step_number}
          limit 1
        `;
        if (existing.length > 0) {
          procSkipped++;
          continue;
        }
        await sql`
          insert into content_factory_processes (title, description, step_number, icon_key, sort, sites)
          values (
            ${JSON.stringify(proc.title)}::jsonb,
            ${JSON.stringify(proc.description)}::jsonb,
            ${proc.step_number},
            ${proc.icon_key},
            ${proc.sort},
            array['global']::text[]
          )
        `;
        procCreated++;
      } catch (e) {
        procFailed++;
      }
    }
    results.processes = { total: processSeed.length, created: procCreated, skipped: procSkipped, failed: procFailed };

    // ========== 4. 服务内容 ==========
    let svcCreated = 0,
      svcSkipped = 0,
      svcFailed = 0;
    for (const svc of serviceSeed) {
      try {
        const existing = await sql`
          select id from content_services
          where title->>'en' = ${svc.title.en}
          limit 1
        `;
        if (existing.length > 0) {
          svcSkipped++;
          continue;
        }
        await sql`
          insert into content_services (title, summary, description, highlights, icon_key, gradient_from, gradient_to, sort, sites)
          values (
            ${JSON.stringify(svc.title)}::jsonb,
            ${JSON.stringify(svc.summary)}::jsonb,
            ${JSON.stringify(svc.description)}::jsonb,
            ${JSON.stringify(svc.highlights)}::jsonb,
            ${svc.icon_key},
            ${svc.gradient_from},
            ${svc.gradient_to},
            ${svc.sort},
            array['global']::text[]
          )
        `;
        svcCreated++;
      } catch (e) {
        svcFailed++;
      }
    }
    results.services = { total: serviceSeed.length, created: svcCreated, skipped: svcSkipped, failed: svcFailed };

    // ========== 5. 首页优势 ==========
    let featCreated = 0,
      featSkipped = 0,
      featFailed = 0;
    for (const feat of featureSeed) {
      try {
        const existing = await sql`
          select id from content_features
          where category = ${feat.category} and title->>'en' = ${feat.title.en}
          limit 1
        `;
        if (existing.length > 0) {
          featSkipped++;
          continue;
        }
        await sql`
          insert into content_features (category, title, description, icon_key, sort, sites)
          values (
            ${feat.category},
            ${JSON.stringify(feat.title)}::jsonb,
            ${JSON.stringify(feat.description)}::jsonb,
            ${feat.icon_key},
            ${feat.sort},
            array['global']::text[]
          )
        `;
        featCreated++;
      } catch (e) {
        featFailed++;
      }
    }
    results.features = { total: featureSeed.length, created: featCreated, skipped: featSkipped, failed: featFailed };

    // ========== 6. 现货产品 ==========
    let rsCreated = 0,
      rsSkipped = 0,
      rsFailed = 0;
    for (const rs of readyStockSeed) {
      try {
        const existing = await sql`
          select id from content_ready_stock
          where model = ${rs.model}
          limit 1
        `;
        if (existing.length > 0) {
          rsSkipped++;
          continue;
        }
        await sql`
          insert into content_ready_stock (name, model, cover_url, price_range, sort, sites)
          values (
            ${JSON.stringify(rs.name)}::jsonb,
            ${rs.model},
            ${rs.cover_url},
            ${rs.price_range},
            ${rs.sort},
            array['global']::text[]
          )
        `;
        rsCreated++;
      } catch (e) {
        rsFailed++;
      }
    }
    results.readyStock = { total: readyStockSeed.length, created: rsCreated, skipped: rsSkipped, failed: rsFailed };

    // ========== 7. 更新 site_profile 基础数据 ==========
    try {
      const stats = {
        years_experience: '20+',
        daily_capacity: '30,000+',
        moq: '50',
        sample_days: '7',
        design_styles: '500+',
        factory_area: '8,000㎡',
        workers_count: '200+',
        countries_served: '100+',
      };

      const heroConfig = {
        badges: ['ISO9001', 'BSCI', 'OEKO-TEX'],
        trust_texts: {
          zh: ['1000+ 合作客户', '20年行业经验', '月产100万件'],
          en: ['1000+ Clients', '20 Years Experience', '1M Pcs/Month'],
          ru: ['1000+ клиентов', '20 лет опыта', '1 млн шт./мес.'],
        },
      };

      const socialLinks = {
        facebook: '',
        instagram: '',
        linkedin: '',
        youtube: '',
        tiktok: '',
        pinterest: '',
        wechat_qr_url: '/images/wechat-qr.jpg',
        whatsapp_qr_url: '/images/whatsapp-qr.jpg',
      };

      const footerConfig = {
        copyright: {
          zh: '© 2024 澄海雅育鸿针织厂. 保留所有权利.',
          en: '© 2024 Yayuhong Knitwear. All rights reserved.',
          ru: '© 2024 Yayuhong Knitwear. Все права защищены.',
        },
        quick_links: [
          { label: { zh: '产品中心', en: 'Products', ru: 'Продукция' }, href: '/products' },
          { label: { zh: '服务项目', en: 'Services', ru: 'Услуги' }, href: '/services' },
          { label: { zh: '工厂实力', en: 'Factory', ru: 'Фабрика' }, href: '/factory' },
          { label: { zh: '常见问题', en: 'FAQ', ru: 'FAQ' }, href: '/faq' },
          { label: { zh: '联系我们', en: 'Contact', ru: 'Контакты' }, href: '/contact' },
        ],
      };

      await sql`
        update site_profile
        set
          stats = ${JSON.stringify(stats)}::jsonb,
          hero_config = ${JSON.stringify(heroConfig)}::jsonb,
          social_links = ${JSON.stringify(socialLinks)}::jsonb,
          footer_config = ${JSON.stringify(footerConfig)}::jsonb,
          updated_at = now()
      `;
      results.siteProfile = { updated: true };
    } catch (e: any) {
      results.siteProfile = { updated: false, error: e.message };
    }

    await logAudit('admin', 'seed_cms', 'all', { results });

    return NextResponse.json({
      ok: true,
      ...results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message, stack: err.stack, results },
      { status: 500 },
    );
  }
}
