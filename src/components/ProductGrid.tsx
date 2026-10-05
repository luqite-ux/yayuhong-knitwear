'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { zhText } from '@/lib/zh-hant';
import { Link } from '@/i18n/navigation';
import ProductDetailModal, { type ProductItem } from '@/components/ProductDetailModal';
import { sizeCharts } from '@/data/size-charts';

interface ProductCategory {
  nameKey?: string;
  descKey?: string;
  countKey?: string;
  cover: string;
  items: ProductItem[];
  categoryName?: { zh?: string; en?: string; [key: string]: string | undefined };
  categoryDesc?: { zh?: string; en?: string; [key: string]: string | undefined };
}

interface Props {
  categories: Record<string, ProductCategory>;
  categoryKeys: string[];
}

export default function ProductGrid({ categories, categoryKeys }: Props) {
  const t = useTranslations('products');
  const locale = useLocale();
  const [selectedProduct, setSelectedProduct] = useState<{
    item: ProductItem;
    category: string;
  } | null>(null);

  const openProduct = (item: ProductItem, category: string) => {
    setSelectedProduct({ item, category });
  };

  const closeProduct = () => {
    setSelectedProduct(null);
  };

  const currentSizeChart = selectedProduct
    ? sizeCharts[selectedProduct.category]
    : null;

  const getCategoryName = (key: string): string => {
    const cat = categories[key];
    if (!cat) return '';
    if (cat.categoryName?.[locale]) return cat.categoryName[locale] || '';
    if (cat.categoryName?.en) return cat.categoryName.en;
    if (cat.nameKey) return t(cat.nameKey);
    return '';
  };

  return (
    <>
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

            return (
              <div key={catIndex} id={`category-${catIndex}`}>
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary)] mb-2">
                      {name}
                    </h2>
                    <p className="text-[var(--color-text-secondary)]">{desc}</p>
                  </div>
                  <Link href="/contact" className="hidden sm:inline-flex text-[var(--color-accent)] font-medium text-sm hover:underline">
                    {zhText(locale, '询价 →', 'Get Quote →')}
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {cat.items.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl overflow-hidden card-hover border border-[var(--color-border)]/50 cursor-pointer group"
                      onClick={() => openProduct(item, key)}
                    >
                      <div className="aspect-square overflow-hidden bg-[var(--color-warm-gray)]">
                        <img
                          src={item.img}
                          alt={`${name} - ${zhText(locale, item.name.zh, item.name.en)}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-[var(--color-primary)] truncate">
                          {zhText(locale, item.name.zh, item.name.en)}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          {zhText(locale, '点击查看详情', 'Click for details')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selectedProduct && currentSizeChart && (
        <ProductDetailModal
          product={selectedProduct.item}
          categoryName={getCategoryName(selectedProduct.category)}
          sizeChart={currentSizeChart.rows}
          sizeLabels={currentSizeChart.labels}
          sizeTitle={currentSizeChart.title}
          onClose={closeProduct}
        />
      )}
    </>
  );
}
