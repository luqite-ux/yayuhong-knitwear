import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { setSecret, updateSecretStatus, maskSecret } from '@/lib/secrets';
import { logAudit } from '@/lib/audit';
import { requireAdmin } from '@/lib/guard';

export async function POST(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { step, action, data, skip } = body as {
    step: string;
    action: 'save' | 'complete';
    data?: Record<string, unknown>;
    skip?: boolean;
  };

  const STEPS = [
    'site_identity',
    'content_source',
    'llm',
    'google',
    'ga4',
    'cloudflare',
    'geo_engine',
    'notification',
    'automation',
  ];

  if (!STEPS.includes(step)) {
    return NextResponse.json({ error: '无效步骤' }, { status: 400 });
  }

  try {
    if (step === 'site_identity' && data) {
      const { site_name_zh, site_name_en, domain } = data as { site_name_zh: string; site_name_en: string; domain: string };
      await sql`
        update site_profile set
          site_name = ${JSON.stringify({ zh: site_name_zh, en: site_name_en })}::jsonb,
          domain = ${domain},
          updated_at = now()
        where id = (select id from site_profile order by created_at limit 1)
      `;
    }

    if (step === 'content_source' && data) {
      const { source_url, source_type } = data as { source_url: string; source_type: string };
      if (source_url) {
        await sql`
          insert into content_sync_sources (name, source_type, url, is_active)
          values ('官网内容', ${source_type || 'scrape'}, ${source_url}, true)
          on conflict (name) do update
          set url = excluded.url, source_type = excluded.source_type, updated_at = now()
        `;
      }
    }

    if (step === 'llm' && data) {
      const { base_url, api_key, model } = data as { base_url: string; api_key: string; model: string };
      if (api_key) {
        const cfg = JSON.stringify({ baseUrl: base_url, apiKey: api_key, model });
        await setSecret('llm', cfg, JSON.stringify({ baseUrl: base_url, model }), { baseUrl: base_url, model });
      }
    }

    if (step === 'google' && data) {
      const { service_account_json } = data as { service_account_json: string };
      if (service_account_json) {
        await setSecret(
          'google',
          service_account_json,
          maskSecret(service_account_json.slice(0, 50)),
        );
      }
    }

    if (step === 'ga4' && data) {
      const { measurement_id, property_id } = data as { measurement_id: string; property_id: string };
      if (measurement_id) {
        const cfg = JSON.stringify({ measurementId: measurement_id, propertyId: property_id });
        await setSecret('ga4', cfg, `G-${measurement_id}`);
      }
    }

    if (step === 'cloudflare' && data) {
      const { api_token, zone_id } = data as { api_token: string; zone_id: string };
      if (api_token) {
        const cfg = JSON.stringify({ apiToken: api_token, zoneId: zone_id });
        await setSecret('cloudflare', cfg, maskSecret(api_token), { zoneId: zone_id });
      }
    }

    if (step === 'geo_engine' && data) {
      const { engine, api_key } = data as { engine: string; api_key: string };
      if (api_key) {
        const cfg = JSON.stringify({ engine, apiKey: api_key });
        await setSecret('geo_engine', cfg, maskSecret(api_key), { engine });
      }
    }

    if (step === 'notification' && data) {
      const { webhook_url, webhook_type } = data as { webhook_url: string; webhook_type: string };
      if (webhook_url) {
        const cfg = JSON.stringify({ url: webhook_url, type: webhook_type });
        await setSecret('notification', cfg, maskSecret(webhook_url));
      }
    }

    if (step === 'automation' && data) {
      const {
        monthly_articles,
        publish_mode,
        style_technical,
        style_buying_guide,
        style_application,
        style_trend,
        geo_budget,
        indexing_enabled,
      } = data as Record<string, string | number | boolean>;

      const styleQuota = JSON.stringify({
        technical: Number(style_technical) || 1,
        buying_guide: Number(style_buying_guide) || 1,
        application: Number(style_application) || 1,
        trend: Number(style_trend) || 1,
      });

      await sql`
        update seo_config set
          monthly_articles = ${Number(monthly_articles) || 4},
          publish_mode = ${publish_mode || 'auto'},
          style_quota = ${styleQuota}::jsonb,
          geo_monthly_budget_usd = ${Number(geo_budget) || 0},
          indexing_enabled = ${indexing_enabled !== false},
          enabled = true,
          updated_at = now()
        where id = (select id from seo_config order by created_at limit 1)
      `;
    }

    // 安全解析 jsonb 字段（多重保险：postgres 驱动可能返回字符串或对象）
    const row = await sql<{ onboarding_steps: unknown }[]>`
      select onboarding_steps from seo_config order by created_at limit 1
    `;
    let steps: Record<string, boolean> = {};
    if (row[0]?.onboarding_steps) {
      let raw: unknown = row[0].onboarding_steps;
      // 反复解析，直到得到真正的对象（防止双重编码）
      for (let i = 0; i < 3 && typeof raw === 'string'; i++) {
        try { raw = JSON.parse(raw); } catch { break; }
      }
      if (typeof raw === 'object' && raw !== null) {
        steps = raw as Record<string, boolean>;
      }
    }

    if (skip) {
      steps[step] = false;
      await sql`
        update seo_config set
          onboarding_steps = ${JSON.stringify(steps)}::jsonb,
          updated_at = now()
        where id = (select id from seo_config order by created_at limit 1)
      `;
      if (step === 'cloudflare') await updateSecretStatus('cloudflare', 'skipped');
      if (step === 'geo_engine') await updateSecretStatus('geo_engine', 'skipped');
      if (step === 'notification') await updateSecretStatus('notification', 'skipped');
    } else {
      steps[step] = true;
      await sql`
        update seo_config set
          onboarding_steps = ${JSON.stringify(steps)}::jsonb,
          updated_at = now()
        where id = (select id from seo_config order by created_at limit 1)
      `;
    }

    await logAudit('admin', `onboarding_${action}`, step, { skip, data });

    if (action === 'complete') {
      return NextResponse.json({ ok: true, completed: true });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const config = await sql`
    select enabled, onboarding_steps, monthly_articles, publish_mode, style_quota,
           geo_monthly_budget_usd, indexing_enabled
    from seo_config order by created_at limit 1
  `;

  const profile = await sql`
    select site_name, domain, default_locale from site_profile order by created_at limit 1
  `;

  const secrets = await sql`
    select key, masked, status from integration_secrets order by key
  `;

  // 安全解析 JSON 字段（postgres 驱动可能返回字符串或对象）
  function safeParseJson(val: unknown): Record<string, unknown> {
    if (!val) return {};
    if (typeof val === 'object') return val as Record<string, unknown>;
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return {}; }
    }
    return {};
  }

  const cfg = config[0] ? {
    ...config[0],
    onboarding_steps: safeParseJson(config[0].onboarding_steps),
    style_quota: safeParseJson(config[0].style_quota),
  } : null;

  const prof = profile[0] ? {
    ...profile[0],
    site_name: safeParseJson(profile[0].site_name),
  } : null;

  return NextResponse.json({
    config: cfg,
    profile: prof,
    secrets,
  });
}
