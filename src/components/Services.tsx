'use client';

import { useTranslations, useLocale } from 'next-intl';

const serviceIcons = ['🎨', '🏷️', '⚡', '📦'];

export default function Services() {
  const t = useTranslations('services');
  const locale = useLocale();
  const services = t.raw('items');

  return (
    <section className="section-padding bg-[var(--color-cream)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm font-medium mb-4">
            {locale === 'zh' ? '服务模式' : 'Service Models'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)] mb-4">
            {t('title')}
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
        
        {/* Service cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service: { title: string; desc: string; features: string[] }, index: number) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 card-hover border border-[var(--color-border)]/50 group"
            >
              <div className="flex items-start gap-5">
                <div className="service-icon flex-shrink-0 group-hover:scale-110 transition-transform">
                  {serviceIcons[index]}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[var(--color-primary)] mb-3">
                    {service.title}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-4 leading-relaxed">
                    {service.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feat: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-[var(--color-warm-gray)] text-xs text-[var(--color-text-secondary)]"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
