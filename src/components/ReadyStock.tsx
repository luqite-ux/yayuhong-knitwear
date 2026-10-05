'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { zhOrEn } from '@/lib/locale-text';

interface ReadyStockProductItem {
  code: string;
  image_url: string;
  label: { zh: string; hant: string; en: string };
}

interface ReadyStockProps {
  products?: ReadyStockProductItem[];
}

const defaultProducts = [
  { src: '/images/ready-stock/style-01.jpg', code: '63032', label: { zh: '焦糖套装', hant: '焦糖套裝', en: 'Caramel Set' } },
  { src: '/images/ready-stock/style-02.jpg', code: '63033', label: { zh: '奶白套装', hant: '奶白套裝', en: 'Cream Set' } },
  { src: '/images/ready-stock/style-03.jpg', code: '63034', label: { zh: '蓝色套装', hant: '藍色套裝', en: 'Blue Set' } },
  { src: '/images/ready-stock/style-04.jpg', code: '63035', label: { zh: '粉色套装', hant: '粉色套裝', en: 'Pink Set' } },
  { src: '/images/ready-stock/style-05.jpg', code: '63036', label: { zh: '薄荷套装', hant: '薄荷套裝', en: 'Mint Set' } },
  { src: '/images/ready-stock/style-06.jpg', code: '63037', label: { zh: '白粉套装', hant: '白粉套裝', en: 'White/Pink Set' } },
];

export default function ReadyStock({ products }: ReadyStockProps) {
  const t = useTranslations('readyStock');
  const locale = useLocale();

  const hasExternalProducts = products && products.length > 0;
  const displayProducts = hasExternalProducts
    ? products.map((p) => ({
        src: p.image_url,
        code: p.code,
        label: p.label,
      }))
    : defaultProducts;

  return (
    <section className="section-padding bg-gradient-to-b from-[var(--color-warm-gray)] to-white knit-texture relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[var(--color-accent)]/5 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[var(--color-secondary)]/5 blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse"></span>
            {t('badge')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)] mb-4">
            {t('title')}
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Key selling points */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
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

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.map((product, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl overflow-hidden card-hover cursor-pointer"
            >
              {/* Image area */}
              <div className="aspect-[4/3] bg-[var(--color-warm-gray)] relative overflow-hidden">
                <img
                  src={product.src}
                  alt={zhOrEn(locale, product.label.zh, product.label.hant, product.label.en)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-[var(--color-primary)] shadow-sm">
                  {zhOrEn(locale, `款号 ${product.code}`, `款號 ${product.code}`, `Style ${product.code}`)}
                </div>
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[var(--color-accent)] text-white text-xs font-bold shadow-sm">
                  {t('inStock')}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-[var(--color-primary)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                  {zhOrEn(locale, product.label.zh, product.label.hant, product.label.en)}
                </h3>
                <p className="text-[var(--color-text-muted)] text-sm mb-4">
                  {t('collectionTitle')}
                </p>
                <div className="flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:gap-2 transition-all">
                  {zhOrEn(locale, '查看详情', '查看詳情', 'Learn more')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/contact" className="btn-outline">
            {t('cta')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
