import { headers } from 'next/headers';

export type SiteKey = 'overseas' | 'china' | 'vietnam';

export interface SiteInfo {
  key: SiteKey;
  domain: string;
  name: Record<string, string>;
  default_locale: string;
  is_active: boolean;
}

const SITE_DOMAIN_MAP: Record<string, SiteKey> = {
  'xiuyuknit.com': 'overseas',
  'www.xiuyuknit.com': 'overseas',
  'xiuyumaoshan.cn': 'china',
  'www.xiuyumaoshan.cn': 'china',
};

/**
 * 从请求 host 判断当前站点
 * 开发环境默认 overseas
 */
export function detectSiteKey(host?: string): SiteKey {
  const h = host || '';
  if (SITE_DOMAIN_MAP[h]) return SITE_DOMAIN_MAP[h];
  // 子域名匹配
  for (const domain of Object.keys(SITE_DOMAIN_MAP)) {
    if (h.endsWith(domain)) return SITE_DOMAIN_MAP[domain];
  }
  // 默认海外站
  return 'overseas';
}

/**
 * 服务端组件中获取当前站点 key（从 request headers）
 * Next 16+ headers() 返回 Promise，需 await
 */
export async function getCurrentSiteKey(): Promise<SiteKey> {
  const h = await headers();
  const host = h.get('host') || '';
  return detectSiteKey(host);
}

/**
 * 生成内容表 sites 过滤条件
 * 匹配规则：sites 数组包含 'global' 或当前站点 key
 */
export function siteFilterSql(siteKey: SiteKey): string {
  return `sites && array['global', '${siteKey}']::text[]`;
}

/**
 * 站点对应的默认 locale
 */
export function getDefaultLocale(siteKey: SiteKey): string {
  if (siteKey === 'china') return 'zh';
  if (siteKey === 'vietnam') return 'vn';
  return 'en';
}

/**
 * 国内站是否启用单语言（无 locale 前缀）
 */
export function isSingleLanguage(siteKey: SiteKey): boolean {
  return siteKey === 'china';
}
