import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yayuhong.com';

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
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_CN'],
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col bg-[var(--color-cream)]">
        {children}
      </body>
    </html>
  );
}
