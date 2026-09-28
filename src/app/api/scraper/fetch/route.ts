import { NextRequest, NextResponse } from 'next/server';
import { fetchHotProducts } from '@/lib/scraper/service';
import { getPlatform } from '@/lib/scraper/platforms';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * GET /api/scraper/fetch
 *
 * Get scraping metadata and target URLs for a platform + category.
 * Returns the URL to scrape and instructions for external AI tools.
 *
 * Query parameters:
 *   - platform (required): shein, amazon, aliexpress, temu, walmart, alibaba
 *   - category (optional): womens, mens, kids, loungewear, pet, accessories
 *   - keyword (optional): custom search keyword
 *   - limit (optional): max products, default 20
 *   - sortBy (optional): hot | newest | price_asc | price_desc | rating
 *
 * Example:
 *   GET /api/scraper/fetch?platform=shein&category=womens&limit=20
 *   GET /api/scraper/fetch?platform=amazon&keyword=cashmere+sweater
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get('platform');
  const category = searchParams.get('category') || undefined;
  const keyword = searchParams.get('keyword') || undefined;
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const sortBy = (searchParams.get('sortBy') as any) || 'hot';

  if (!platform) {
    return NextResponse.json(
      { error: 'platform parameter is required. Use ?platform=shein (or amazon, aliexpress, temu, walmart, alibaba)' },
      { status: 400 }
    );
  }

  const platformConfig = getPlatform(platform);
  if (!platformConfig) {
    return NextResponse.json(
      { error: `Platform "${platform}" not supported. Available: shein, amazon, aliexpress, temu, walmart, alibaba` },
      { status: 400 }
    );
  }

  if (category && !platformConfig.categoryMapping[category]) {
    const availableCats = Object.keys(platformConfig.categoryMapping).join(', ');
    return NextResponse.json(
      { error: `Category "${category}" not available for ${platformConfig.name}. Available: ${availableCats}` },
      { status: 400 }
    );
  }

  try {
    const result = await fetchHotProducts({
      platform,
      category,
      keyword,
      limit,
      sortBy,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Scraping failed' },
      { status: 500 }
    );
  }
}
