'use client';

import { useLocale, useTranslations } from 'next-intl';
import { zhText, localizeText } from '@/lib/zh-hant';
import { Link } from '@/i18n/navigation';
import { type ProductItem } from '@/components/ProductDetailModal';

interface ProductCategory {
  nameKey?: string;
  descKey?: string;
  countKey?: string;
  cover: string;
  items: ProductItem[];
  categoryName?: { zh?: string; en?: string; [key: string]: string | undefined };
  categoryDesc?: { zh?: string; en?: string; [key: string]: string | undefined };
  categorySlug?: string;
}

interface Props {
  categories: Record<string, ProductCategory>;
  categoryKeys: string[];
}

export default function ProductGrid({ categories, categoryKeys }: Props) {
  const t = useTranslations('products');
  const locale = useLocale();

  return (
    <section className="pb-20 bg-[var(--color-cream)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {categoryKeys.map((key, catIndex) => {
          const cat = categories[key];
          let name = '';
          let desc = '';
          if (cat.categoryName?.[locale]) {
            name = cat.categoryName[locale] || '';
          } else if (cat.categoryName?.en) {
            name = cat.categoryName.en;
          } else if (cat.nameKey) {
            name = t(cat.nameKey);
          }
          if (cat.categoryDesc?.[locale]) {
            desc = cat.categoryDesc[locale] || '';
          } else if (cat.categoryDesc?.en) {
            desc = cat.categoryDesc.en;
          } else if (cat.descKey) {
            desc = t(cat.descKey);
          }

          const catSlug = cat.categorySlug || `category-${catIndex}`;

          return (
            <div key={catIndex} id={catSlug} className="scroll-mt-24">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary)] mb-2">
                    {name}
                  </h2>
                  <p className="text-[var(--color-text-secondary)]">{desc}</p>
                </div>
                <div className="hidden sm:flex items-center gap-4">
                  {cat.categorySlug && (
                    <Link
                      href={`/products/category/${cat.categorySlug}`}
                      className="text-[var(--color-text-secondary)] text-sm hover:text-[var(--color-primary)] transition-colors"
                    >
                      {zhText(locale, '查看全部 →', 'View All →')}
                    </Link>
                  )}
                  <Link href="/contact" className="text-[var(--color-accent)] font-medium text-sm hover:underline">
                    {zhText(locale, '询价 →', 'Get Quote →')}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {cat.items.map((item, i) => {
                  const productName = localizeText(item.name, locale);
                  return (
                    <Link
                      key={i}
                      href={item.slug ? `/products/${item.slug}` : '#'}
                      className="bg-white rounded-xl overflow-hidden card-hover border border-[var(--color-border)]/50 block group"
                      aria-label={`${productName} - ${name}`}
                    >
                      <div className="aspect-square overflow-hidden bg-[var(--color-warm-gray)]">
                        <img
                          src={item.img}
                          alt={`${productName} - ${name} wholesale manufacturer`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-[var(--color-primary)] line-clamp-2 min-h-[2.5rem]">
                          {productName}
                        </h3>
                        <p className="text-xs text-[var(--color-accent)] mt-2 font-medium group-hover:translate-x-1 transition-transform">
                          {zhText(locale, '查看详情 →', 'View Details →')}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
