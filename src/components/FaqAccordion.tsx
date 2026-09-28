'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { zhOrEn } from '@/lib/locale-text';

interface FaqItem {
  id: string;
  category: string | null;
  question: string;
  answer: string;
}

export default function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const locale = useLocale();

  // 按分类分组
  const groups = faqs.reduce((acc: Record<string, FaqItem[]>, f) => {
    const cat = f.category || zhOrEn(locale, '常见问题', '常見問題', 'FAQ');
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([cat, items]) => (
        <div key={cat}>
          <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6">{cat}</h2>
          <div className="space-y-3">
            {items.map((faq) => (
              <div key={faq.id} className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
                <button
                  className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-[var(--color-warm-gray)]/30 transition-colors"
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                >
                  <span className="font-semibold text-[var(--color-text-primary)]">{faq.question}</span>
                  <span className={`text-[var(--color-secondary)] text-xl transition-transform flex-shrink-0 ${
                    openId === faq.id ? 'rotate-45' : ''
                  }`}>
                    +
                  </span>
                </button>
                {openId === faq.id && (
                  <div className="px-5 pb-5 text-[var(--color-text-secondary)] leading-relaxed">
                    {faq.answer.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-3' : ''}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
