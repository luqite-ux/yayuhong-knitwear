'use client';

import { useTranslations, useLocale } from 'next-intl';

export default function ChenghaiHeritage() {
  const t = useTranslations('heritage');
  const locale = useLocale();
  const timeline = t.raw('timeline');
  const stats = t.raw('stats');

  return (
    <section className="section-padding bg-gradient-to-b from-white to-[var(--color-cream)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
            {t('badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)] mb-4">
            {t('title')}
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300 transform md:-translate-x-1/2" />

          <div className="space-y-12">
            {timeline.map((item: { era: string; title: string; desc: string }, index: number) => (
              <div
                key={index}
                className={`relative flex items-start ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-amber-500 rounded-full border-4 border-white shadow-lg transform -translate-x-1/2 mt-1.5 z-10" />

                {/* Content card */}
                <div
                  className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${
                    index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'
                  }`}
                >
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-[var(--color-border)]/30 hover:shadow-xl transition-shadow">
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-sm font-semibold mb-3">
                      {item.era}
                    </span>
                    <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat: { value: string; label: string }, index: number) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 text-center shadow-md border border-[var(--color-border)]/30"
            >
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Closing quote */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-white rounded-2xl p-8 shadow-lg border border-amber-100 max-w-2xl">
            <svg className="w-10 h-10 text-amber-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-[var(--color-primary)] text-lg italic leading-relaxed">
              {t('quote')}
            </p>
            <p className="text-[var(--color-text-muted)] mt-4 text-sm">
              — {t('quoteSource')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
