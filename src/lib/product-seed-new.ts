// 家居服产品数据 - 从产品目录图提取
// 款号 63015-63039（图1、图3、图4）+ 图2部分款号
// 所有产品归类为 loungewear-set（家居服套装）
// 部署标记：env vars ready 2026-10-05

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
