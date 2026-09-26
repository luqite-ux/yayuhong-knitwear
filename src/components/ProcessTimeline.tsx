'use client';

import { useTranslations, useLocale } from 'next-intl';

const stepNumbers = ['01', '02', '03', '04', '05', '06'];

export default function ProcessTimeline() {
  const t = useTranslations('process');
  const locale = useLocale();
  const steps = t.raw('steps');

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-secondary)]/10 text-[var(--color-secondary-dark)] text-sm font-medium mb-4">
            {locale === 'zh' ? '合作流程' : 'Process'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)] mb-4">
            {t('title')}
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
        
        {/* Timeline */}
        <div className="timeline-line grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {steps.map((step: { title: string; desc: string }, index: number) => (
            <div key={index} className="text-center relative">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center text-white font-bold text-lg mb-4 relative z-10">
                {stepNumbers[index]}
              </div>
              <h4 className="font-semibold text-[var(--color-primary)] mb-2">
                {step.title}
              </h4>
              <p className="text-sm text-[var(--color-text-muted)]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
