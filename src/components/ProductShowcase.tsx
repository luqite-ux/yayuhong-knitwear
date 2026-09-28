'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { zhOrEn } from '@/lib/locale-text';

const productImages = [
  '/images/products/womens-sweater-1.jpg',
  '/images/products/kids-sweater-1.jpg',
  '/images/products/mens-sweater-1.jpg',
  '/images/products/loungewear-1.jpg',
  '/images/products/pet-clothes-1.jpg',
  '/images/products/accessories-1.jpg',
];

export default function ProductShowcase() {
  const t = useTranslations('products');
  const locale = useLocale();
  const categories = t.raw('categories');

  return (
    <section className="section-padding bg-[var(--color-warm-gray)] knit-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-secondary)]/10 text-[var(--color-secondary-dark)] text-sm font-medium mb-4">
            {zhOrEn(locale, '产品系列', '產品系列', 'Product Range')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)] mb-4">
            {t('title')}
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
        
        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat: { name: string; desc: string; count: string }, index: number) => (
            <div
              key={index}
              className="group bg-white rounded-2xl overflow-hidden card-hover cursor-pointer"
            >
              {/* Image area */}
              <div className="aspect-[4/3] bg-[var(--color-warm-gray)] relative overflow-hidden">
                <img 
                  src={productImages[index]} 
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-[var(--color-primary)] shadow-sm">
                  {cat.count}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-[var(--color-primary)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[var(--color-text-muted)] text-sm mb-4">
                  {cat.desc}
                </p>
                <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:gap-2 transition-all">
                  {zhOrEn(locale, '查看详情', '查看詳情', 'Learn more')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/products" className="btn-outline">
            {t('viewAll')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
