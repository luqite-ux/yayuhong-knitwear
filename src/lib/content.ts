import { sql, deepParseJson } from '@/lib/db';

export interface ReadyStockProduct {
  id: string;
  code: string;
  image_url: string;
  label: Record<string, string>; // { zh, hant, en }
  sort: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeatureItem {
  id: string;
  category: string;
  icon: string;
  title: Record<string, string>; // { zh, hant, en }
  desc: Record<string, string>; // { zh, hant, en }
  sort: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 读取现货产品列表
 * 按 sort 排序，仅返回 is_active = true 的记录
 * 失败时返回空数组
 */
export async function getReadyStockProducts(): Promise<ReadyStockProduct[]> {
  try {
    const rows = await sql`
      select * from content_ready_stock
      where is_active = true
      order by sort asc, created_at desc
    `;

    if (!rows || rows.length === 0) return [];

    const parsed = deepParseJson(rows) as ReadyStockProduct[];
    return parsed;
  } catch (err) {
    console.error('Failed to fetch content_ready_stock from DB:', err);
    return [];
  }
}

/**
 * 读取指定分类的特点/优势列表
 * 按 sort 排序，仅返回 is_active = true 的记录
 * 失败时返回空数组
 */
export async function getFeatures(category: string): Promise<FeatureItem[]> {
  try {
    const rows = await sql`
      select * from content_features
      where category = ${category}
        and is_active = true
      order by sort asc, created_at desc
    `;

    if (!rows || rows.length === 0) return [];

    const parsed = deepParseJson(rows) as FeatureItem[];
    return parsed;
  } catch (err) {
    console.error(`Failed to fetch content_features (category=${category}) from DB:`, err);
    return [];
  }
}
