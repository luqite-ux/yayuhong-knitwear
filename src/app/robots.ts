import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { detectSiteKey } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const host = h.get('host') || '';
  const siteKey = detectSiteKey(host);

  const baseUrl = siteKey === 'china'
    ? 'https://xiuyumaoshan.cn'
    : (process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/_next/', '/api/', '/admin'],
      },
      // 国内站额外针对百度蜘蛛
      ...(siteKey === 'china' ? [
        {
          userAgent: 'Baiduspider',
          allow: '/',
          disallow: ['/_next/', '/api/', '/admin'],
        },
      ] : []),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
