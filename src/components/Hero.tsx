'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { zhOrEn } from '@/lib/locale-text';

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();

  return (
    <section className="hero-gradient min-h-screen flex items-center pt-20 knit-texture relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[var(--color-secondary)]/5 blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-[var(--color-accent)]/5 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-[var(--color-secondary-light)] animate-pulse"></span>
              <span className="text-sm text-white/80">{t('badge')}</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in-up stagger-1">
              {t('title')}
              <br />
              <span className="text-gold-gradient">
                {t('titleHighlight')}
              </span>
            </h1>
            
            <p className="text-lg text-white/70 mb-8 whitespace-pre-line leading-relaxed animate-fade-in-up stagger-2">
              {t('subtitle')}
            </p>
            
            <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-3">
              <Link href="/contact" className="btn-primary">
                {t('primaryBtn')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/factory" className="btn-secondary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('secondaryBtn')}
              </Link>
            </div>
            
            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 mt-10 pt-10 border-t border-white/10 animate-fade-in-up stagger-4">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <svg className="w-5 h-5 text-[var(--color-secondary-light)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {zhOrEn(locale, 'BSCI认证工厂', 'BSCI認證工廠', 'BSCI Certified')}
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <svg className="w-5 h-5 text-[var(--color-secondary-light)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {zhOrEn(locale, 'ISO9001质量体系', 'ISO9001質量體系', 'ISO 9001 Quality')}
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <svg className="w-5 h-5 text-[var(--color-secondary-light)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {zhOrEn(locale, '20年行业经验', '20年行業經驗', '20+ Years Experience')}
              </div>
            </div>
          </div>
          
          {/* Right side - Hero image */}
          <div className="hidden lg:block relative px-6 py-4">
            <div className="relative">
              {/* Main product showcase */}
              <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img 
                  src="/images/hero-shein-style.jpg" 
                  alt="Premium knitwear product showcase"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/20 to-transparent"></div>
              </div>
              
              {/* Floating card 1 - 7 days delivery */}
              <div className="absolute -left-4 top-16 bg-white rounded-2xl px-4 py-3 shadow-xl max-w-[180px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center text-xl flex-shrink-0">
                    ⚡
                  </div>
                  <div>
                    <div className="font-bold text-[var(--color-primary)] text-base">7 {zhOrEn(locale, '天', '天', 'Days')}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {zhOrEn(locale, '快速交货', '快速交貨', 'Fast Delivery')}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating card 2 - Daily capacity */}
              <div className="absolute -right-2 bottom-32 bg-white rounded-2xl px-4 py-3 shadow-xl max-w-[200px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)]/10 flex items-center justify-center text-xl flex-shrink-0">
                    🏭
                  </div>
                  <div>
                    <div className="font-bold text-[var(--color-primary)] text-base">30,000+</div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {zhOrEn(locale, '日产能', '日產能', 'Daily Capacity')}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating card 3 - MOQ */}
              <div className="absolute -left-2 bottom-16 bg-white rounded-2xl px-4 py-3 shadow-xl max-w-[190px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl flex-shrink-0">
                    ✅
                  </div>
                  <div>
                    <div className="font-bold text-[var(--color-primary)] text-base">50 {zhOrEn(locale, '件起', '件起', 'pcs MOQ')}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {zhOrEn(locale, '小单试款', '小單試款', 'Small Order OK')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/10">
          <div className="text-center">
            <div className="stat-number">20+</div>
            <p className="text-white/60 text-sm mt-2">{t('stats.years')}</p>
          </div>
          <div className="text-center">
            <div className="stat-number">30K</div>
            <p className="text-white/60 text-sm mt-2">{t('stats.dailyCapacity')}</p>
          </div>
          <div className="text-center">
            <div className="stat-number">50</div>
            <p className="text-white/60 text-sm mt-2">{t('stats.moq')}</p>
          </div>
          <div className="text-center">
            <div className="stat-number">7</div>
            <p className="text-white/60 text-sm mt-2">{t('stats.delivery')}</p>
          </div>
        </div>
      </div>
      
      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#faf8f5"/>
        </svg>
      </div>
    </section>
  );
}
