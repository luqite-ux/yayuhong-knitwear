import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
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
