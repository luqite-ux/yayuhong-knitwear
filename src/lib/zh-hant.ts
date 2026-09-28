import { ConverterFactory } from 'opencc-js/core';
import STPhrases from 'opencc-js/dict/STPhrases';
import STCharacters from 'opencc-js/dict/STCharacters';
import STPhrasesGenerated from 'opencc-js/dict/STPhrases_GeneratedFromRegionalPhrases';
import TWVariants from 'opencc-js/dict/TWVariants';
import TWVariantsPhrases from 'opencc-js/dict/TWVariantsPhrases';

/** 简体 → 繁体（含台湾用字，不改写词汇，避免公司名被换成台湾惯用语） */
const toHant = ConverterFactory(
  [STPhrases, STPhrasesGenerated, STCharacters],
  [TWVariantsPhrases, TWVariants],
);

export const HANT_LOCALE = 'zh-TW';

export function toTraditional(text: string): string {
  if (!text) return '';
  return toHant(text);
}

/** 简体站用原文，繁体站转繁体，其余语言用英文 */
export function zhText(locale: string, hans: string, en: string): string {
  if (locale === 'zh') return hans;
  if (locale === HANT_LOCALE) return toHant(hans);
  return en;
}

type JsonbText = Record<string, string> | string | null | undefined;

/**
 * 多语言字段取值。繁体没有独立文案时，用简体转换，避免落到英文。
 */
export function localizeText(text: JsonbText, locale: string): string {
  if (text == null) return '';
  if (typeof text === 'string') {
    return locale === HANT_LOCALE ? toHant(text) : text;
  }
  if (locale === HANT_LOCALE) {
    if (text['zh-TW']) return text['zh-TW'];
    if (text.zh) return toHant(text.zh);
    if (text.en) return text.en;
  }
  const order = [locale, 'en', 'zh'];
  for (const key of order) {
    const value = text[key];
    if (typeof value === 'string' && value) return value;
  }
  for (const value of Object.values(text)) {
    if (typeof value === 'string' && value) return value;
  }
  return '';
}
