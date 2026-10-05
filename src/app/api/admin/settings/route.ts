import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const profile = await sql`select * from site_profile order by created_at limit 1`;
  return NextResponse.json({ profile: profile[0] });
}

export async function PUT(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const {
    site_name, company_name, domain, default_locale, logo_url,
    contact, intro, brand_voice, google_verification,
    // 国内 SEO
    baidu_verification, baidu_analytics, baidu_push_token,
    haosou_verification, sogou_verification, shenma_verification,
    doubao_verification, china_seo, china_geo,
    // 首页与展示
    stats, social_links, footer_config, hero_config,
  } = body;

  await sql`
    update site_profile set
      site_name = ${JSON.stringify(site_name || {})}::jsonb,
      company_name = ${company_name || null},
      domain = ${domain || null},
      default_locale = ${default_locale || 'zh'},
      logo_url = ${logo_url || null},
      contact = ${JSON.stringify(contact || {})}::jsonb,
      intro = ${JSON.stringify(intro || {})}::jsonb,
      brand_voice = ${brand_voice || null},
      google_verification = ${google_verification || null},
      baidu_verification = ${baidu_verification || null},
      baidu_analytics = ${baidu_analytics || null},
      baidu_push_token = ${baidu_push_token || null},
      haosou_verification = ${haosou_verification || null},
      sogou_verification = ${sogou_verification || null},
      shenma_verification = ${shenma_verification || null},
      doubao_verification = ${doubao_verification || null},
      china_seo = ${JSON.stringify(china_seo || {})}::jsonb,
      china_geo = ${JSON.stringify(china_geo || {})}::jsonb,
      stats = ${JSON.stringify(stats || {})}::jsonb,
      social_links = ${JSON.stringify(social_links || {})}::jsonb,
      footer_config = ${JSON.stringify(footer_config || {})}::jsonb,
      hero_config = ${JSON.stringify(hero_config || {})}::jsonb,
      updated_at = now()
    where id = (select id from site_profile order by created_at limit 1)
  `;
  await logAudit('admin', 'update', 'site_profile', { domain, china_seo_updated: !!china_seo });
  return NextResponse.json({ ok: true });
}
