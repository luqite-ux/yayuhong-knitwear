import type { Metadata } from 'next';
import { LOCALES } from '@/lib/i18n';

export const GLOBAL_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com').replace(/\/$/, '');
export const CHINA_SITE_URL = 'https://xiuyumaoshan.cn';

/** 项目内部 locale 代码 → 标准 hreflang 代码 */
export function hreflangCode(locale: string): string {
  if (locale === 'zh') return 'zh-CN';
  if (locale === 'zh-TW') return 'zh-Hant';
  if (locale === 'vn') return 'vi';
  return locale;
}

/** 生成某个 locale 下某路径的绝对 URL（国内站无 locale 前缀） */
export function localeUrl(locale: string, path: string, siteKey?: string): string {
  const suffix = path === '/' ? '' : path;
  if (siteKey === 'china') return `${CHINA_SITE_URL}${suffix}`;
  return `${GLOBAL_SITE_URL}/${locale}${suffix}`;
}

/**
 * 统一生成 canonical + hreflang，避免子页面继承首页 canonical。
 * - includeVn=false：全球产品/分类页在 /vn 下不存在，不能声明 vi 版本
 * - localized=false：只存在于单一语言的页面（如 /vn 专属产品），只输出自身 canonical
 * - 海外站统一补 x-default → 英文版
 */
export function buildAlternates(opts: {
  locale: string;
  path: string;
  siteKey?: string;
  includeVn?: boolean;
  localized?: boolean;
}): NonNullable<Metadata['alternates']> {
  const { locale, path, siteKey, includeVn = true, localized = true } = opts;
  const canonical = localeUrl(locale, path, siteKey);

  if (siteKey === 'china' || !localized) return { canonical };

  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    if (l === 'vn' && !includeVn) continue;
    languages[hreflangCode(l)] = localeUrl(l, path);
  }
  languages['x-default'] = localeUrl('en', path);

  return { canonical, languages };
}
