import { sql, deepParseJson } from '@/lib/db';

export interface SiteProfile {
  id: string;
  site_name: Record<string, string>;
  company_name: string | null;
  domain: string | null;
  default_locale: string;
  logo_url: string | null;
  contact: Record<string, any>;
  intro: Record<string, string>;
  brand_voice: string | null;
  social_links: Record<string, string>;
  footer_config: Record<string, any>;
  hero_config: Record<string, any>;
  stats: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * 从 site_profile 表读取单条记录
 * 用 deepParseJson 解析所有 jsonb 字段
 * 失败时返回 null
 */
export async function getSiteProfile(): Promise<SiteProfile | null> {
  try {
    const rows = await sql`
      select * from site_profile
      order by created_at
      limit 1
    `;

    if (!rows || rows.length === 0) return null;

    const parsed = deepParseJson(rows[0]) as SiteProfile;
    return parsed;
  } catch (err) {
    console.error('Failed to fetch site_profile from DB:', err);
    return null;
  }
}
