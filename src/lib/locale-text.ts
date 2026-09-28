/** 客户端用：简体 / 繁体 / 其他语言。繁体字符串预先写好，避免把转换词库打进浏览器包。 */
export function zhOrEn(locale: string, hans: string, hant: string, en: string): string {
  if (locale === 'zh') return hans;
  if (locale === 'zh-TW') return hant;
  return en;
}
