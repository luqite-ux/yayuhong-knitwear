'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { zhText } from '@/lib/zh-hant';
import { Link } from '@/i18n/navigation';

export interface ProductItem {
  img: string;
  name: Record<string, string>;
  slug?: string;
  material?: Record<string, string>;
}

interface Props {
  product: ProductItem | null;
  categoryName: string;
  sizeChart: SizeRow[];
  sizeLabels: string[];
  sizeTitle: { en: string; zh: string };
  onClose: () => void;
}

export interface SizeRow {
  label: { en: string; zh: string };
  values: string[];
}

export default function ProductDetailModal({
  product,
  categoryName,
  sizeChart,
  sizeLabels,
  sizeTitle,
  onClose,
}: Props) {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setIsOpen(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsOpen(false);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!product) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
          {/* Left: Product image */}
          <div className="md:w-1/2 flex-shrink-0 bg-[var(--color-warm-gray)] flex items-center justify-center p-6">
            <img
              src={product.img.replace('UL640', 'UL1500')}
              alt={zhText(locale, product.name.zh, product.name.en)}
              className="max-w-full max-h-[60vh] md:max-h-[80vh] object-contain rounded-lg"
            />
          </div>

          {/* Right: Product info */}
          <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto">
            <p className="text-sm text-[var(--color-text-muted)] mb-2">{categoryName}</p>
            <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-6">
              {zhText(locale, product.name.zh, product.name.en)}
            </h3>

            {/* Size chart */}
            <div className="mb-6">
              <h4 className="font-semibold text-[var(--color-primary)] mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                {zhText(locale, sizeTitle.zh, sizeTitle.en)}
              </h4>
              <div className="overflow-x-auto border border-[var(--color-border)] rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-warm-gray)]">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-[var(--color-primary)] whitespace-nowrap">
                        {zhText(locale, '部位', 'Measurement')}
                      </th>
                      {sizeLabels.map((s, i) => (
                        <th key={i} className="px-3 py-2 text-center font-medium text-[var(--color-primary)]">
                          {s}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChart.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[var(--color-cream)]/30'}>
                        <td className="px-3 py-2 text-[var(--color-text-secondary)] whitespace-nowrap">
                          {zhText(locale, row.label.zh, row.label.en)}
                        </td>
                        {row.values.map((v, j) => (
                          <td key={j} className="px-3 py-2 text-center text-[var(--color-text-primary)]">
                            {v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                {zhText(
                  locale,
                  '* 以上为参考尺码，单位：厘米。支持定制尺寸。',
                  '* Reference sizes in cm. Custom sizing available.',
                )}
              </p>
            </div>

            {/* Material */}
            <div className="mb-6">
              <h4 className="font-semibold text-[var(--color-primary)] mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                {zhText(locale, '原料成分', 'Material')}
              </h4>
              {product.material ? (
                <p className="text-[var(--color-text-secondary)]">
                  {zhText(locale, product.material.zh, product.material.en)}
                </p>
              ) : (
                <p className="text-[var(--color-text-muted)] italic">
                  {zhText(
                    locale,
                    '可定制 · 支持棉、羊毛、腈纶、混纺等多种原料',
                    'Customizable · Cotton, wool, acrylic, blends and more',
                  )}
                </p>
              )}
            </div>

            {/* Features */}
            <div className="mb-6 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {zhText(locale, '支持定制', 'Customizable')}
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {zhText(locale, '50件起订', 'MOQ 50 pcs')}
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {zhText(locale, '7天交货', '7-Day Delivery')}
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {zhText(locale, '来图来样', 'OEM / ODM')}
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <Link
                href="/contact"
                className="btn-primary flex-1 text-center"
                onClick={onClose}
              >
                {zhText(locale, '获取报价', 'Get Quote')}
              </Link>
              <a
                href="https://wa.me/8613829659110"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
