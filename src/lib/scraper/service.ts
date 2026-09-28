import { ScraperProduct, FetchOptions, FetchResult, PlatformConfig } from './types';
import { getPlatform } from './platforms';

/**
 * Scraper service layer.
 *
 * This service provides a unified interface for product scraping across platforms.
 * Currently it returns platform metadata and example structure for external AI
 * tools to use. Actual scraping is done by external AI tools that call our
 * import API with scraped product data.
 *
 * To add a real scraper implementation, create a file at:
 *   src/lib/scraper/platforms/<platform-id>.ts
 * and export a fetchHotProducts function.
 */

export async function fetchHotProducts(
  options: FetchOptions
): Promise<FetchResult & { scrape_instructions: string; target_url: string }> {
  const { platform, category, keyword, limit = 20 } = options;

  const platformConfig = getPlatform(platform);
  if (!platformConfig) {
    throw new Error(`Platform "${platform}" not supported`);
  }

  // Find target category URL
  let targetUrl = platformConfig.site;
  let targetCategory = category;

  if (category) {
    const cat = platformConfig.categories.find(
      (c) => c.slug === category || c.slug === platformConfig.categoryMapping[category]
    );
    if (cat) {
      targetUrl = cat.url;
      targetCategory = cat.slug;
    }
  }

  // If keyword provided, hint to use search
  if (keyword) {
    targetUrl = buildSearchUrl(platformConfig, keyword);
  }

  // Return metadata + instructions for external AI scraper
  return {
    platform: platformConfig.id,
    category: targetCategory,
    keyword: keyword || undefined,
    total: 0,
    products: [],
    fetched_at: new Date().toISOString(),
    target_url: targetUrl,
    scrape_instructions: `
This endpoint returns scraping metadata and target URLs. 
To actually scrape products, use an external AI/browser automation tool
with the target_url above, then POST the results to:
  POST /api/scraper/import (with X-API-Key header)
  POST /api/public/products/import (with X-API-Key header)

Expected product format for import:
{
  "category_slug": "womens",
  "name": { "en": "Product Name" },
  "model": "SKU-001",
  "image_url": "https://...",
  "gallery_urls": ["https://..."],
  "material": { "en": "100% Cotton" },
  "source": "${platformConfig.id}",
  "is_active": true
}
`.trim(),
  };
}

function buildSearchUrl(platform: PlatformConfig, keyword: string): string {
  const encoded = encodeURIComponent(keyword);
  switch (platform.id) {
    case 'shein':
      return `https://us.shein.com/pdsearch/${encoded}/`;
    case 'amazon':
      return `https://www.amazon.com/s?k=${encoded}`;
    case 'aliexpress':
      return `https://www.aliexpress.com/w/wholesale-${encoded.replace(/ /g, '-')}.html`;
    case 'temu':
      return `https://www.temu.com/search_result.html?search_key=${encoded}`;
    case 'walmart':
      return `https://www.walmart.com/search?q=${encoded}`;
    case 'alibaba':
      return `https://www.alibaba.com/trade/search?SearchText=${encoded}`;
    default:
      return platform.site;
  }
}

/**
 * Validate scraped product data before import.
 * Returns array of errors (empty = valid).
 */
export function validateScrapedProducts(products: ScraperProduct[]): string[] {
  const errors: string[] = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const prefix = `Product ${i + 1}`;

    if (!p.name?.en) {
      errors.push(`${prefix}: name.en is required`);
    }
    if (!p.image_url) {
      errors.push(`${prefix}: image_url is required`);
    }
    if (!p.source) {
      errors.push(`${prefix}: source is required`);
    }
    if (p.price && (typeof p.price.amount !== 'number' || !p.price.currency)) {
      errors.push(`${prefix}: price must have amount (number) and currency (string)`);
    }
  }

  return errors;
}
