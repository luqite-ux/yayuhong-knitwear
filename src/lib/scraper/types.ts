export interface ScraperProduct {
  platform_id: string;
  platform_product_id?: string;
  name: { en: string; zh?: string };
  model?: string;
  image_url: string;
  gallery_urls?: string[];
  price?: {
    amount: number;
    currency: string;
  };
  original_price?: {
    amount: number;
    currency: string;
  };
  rating?: number;
  review_count?: number;
  sales_count?: number;
  is_hot?: boolean;
  material?: { en: string; zh?: string };
  description?: { en: string; zh?: string };
  tags?: string[];
  product_url?: string;
  source: string;
}

export interface PlatformCategory {
  slug: string;
  name: { en: string; zh: string };
  url: string;
  keywords?: string[];
}

export interface PlatformConfig {
  id: string;
  name: string;
  fullName: string;
  site: string;
  currency: string;
  language: string;
  status: 'active' | 'beta' | 'planned';
  categories: PlatformCategory[];
  categoryMapping: Record<string, string>;
}

export interface FetchOptions {
  platform: string;
  category?: string;
  keyword?: string;
  limit?: number;
  minSales?: number;
  minRating?: number;
  sortBy?: 'hot' | 'newest' | 'price_asc' | 'price_desc' | 'rating';
}

export interface FetchResult {
  platform: string;
  category?: string;
  keyword?: string;
  total: number;
  products: ScraperProduct[];
  fetched_at: string;
}
