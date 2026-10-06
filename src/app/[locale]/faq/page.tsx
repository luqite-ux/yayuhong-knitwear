import { sql, deepParseJson } from '@/lib/db';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import FaqAccordion from '@/components/FaqAccordion';
import { getCurrentSiteKey } from '@/lib/site';
import { localizeText, toTraditional } from '@/lib/zh-hant';

export const dynamic = 'force-dynamic';

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('faq');
  const siteKey = await getCurrentSiteKey();

  const rows = await sql`
    select id, category, question, answer
    from content_faqs
    where is_active = true
      and sites && array['global', ${siteKey}]::text[]
    order by sort, created_at desc
  `;

  const faqRows = deepParseJson(rows) as Array<{
    id: string;
    category: string | null;
    question: Record<string, string>;
    answer: Record<string, string>;
  }>;

  // FAQ 分类名翻译映射
  const categoryLabels: Record<string, { zh: string; en: string }> = {
    order: { zh: '订单与起订量', en: 'Order & MOQ' },
    sampling: { zh: '打样与交期', en: 'Sampling & Lead Time' },
    quality: { zh: '产品与质量', en: 'Products & Quality' },
    payment: { zh: '付款与物流', en: 'Payment & Shipping' },
    service: { zh: '合作与服务', en: 'Cooperation & Service' },
    general: { zh: '常见问题', en: 'General' },
  };

  const getCategoryLabel = (cat: string | null): string => {
    if (!cat) return locale === 'en' ? 'General' : '常见问题';
    const label = categoryLabels[cat];
    if (label) {
      const text = locale === 'en' ? label.en : label.zh;
      return locale === 'zh-TW' ? toTraditional(text) : text;
    }
    return locale === 'zh-TW' ? toTraditional(cat) : cat;
  };

  const faqs = faqRows.map((row) => {
    return {
      id: row.id,
      category: getCategoryLabel(row.category),
      question: localizeText(row.question, locale),
      answer: localizeText(row.answer, locale),
    };
  }).filter(f => f.question && f.answer);

  // FAQPage JSON-LD
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="pt-28 pb-20 bg-[var(--color-cream)] knit-texture">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[var(--color-accent)] font-medium mb-3">{t('subtitle')}</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-primary)] mb-4">
              {t('title')}
            </h1>
            <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>

          {faqs.length === 0 ? (
            <div className="text-center py-20 text-[var(--color-text-muted)]">
              {t('empty')}
            </div>
          ) : (
            <FaqAccordion faqs={faqs} />
          )}
        </div>
      </section>
    </>
  );
}
