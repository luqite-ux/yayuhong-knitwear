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

  // Factory Page - About Section
  '关于我们': 'Về Chúng Tôi',
  'About Us': 'Về Chúng Tôi',
  '20年匠心制造，专注每一针一线': '20 Năm Kinh Nghiệm, Từng Chiếc Áo',
  '20 Years of Craftsmanship, Stitch by Stitch': '20 Năm Kinh Nghiệm, Từng Chiếc Áo',
  '亚裕鸿毛织厂坐落于中国毛织名镇——广东省汕头市澄海区，这里拥有近40年的工艺毛衫生产历史，是全国重要的毛衫生产基地。': 'Nhà Máy Dệt Kim Yayuhong tọa lạc tại Quận Chenghai, Thành Phố Shantou, Tỉnh Quảng Đông — một thị trấn dệt kim nổi tiếng của Trung Quốc với gần 40 năm lịch sử sản xuất áo len thủ công, là cơ sở sản xuất áo len quan trọng của cả nước.',
  'Yayuhong Knitwear Factory is located in Chenghai District, Shantou City, Guangdong Province - a famous knitwear town in China with nearly 40 years of craftsmanship sweater production history.': 'Nhà Máy Dệt Kim Yayuhong tọa lạc tại Quận Chenghai, Thành Phố Shantou, Tỉnh Quảng Đông — một thị trấn dệt kim nổi tiếng của Trung Quốc với gần 40 năm lịch sử sản xuất áo len thủ công, là cơ sở sản xuất áo len quan trọng của cả nước.',
  '工厂成立于2004年，经过20年的发展，目前拥有核心技术人员20人，加工工区30个，日产毛衫30000件。我们始终坚持"品质第一、客户至上"的经营理念，为全球客户提供优质的毛织产品和服务。': 'Thành lập năm 2004, sau 20 năm phát triển, hiện nay chúng tôi có 20 kỹ thuật viên cốt lõi và 30 xưởng sản xuất, với năng lực 30.000 chiếc/ngày. Chúng tôi luôn giữ vững triết lý kinh doanh "Chất Lượng Đầu Tiên, Khách Hàng Là Trên", cung cấp sản phẩm và dịch vụ dệt kim chất lượng cao cho khách hàng toàn cầu.',
  'Founded in 2004, after 20 years of development, we now have 20 core technicians and 30 production workshops, with a daily capacity of 30,000 sweaters. We always adhere to the "Quality First, Customer First" business philosophy.': 'Thành lập năm 2004, sau 20 năm phát triển, hiện nay chúng tôi có 20 kỹ thuật viên cốt lõi và 30 xưởng sản xuất, với năng lực 30.000 chiếc/ngày. Chúng tôi luôn giữ vững triết lý kinh doanh "Chất Lượng Đầu Tiên, Khách Hàng Là Trên", cung cấp sản phẩm và dịch vụ dệt kim chất lượng cao cho khách hàng toàn cầu.',
  '我们的产品远销欧美、东南亚、中东等全球多个国家和地区，是众多知名快时尚品牌和电商平台的核心供应商。': 'Sản phẩm của chúng tôi được xuất khẩu sang Châu Âu, Châu Mỹ, Đông Nam Á, Trung Đông và nhiều quốc gia, khu vực khác. Chúng tôi là nhà cung cấp cốt lõi của nhiều thương hiệu thời trang nhanh và nền tảng thương mại điện tử nổi tiếng.',
  'Our products are exported to Europe, America, Southeast Asia, the Middle East and many other countries and regions. We are a core supplier to many well-known fast fashion brands and e-commerce platforms.': 'Sản phẩm của chúng tôi được xuất khẩu sang Châu Âu, Châu Mỹ, Đông Nam Á, Trung Đông và nhiều quốc gia, khu vực khác. Chúng tôi là nhà cung cấp cốt lõi của nhiều thương hiệu thời trang nhanh và nền tảng thương mại điện tử nổi tiếng.',

  // Factory Page - Our Strengths
  '我们的优势': 'Điểm Mạnh Của Chúng Tôi',
  'Our Strengths': 'Điểm Mạnh Của Chúng Tôi',

  // Factory Page - Production Equipment
  '生产设备': 'Thiết Bị Sản Xuất',
  'Production Equipment': 'Thiết Bị Sản Xuất',
  '配备先进的生产设备，确保高效稳定的产能和卓越的产品品质': 'Trang bị thiết bị sản xuất tiên tiến, đảm bảo năng lực sản xuất hiệu quả, ổn định và chất lượng sản phẩm xuất sắc',
  'Equipped with advanced production equipment to ensure efficient and stable capacity with excellent product quality': 'Trang bị thiết bị sản xuất tiên tiến, đảm bảo năng lực sản xuất hiệu quả, ổn định và chất lượng sản phẩm xuất sắc',
  '电脑横机': 'Máy Dệt Kim Phẳng Vi Tính',
  'Computerized Flat Knitting Machine': 'Máy Dệt Kim Phẳng Vi Tính',
  '半自动横机': 'Máy Dệt Kim Phẳng Bán Tự Động',
  'Semi-automatic Flat Knitting Machine': 'Máy Dệt Kim Phẳng Bán Tự Động',
  '缝合机': 'Máy Móc Nối',
  'Linking Machine': 'Máy Móc Nối',
  '整烫设备': 'Thiết Bị Ép Hơi',
  'Ironing Equipment': 'Thiết Bị Ép Hơi',
  '质检流水线': 'Dây Chuyền Kiểm Tra Chất Lượng',
  'QC Assembly Line': 'Dây Chuyền Kiểm Tra Chất Lượng',
  '设计打版系统': 'Hệ Thống Thiết Kế & Lập Rập',
  'Design & Pattern System': 'Hệ Thống Thiết Kế & Lập Rập',

  // Factory Page - Production Process
  '生产流程': 'Quy Trình Sản Xuất',
  'Production Process': 'Quy Trình Sản Xuất',
  '6道核心工序，层层把控，确保每一件产品都达到最高品质标准': '6 công đoạn cốt lõi, kiểm soát từng lớp, đảm bảo mỗi sản phẩm đều đạt tiêu chuẩn chất lượng cao nhất',
  '6 core processes with layered control ensuring every product meets the highest quality standards': '6 công đoạn cốt lõi, kiểm soát từng lớp, đảm bảo mỗi sản phẩm đều đạt tiêu chuẩn chất lượng cao nhất',
  '设计打版': 'Thiết Kế & Lập Rập',
  'Design & Pattern': 'Thiết Kế & Lập Rập',
  '专业设计师根据需求设计款式，制作样板': 'Nhà thiết kế chuyên nghiệp tạo kiểu dáng và làm mẫu theo yêu cầu',
  'Professional designers create styles and patterns based on requirements': 'Nhà thiết kế chuyên nghiệp tạo kiểu dáng và làm mẫu theo yêu cầu',
  '原料采购': 'Mua Nguyên Vật Liệu',
  'Material Sourcing': 'Mua Nguyên Vật Liệu',
  '精选优质纱线，严格把控原料品质': 'Tuyển chọn sợi cao cấp, kiểm soát nghiêm ngặt chất lượng nguyên liệu',
  'Carefully selected high-quality yarns with strict quality control': 'Tuyển chọn sợi cao cấp, kiểm soát nghiêm ngặt chất lượng nguyên liệu',
  '编织生产': 'Sản Xuất Dệt Kim',
  'Knitting Production': 'Sản Xuất Dệt Kim',
  '熟练工人操作机器，高效生产': 'Công nhân thành thạo vận hành máy móc, sản xuất hiệu quả',
  'Skilled workers operating machines for efficient production': 'Công nhân thành thạo vận hành máy móc, sản xuất hiệu quả',
  '缝合套口': 'Móc Nối & May Ghép',
  'Linking & Seaming': 'Móc Nối & May Ghép',
  '精细缝合工艺，确保每一处接口牢固美观': 'Công nghệ móc nối tinh xảo, đảm bảo mỗi đường nối chắc chắn và đẹp mắt',
  'Fine linking craftsmanship ensuring sturdy and beautiful seams': 'Công nghệ móc nối tinh xảo, đảm bảo mỗi đường nối chắc chắn và đẹp mắt',
  '整烫定型': 'Ép Hơi & Định Hình',
  'Ironing & Shaping': 'Ép Hơi & Định Hình',
  '专业整烫工艺，塑造完美版型': 'Công nghệ ép hơi chuyên nghiệp, tạo form hoàn hảo',
  'Professional ironing process for perfect shaping': 'Công nghệ ép hơi chuyên nghiệp, tạo form hoàn hảo',
  '质检包装': 'Kiểm Tra Chất Lượng & Đóng Gói',
  'QC & Packaging': 'Kiểm Tra Chất Lượng & Đóng Gói',
  '三道质检工序，确保每一件产品合格': 'Ba giai đoạn kiểm tra chất lượng, đảm bảo mỗi sản phẩm đều đạt chuẩn',
  'Three QC stages ensuring every piece meets standards': 'Ba giai đoạn kiểm tra chất lượng, đảm bảo mỗi sản phẩm đều đạt chuẩn',

  // Factory Page - CTA
  '想实地参观我们的工厂？': 'Muốn Tham Quan Nhà Máy Của Chúng Tôi?',
  'Want to visit our factory?': 'Muốn Tham Quan Nhà Máy Của Chúng Tôi?',
  '欢迎预约实地参观，亲眼见证我们的生产实力和品质管控': 'Chào mừng bạn đặt lịch tham quan thực tế, chứng kiến năng lực sản xuất và kiểm soát chất lượng của chúng tôi',
  'Schedule a visit to see our production capacity and quality control firsthand': 'Chào mừng bạn đặt lịch tham quan thực tế, chứng kiến năng lực sản xuất và kiểm soát chất lượng của chúng tôi',
  '预约参观': 'Đặt Lịch Tham Quan',
  'Schedule a Visit': 'Đặt Lịch Tham Quan',

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
