import { NextRequest, NextResponse } from 'next/server';
import { getPlatform, getPlatformList, platforms } from '@/lib/scraper/platforms';

export const dynamic = 'force-dynamic';

/**
 * GET /api/scraper/platforms
 * GET /api/scraper/platforms?platform=shein
 *
 * Returns list of supported platforms and their category configurations,
 * including search URLs and keywords for scraping.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const platformId = searchParams.get('platform');

  // Single platform details
  if (platformId) {
    const platform = getPlatform(platformId);
    if (!platform) {
      return NextResponse.json(
        { error: `Platform "${platformId}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: platform.id,
      name: platform.name,
      fullName: platform.fullName,
      site: platform.site,
      currency: platform.currency,
      language: platform.language,
      status: platform.status,
      categories: platform.categories,
    });
  }

  // All platforms list
  const list = getPlatformList();
  const activeCount = list.filter((p) => p.status === 'active').length;
  const betaCount = list.filter((p) => p.status === 'beta').length;
  const plannedCount = list.filter((p) => p.status === 'planned').length;

  return NextResponse.json({
    total: list.length,
    active: activeCount,
    beta: betaCount,
    planned: plannedCount,
    platforms: list,
    endpoints: {
      fetch: '/api/scraper/fetch?platform=:id&category=:slug&limit=20',
      platforms: '/api/scraper/platforms?platform=:id',
      import: '/api/scraper/import (POST)',
    },
  });
}
