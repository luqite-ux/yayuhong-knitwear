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

export interface VnCategoryCard {
  slug: string;
  name: Record<string, string>;
  cover: string;
  count: number;
}

interface ProductShowcaseProps {
  vnCategories?: VnCategoryCard[];
}

function pickName(name: Record<string, string> | undefined, locale: string): string {
  if (!name) return '';
  if (locale === 'vn') return name.vi || name.vn || name.en || name.zh || '';
  return name[locale] || name.en || name.zh || '';
}

export default function ProductShowcase({ vnCategories }: ProductShowcaseProps) {
  const t = useTranslations('products');
  const locale = useLocale();

  // 越南站：展示越南专属分类（封面用该分类下首款产品图，与内页一致）
  if (vnCategories && vnCategories.length > 0) {
    return (
      <section className="section-padding bg-[var(--color-warm-gray)] knit-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vnCategories.map((cat) => {
              const name = pickName(cat.name, locale);
              return (
                <Link
                  key={cat.slug}
                  href={`/products/category/${cat.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden card-hover block"
                >
                  <div className="aspect-[4/3] bg-[var(--color-warm-gray)] relative overflow-hidden">
                    <img
                      src={cat.cover}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-[var(--color-primary)] shadow-sm">
                      {cat.count} {zhOrEn(locale, '款', '款', 'SKUs')}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-[var(--color-primary)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                      {name}
                    </h3>
                    <p className="text-[var(--color-text-muted)] text-sm mb-4">
                      {zhOrEn(locale, '越南本土精选款式，轻薄透气适合热带气候', '越南本土精選款式，輕薄透氣適合熱帶氣候', 'Vietnam-sourced styles, lightweight and breathable for tropical weather')}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] group-hover:gap-2 transition-all">
                      {zhOrEn(locale, '查看详情', '查看詳情', 'Learn more')}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

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
