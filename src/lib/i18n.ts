export const LOCALES = ['zh', 'zh-TW', 'en', 'ru', 'es', 'de', 'fr', 'pt', 'ja', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'zh';
export const WRITING_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, string> = {
  zh: '简体中文',
  'zh-TW': '繁體中文',
  en: 'English',
  ru: 'Русский',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
  pt: 'Português',
  ja: '日本語',
  ar: 'العربية',
};

export const RTL_LOCALES: Locale[] = ['ar'];

export function isRTL(locale: string): boolean {
  return (RTL_LOCALES as string[]).includes(locale);
}

type JsonbText = Record<string, string> | string | null | undefined;

/**
 * 从 jsonb 多语言字段取出指定语言文本，回退顺序：locale → en → zh → 第一个可用值
 */
export function pick(text: JsonbText, locale: string): string {
  if (text == null) return '';
  if (typeof text === 'string') return text;
  const order = [locale, 'en', 'zh'];
  for (const l of order) {
    if (text[l] && typeof text[l] === 'string') return text[l]!;
  }
  for (const v of Object.values(text)) {
    if (typeof v === 'string' && v) return v;
  }
  return '';
}

/**
 * 将单语言文本包装成 jsonb 格式
 */
export function toMultilingual(text: string, locale: string): Record<string, string> {
  return { [locale]: text };
}
