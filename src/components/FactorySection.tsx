'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

const factoryIcons = ['🏭', '👥', '🔍', '⚡'];

export default function FactorySection() {
  const t = useTranslations('factory');
  const locale = useLocale();
  const features = t.raw('features');

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Image collage */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl aspect-[3/4] overflow-hidden shadow-lg">
                <img 
                  src="/images/factory/factory-workshop.jpg" 
                  alt="Factory workshop"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl aspect-square overflow-hidden shadow-lg">
                  <img 
                    src="/images/factory/quality-control.jpg" 
                    alt="Quality control"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl aspect-square overflow-hidden shadow-lg bg-gradient-to-br from-[var(--color-accent)]/90 to-[var(--color-secondary)]/90 flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <div className="text-3xl font-bold">30K+</div>
                    <div className="text-sm opacity-80">{locale === 'zh' ? '日产能' : 'Daily Output'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Experience badge */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl">
              <div className="text-4xl font-bold text-gold-gradient">20+</div>
              <div className="text-sm text-[var(--color-text-muted)] mt-1">
                {locale === 'zh' ? '年行业经验' : 'Years Experience'}
              </div>
            </div>
          </div>
          
          {/* Right - Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium mb-4">
              {locale === 'zh' ? '关于工厂' : 'About Factory'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)] mb-6">
              {t('title')}
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
              {t('subtitle')}
            </p>
            
            {/* Feature list */}
            <div className="space-y-5">
              {features.map((feat: { title: string; desc: string }, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-warm-gray)] flex items-center justify-center text-xl flex-shrink-0">
                    {factoryIcons[index]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--color-primary)] mb-1">
                      {feat.title}
                    </h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <Link href="/factory" className="btn-primary">
                {t('learnMore')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
