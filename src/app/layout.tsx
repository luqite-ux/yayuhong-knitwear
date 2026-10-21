import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Yayuhong Knitwear - Fast Fashion Sweater Factory',
    template: '%s | Yayuhong Knitwear',
  },
  description: 'Professional knitwear manufacturer with 20 years experience. 30,000 pcs daily capacity, 50 pcs MOQ, 7-day delivery.',
  keywords: ['knitwear manufacturer', 'sweater factory', 'custom knitwear', 'fast fashion', 'ODM', 'OEM', 'China factory'],
  authors: [{ name: 'Yayuhong Knitwear' }],
  creator: 'Yayuhong Knitwear',
  publisher: 'Yayuhong Knitwear',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.svg', type: 'image/svg+xml' }],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_CN', 'zh_TW', 'ru_RU', 'es_ES', 'de_DE', 'fr_FR', 'pt_PT', 'ja_JP', 'ar_SA'],
    url: siteUrl,
    siteName: 'Yayuhong Knitwear',
    title: 'Yayuhong Knitwear - Fast Fashion Sweater Factory',
    description: 'Professional knitwear manufacturer with 20 years experience. 30,000 pcs daily capacity, 50 pcs MOQ, 7-day delivery.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Yayuhong Knitwear Factory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yayuhong Knitwear - Fast Fashion Sweater Factory',
    description: 'Professional knitwear manufacturer with 20 years experience. 30,000 pcs daily capacity, 50 pcs MOQ, 7-day delivery.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Bing Webmaster Tools 站点认领（IndexNow 推送生效前提）
  other: {
    'msvalidate.01': '0C1803ABC154A9F2B2CF845A2E9F2DDC',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
