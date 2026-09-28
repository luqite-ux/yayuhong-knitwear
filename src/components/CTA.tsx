'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { zhOrEn } from '@/lib/locale-text';

export default function CTA() {
  const t = useTranslations('cta');
  const locale = useLocale();

  return (
    <section className="py-20 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-accent-dark)] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 knit-texture opacity-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[var(--color-secondary)]/10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[var(--color-accent)]/10 blur-3xl"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          {t('title')}
        </h2>
        <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/contact" className="btn-primary !bg-white !text-[var(--color-primary)] hover:!bg-white/90 hover:!shadow-xl">
            {t('primaryBtn')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link href="/products" className="btn-secondary">
            {t('secondaryBtn')}
          </Link>
        </div>
        
        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-8 mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <svg className="w-5 h-5 text-[var(--color-secondary-light)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {zhOrEn(locale, '免费报价', '免費報價', 'Free Quote')}
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <svg className="w-5 h-5 text-[var(--color-secondary-light)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {zhOrEn(locale, '24小时响应', '24小時響應', '24hr Response')}
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <svg className="w-5 h-5 text-[var(--color-secondary-light)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {zhOrEn(locale, '3-5天打样', '3-5天打樣', '3-5 Day Sampling')}
          </div>
        </div>
      </div>
    </section>
  );
}
