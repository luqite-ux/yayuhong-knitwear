'use client';

import { useTranslations } from 'next-intl';

const icons = ['⚡', '🎨', '💰', '✅'];

export default function Advantages() {
  const t = useTranslations('advantages');
  const items = t.raw('items');

  return (
    <section className="section-padding bg-[var(--color-cream)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm font-medium mb-4">
            {t('title')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)] mb-4">
            {t('title')}
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
        
        {/* Advantage cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item: { title: string; desc: string }, index: number) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-7 card-hover border border-[var(--color-border)]/50"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center text-2xl mb-5">
                {icons[index]}
              </div>
              <h3 className="text-xl font-bold text-[var(--color-primary)] mb-3">
                {item.title}
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
