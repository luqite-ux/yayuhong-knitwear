import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/:key([a-zA-Z0-9-]{8,128})\\.txt',
        destination: '/api/indexnow/key/:key',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.R2_PUBLIC_BASE_URL
          ? new URL(process.env.R2_PUBLIC_BASE_URL).hostname
          : 'localhost',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
