// 家居服产品数据 - 从产品目录图提取
// 款号 63015-63039（图1、图3、图4）+ 图2部分款号
// 所有产品归类为 loungewear-set（家居服套装）

export interface ProductSeed {
  model: string;
  zh: string;
  en: string;
  color: string;
  sizes: string;
  quantity: number;
  image_url: string;
}

// 图3：63015-63022（9款，含63019两色）
// 图4：63023-63031（9款）
// 图1：63032-63039（8款）
// 图2：62017系列（~10款，清晰度低）

export const newProducts: ProductSeed[] = [
  // ========== 图3：63015-63022 ==========
  { model: '63015', zh: '杏色长款开衫家居服套装', en: 'Beige Long Cardigan Loungewear Set', color: '杏色', sizes: 'M/L/XL', quantity: 45, image_url: '' },
  { model: '63016', zh: '棕色印花家居服套装', en: 'Brown Printed Loungewear Set', color: '棕色', sizes: 'M/L/XL', quantity: 50, image_url: '' },
  { model: '63017', zh: '浅灰绿色罗纹家居服', en: 'Light Gray-Green Ribbed Loungewear Set', color: '灰绿', sizes: 'M/L/XL', quantity: 50, image_url: '' },
  { model: '63018', zh: '杏色长款开衫睡袍', en: 'Beige Long Cardigan Robe', color: '杏色', sizes: 'M/L/XL', quantity: 45, image_url: '' },
  { model: '63019-杏色', zh: '杏色家居服套装', en: 'Apricot Loungewear Set', color: '杏色', sizes: 'M/L/XL', quantity: 45, image_url: '' },
  { model: '63019-绿色', zh: '绿色家居服套装', en: 'Green Loungewear Set', color: '绿色', sizes: 'M/L/XL', quantity: 45, image_url: '' },
  { model: '63020', zh: '粉色家居服套装', en: 'Pink Loungewear Set', color: '粉色', sizes: 'M/L/XL', quantity: 45, image_url: '' },
  { model: '63021', zh: '浅蓝色睡衣套装', en: 'Light Blue Pajama Set', color: '浅蓝', sizes: 'M/L/XL', quantity: 45, image_url: '' },
  { model: '63022', zh: '奶白色肌理感家居服', en: 'Cream Textured Loungewear Set', color: '奶白', sizes: 'M/L/XL', quantity: 60, image_url: '' },

  // ========== 图4：63023-63031 ==========
  { model: '63023', zh: '杏色上衣深色条纹裤家居服', en: 'Beige Top with Dark Striped Pants', color: '杏色', sizes: 'M/L/XL', quantity: 45, image_url: '' },
  { model: '63024', zh: '粉色上衣粉色条纹裤家居服', en: 'Pink Top with Pink Striped Pants', color: '粉色', sizes: 'M/L/XL', quantity: 45, image_url: '' },
  { model: '63025', zh: '奶白色家居服套装', en: 'Cream White Loungewear Set', color: '奶白', sizes: 'M/L/XL', quantity: 50, image_url: '' },
  { model: '63026', zh: '杏色全套家居服', en: 'Beige Full Loungewear Set', color: '杏色', sizes: 'M/L/XL', quantity: 60, image_url: '' },
  { model: '63027', zh: '鼠尾草绿色家居服套装', en: 'Sage Green Loungewear Set', color: '绿色', sizes: 'M/L/XL', quantity: 60, image_url: '' },
  { model: '63028', zh: '黑色家居服套装', en: 'Black Loungewear Set', color: '黑色', sizes: 'M/L/XL', quantity: 60, image_url: '' },
  { model: '63029', zh: '黑色家居服套装（款二）', en: 'Black Loungewear Set Style 2', color: '黑色', sizes: 'M/L/XL', quantity: 60, image_url: '' },
  { model: '63030', zh: '浅蓝色家居服套装', en: 'Light Blue Loungewear Set', color: '浅蓝', sizes: 'M/L/XL', quantity: 45, image_url: '' },
  { model: '63031', zh: '浅蓝白色家居服套装', en: 'Light Blue-White Loungewear Set', color: '浅蓝', sizes: 'M/L/XL', quantity: 45, image_url: '' },

  // ========== 图1：63032-63039 ==========
  { model: '63032', zh: '深灰色拉链家居服套装（男款）', en: 'Dark Gray Zip Loungewear Set (Men)', color: '深灰', sizes: 'L/XL/XXL', quantity: 60, image_url: '' },
  { model: '63033', zh: '奶白色开衫阔腿裤套装', en: 'Cream Cardigan Wide-Leg Pants Set', color: '奶白', sizes: 'M/L/XL', quantity: 60, image_url: '' },
  { model: '63034', zh: '粉色印花连体家居服', en: 'Pink Printed Onesie Loungewear', color: '粉色', sizes: 'M/L/XL', quantity: 60, image_url: '' },
  { model: '63035', zh: '薄荷绿熊耳朵卫衣套装', en: 'Mint Green Bear Ear Sweatshirt Set', color: '薄荷绿', sizes: 'M/L/XL', quantity: 60, image_url: '' },
  { model: '63036', zh: '奶白色蓝蝴蝶结上衣条纹裤', en: 'Cream Blue Bow Top Striped Pants', color: '奶白', sizes: 'M/L/XL', quantity: 60, image_url: '' },
  { model: '63037', zh: '浅蓝色小熊贴花开衫套装', en: 'Light Blue Bear Appliqué Cardigan Set', color: '浅蓝', sizes: 'M/L/XL', quantity: 60, image_url: '' },
  { model: '63038', zh: '奶白色连帽动物耳朵家居服', en: 'Cream Hooded Animal Ear Onesie', color: '奶白', sizes: 'M/L/XL', quantity: 60, image_url: '' },
  { model: '63039', zh: '白色印花开衫粉色阔腿裤', en: 'White Printed Cardigan Pink Wide-Leg Pants', color: '白/粉', sizes: 'M/L/XL', quantity: 60, image_url: '' },
];

// SEO 优化函数
export function buildSeoName(zh: string, en: string) {
  return {
    zh: `${zh}_批发定制_OEM贴牌_源头工厂`,
    en: `${en} - Wholesale Custom OEM Factory Direct`,
    ru: `${en} - Оптовый производитель на заказ`,
  };
}

export function buildSeoSummary(zh: string, en: string, color: string) {
  return {
    zh: `${zh}，颜色：${color}。源头工厂直供，支持OEM/ODM贴牌定制，来图来样加工，MOQ 50件起订，7天快速打样，月产能100万件。`,
    en: `${en}. Color: ${color}. Factory direct with OEM/ODM custom service. Low MOQ 50pcs, 7-day sample lead time, 1M pcs monthly capacity.`,
    ru: `${en}. Цвет: ${color}. Прямой производитель с OEM/ODM услугами.`,
  };
}
