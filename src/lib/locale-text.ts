/** 客户端用：简体 / 繁体 / 其他语言。繁体字符串预先写好，避免把转换词库打进浏览器包。 */

// 越南语翻译字典（key = 英文原文，value = 越南语翻译）
const viDict: Record<string, string> = {
  // Header / Footer
  'Fast Fashion Factory': 'Nhà Máy Thời Trang Nhanh',
  '快时尚源头工厂': 'Nhà Máy Thời Trang Nhanh',

  // Hero
  'Knitwear': 'Dệt Kim',
  'Source Factory': 'Nhà Máy Gốc',
  'Get Quote': 'Nhận Báo Giá',
  'Virtual Tour': 'Tham Quan Ảo',

  // Product Showcase
  'Product Range': 'Sản Phẩm Của Chúng Tôi',
  'Learn more': 'Xem chi tiết',
  '查看详情': 'Xem chi tiết',

  // Factory Section
  'Our Factory': 'Nhà Máy Của Chúng Tôi',
  'Why Choose Us': 'Vì Sao Chọn Chúng Tôi',

  // Services
  'Our Services': 'Dịch Vụ Của Chúng Tôi',
  'Custom Design': 'Thiết Kế Tùy Chỉnh',
  'OEM/ODM': 'OEM/ODM',
  'Private Label': 'Nhãn Hiệu Riêng',
  'Small Batch': 'Đơn Nhỏ',

  // Process
  'Our Process': 'Quy Trình Sản Xuất',

  // FAQ
  'Frequently Asked Questions': 'Câu Hỏi Thường Gặp',
  'FAQ': 'Câu Hỏi Thường Gặp',

  // CTA
  'Get Started Today': 'Bắt Đầu Hôm Nay',
  'Contact Us': 'Liên Hệ Chúng Tôi',
  '联系我们': 'Liên Hệ',

  // Contact Form
  'Name': 'Họ tên',
  'Email': 'Email',
  'Company': 'Công ty',
  'Message': 'Tin nhắn',
  'Send Message': 'Gửi Tin Nhắn',
  '发送': 'Gửi',
  'Submit': 'Gửi',
  'Required': 'Bắt buộc',
  'Please enter your name': 'Vui lòng nhập họ tên',
  'Please enter a valid email': 'Vui lòng nhập email hợp lệ',
  'Please enter your message': 'Vui lòng nhập tin nhắn',
  'Sending...': 'Đang gửi...',
  'Message sent successfully!': 'Gửi tin nhắn thành công!',
  'Failed to send message': 'Gửi tin nhắn thất bại',

  // Ready Stock
  'Ready to Ship': 'Có Sẵn Giao',
  'In Stock': 'Tồn Kho',
  '现货': 'Có Sẵn',
  'View All': 'Xem Tất Cả',
  '查看全部': 'Xem Tất Cả',

  // Floating Contact
  'Contact': 'Liên Hệ',
  'WhatsApp': 'WhatsApp',
  'WeChat': 'WeChat',

  // Misc
  'years': 'năm',
  'days': 'ngày',
  'pcs': 'chiếc',
  'MOQ': 'MOQ',
};

export function zhOrEn(locale: string, hans: string, hant: string, en: string): string {
  if (locale === 'zh') return hans;
  if (locale === 'zh-TW') return hant;
  if (locale === 'vn') {
    // 先查英文字典，再查简中字典
    if (viDict[en]) return viDict[en];
    if (viDict[hans]) return viDict[hans];
    return en;
  }
  return en;
}
