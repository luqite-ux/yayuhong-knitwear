'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState } from 'react';

const catalogImages = [
  { src: '/images/ready-stock/catalog-1.jpg', styles: '63032-63039', label: 'Set A' },
  { src: '/images/ready-stock/catalog-2.jpg', styles: '63015-63022', label: 'Set B' },
  { src: '/images/ready-stock/catalog-3.jpg', styles: '63023-63031', label: 'Set C' },
  { src: '/images/ready-stock/catalog-4.jpg', styles: '63015-63022', label: 'Set D' },
  { src: '/images/ready-stock/catalog-5.jpg', styles: '63032-63039', label: 'Set E' },
];

export default function ReadyStock() {
  const t = useTranslations('readyStock');
  const locale = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="section-padding bg-gradient-to-b from-[var(--color-warm-gray)] to-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[var(--color-accent)]/5 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[var(--color-secondary)]/5 blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse"></span>
            {t('badge')}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-primary)] mb-4">
            {t('title')}
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Key selling points */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { icon: '📦', title: t('points.stock'), desc: t('points.stockDesc') },
            { icon: '⚡', title: t('points.shipping'), desc: t('points.shippingDesc') },
            { icon: '🔀', title: t('points.mix'), desc: t('points.mixDesc') },
            { icon: '💰', title: t('points.moq'), desc: t('points.moqDesc') },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--color-warm-gray)]/50 text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-bold text-[var(--color-primary)] text-sm mb-1">{item.title}</div>
              <div className="text-xs text-[var(--color-text-muted)]">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Main gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Large preview */}
          <div className="lg:col-span-8">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-[var(--color-warm-gray)]">
              <img
                src={catalogImages[activeIndex].src}
                alt={`Ready stock catalog ${catalogImages[activeIndex].label}`}
                className="w-full h-auto object-contain"
              />
              <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-bold shadow-lg">
                {t('inStock')}
              </div>
              <div className="absolute bottom-4 right-4 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm text-[var(--color-primary)] text-sm font-medium shadow-lg">
                {locale === 'zh' ? `款号 ${catalogImages[activeIndex].styles}` : `Styles ${catalogImages[activeIndex].styles}`}
              </div>
            </div>
          </div>

          {/* Thumbnails + info */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Thumbnails */}
            <div className="grid grid-cols-5 lg:grid-cols-2 gap-3">
              {catalogImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                    activeIndex === i
                      ? 'border-[var(--color-accent)] shadow-md'
                      : 'border-transparent hover:border-[var(--color-warm-gray)]'
                  }`}
                >
                  <img
                    src={img.src}
                    alt={`Catalog ${img.label}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Product info card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-warm-gray)]/50">
              <h3 className="font-bold text-[var(--color-primary)] text-lg mb-3">
                {t('collectionTitle')}
              </h3>
              <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">{t('info.styles')}</span>
                  <span className="font-medium text-[var(--color-primary)]">25+ {t('info.stylesUnit')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">{t('info.sizes')}</span>
                  <span className="font-medium text-[var(--color-primary)]">M / L / XL / XXL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">{t('info.colors')}</span>
                  <span className="font-medium text-[var(--color-primary)]">10+ {t('info.colorsUnit')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">{t('info.category')}</span>
                  <span className="font-medium text-[var(--color-primary)]">{t('info.categoryValue')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">{t('info.shipping')}</span>
                  <span className="font-medium text-[var(--color-accent)]">3 {t('info.shippingUnit')}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link href="/contact" className="btn-primary text-center block">
              {t('cta')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
