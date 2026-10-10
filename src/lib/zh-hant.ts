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

// 越南语翻译字典（供 zhText / localizeText 共用）
const viTextDict: Record<string, string> = {
  // Products page
  '款': 'chiếc',
  'SKUs': 'SKUs',
  '没有找到合适的款式？': 'Không tìm thấy mẫu phù hợp?',
  "Can't find what you're looking for?": 'Không tìm thấy mẫu phù hợp?',
  '我们支持来图来样定制，专业设计团队为您量身打造': 'Chúng tôi hỗ trợ đặt mẫu theo hình ảnh, đội ngũ thiết kế chuyên nghiệp sẽ tùy chỉnh cho bạn',
  'We offer custom design services. Our professional team can bring your ideas to life.': 'Chúng tôi cung cấp dịch vụ thiết kế tùy chỉnh. Đội ngũ chuyên nghiệp của chúng tôi sẽ hiện thực hóa ý tưởng của bạn.',
  '立即定制': 'Tùy chỉnh ngay',
  'Customize Now': 'Tùy chỉnh ngay',

  // Product Grid / Showcase
  '查看详情': 'Xem chi tiết',
  'View Details': 'Xem chi tiết',
  'View Details →': 'Xem chi tiết →',
  '查看全部': 'Xem tất cả',
  'View All': 'Xem tất cả',
  'View All →': 'Xem tất cả →',
  '获取报价': 'Nhận báo giá',
  'Get Quote': 'Nhận báo giá',
  'Get Quote →': 'Nhận báo giá →',

  // Categories (global category names fallback)
  'Womens Sweater': 'Áo Len Nữ',
  'Kids Sweater': 'Áo Len Trẻ Em',
  'Mens Sweater': 'Áo Len Nam',
  'Loungewear Set': 'Đồ Mặc Nhà',
  'Pet Clothes': 'Quần Áo Thú Cưng',
  'Knit Accessories': 'Phụ Kiện Dệt Kim',
  'womens-sweater': 'Áo Len Nữ',
  'kids-sweater': 'Áo Len Trẻ Em',
  'mens-sweater': 'Áo Len Nam',
  'loungewear-set': 'Đồ Mặc Nhà',
  'pet-clothes': 'Quần Áo Thú Cưng',
  'knit-accessories': 'Phụ Kiện Dệt Kim',

  // Hero
  '快时尚源头工厂': 'Nhà Máy Thời Trang Nhanh',
  'Fast Fashion Factory': 'Nhà Máy Thời Trang Nhanh',

  // Ready stock
  '现货': 'Có Sẵn',
  'Ready to Ship': 'Có Sẵn Giao',
  '现货系列': 'Bộ Sưu Tập Sẵn Giao',
  'Ready Stock Collection': 'Bộ Sưu Tập Sẵn Giao',
  '现货直发，3天出货，无需等待': 'Có sẵn hàng, giao 3 ngày, không chờ đợi',
  'In-stock items ship in 3 days': 'Có sẵn hàng, giao trong 3 ngày',
  'Browse All': 'Xem tất cả',
  '浏览全部': 'Xem tất cả',

  // Factory
  '工厂实拍': 'Ảnh Thực Tế Nhà Máy',
  'Factory Tour': 'Tham Quan Nhà Máy',

  // CTA
  '联系我们': 'Liên hệ chúng tôi',
  'Contact Us': 'Liên hệ chúng tôi',
  '立即咨询': 'Tư vấn ngay',
  'Get in Touch': 'Liên hệ ngay',

  // FAQ
  '常见问题': 'Câu hỏi thường gặp',
  'Frequently Asked Questions': 'Câu hỏi thường gặp',

  // Services
  '我们的服务': 'Dịch vụ của chúng tôi',
  'Our Services': 'Dịch vụ của chúng tôi',

  // Misc
  '年经验': 'năm kinh nghiệm',
  '年行业经验': 'năm kinh nghiệm ngành',
  '日产能': 'năng lực ngày',
  '件起订': 'chiếc MOQ',
  '天交货': 'ngày giao hàng',
};

export function toTraditional(text: string): string {
  if (!text) return '';
  return toHant(text);
}

/** 简体站用原文，繁体站转繁体，其余语言用英文 */
export function zhText(locale: string, hans: string, en: string): string {
  if (locale === 'zh') return hans;
  if (locale === HANT_LOCALE) return toHant(hans);
  if (locale === 'vn') {
    if (viTextDict[hans]) return viTextDict[hans];
    if (viTextDict[en]) return viTextDict[en];
    return en;
  }
  return en;
}

/** 多语言关键词：支持 vi 等额外语言的本地化关键词 */
export function localizedKeywords(locale: string, hans: string, en: string, vi?: string): string {
  if (locale === 'zh') return hans;
  if (locale === HANT_LOCALE) return toHant(hans);
  if (locale === 'vn' && vi) return vi;
  return en;
}

type JsonbText = Record<string, string> | string | null | undefined;

/**
 * 多语言字段取值。繁体没有独立文案时，用简体转换，避免落到英文。
 * 越南语（vn）兼容 vi 字段名，并尝试用字典翻译英文字段。
 */
export function localizeText(text: JsonbText, locale: string): string {
  if (text == null) return '';
  if (typeof text === 'string') {
    if (locale === HANT_LOCALE) return toHant(text);
    if (locale === 'vn' && viTextDict[text]) return viTextDict[text];
    return text;
  }
  if (locale === HANT_LOCALE) {
    if (text['zh-TW']) return text['zh-TW'];
    if (text.zh) return toHant(text.zh);
    if (text.en) return text.en;
  }
  // 越南语兼容：vn locale 先找 vi 字段，再找 vn 字段，再用字典翻译英文
  if (locale === 'vn') {
    if (text.vi) return text.vi;
    if (text.vn) return text.vn;
    if (text.en && viTextDict[text.en]) return viTextDict[text.en];
    if (text.zh && viTextDict[text.zh]) return viTextDict[text.zh];
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
