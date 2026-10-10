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
  const tp = await getTranslations('process');
  const tg = await getTranslations('gaugeGuide');
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

  const processSteps = Array.from({ length: 7 }, (_, i) => ({
    num: tp(`steps.${i}.num`),
    title: tp(`steps.${i}.title`),
    desc: tp(`steps.${i}.desc`),
  }));

  const gaugeItems = Array.from({ length: 4 }, (_, i) => ({
    gauge: tg(`items.${i}.gauge`),
    name: tg(`items.${i}.name`),
    thickness: tg(`items.${i}.thickness`),
    usage: tg(`items.${i}.usage`),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="pt-28 pb-16 bg-[var(--color-cream)] knit-texture">
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
        </div>
      </section>

      {/* Production Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[var(--color-accent)] font-medium mb-3">{tp('badge')}</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)] mb-4">
              {tp('title')}
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              {tp('subtitle')}
            </p>
          </div>

          <div className="relative">
            {/* Desktop vertical line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-[var(--color-primary)]/10 -translate-x-1/2" />

            <div className="space-y-10 lg:space-y-0">
              {processSteps.map((step, index) => (
                <div
                  key={index}
                  className={`lg:grid lg:grid-cols-2 lg:gap-12 items-center ${
                    index % 2 === 0 ? '' : 'lg:[&>div:first-child]:order-2'
                  }`}
                >
                  {/* Content */}
                  <div className={`relative ${index % 2 === 0 ? 'lg:text-right lg:pr-12' : 'lg:pl-12'}`}>
                    <div className="bg-[var(--color-cream)] rounded-2xl p-6 sm:p-8 border border-[var(--color-primary)]/10 hover:shadow-lg hover:shadow-[var(--color-primary)]/5 transition-shadow">
                      <div className="text-5xl sm:text-6xl font-bold text-[var(--color-accent)]/20 mb-2">
                        {step.num}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-primary)] mb-3">
                        {step.title}
                      </h3>
                      <p className="text-[var(--color-text-secondary)] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Circle marker */}
                  <div className="hidden lg:flex justify-center items-center">
                    <div className="relative z-10 w-12 h-12 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-[var(--color-accent)]/30">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gauge Guide Section */}
      <section className="py-20 bg-[var(--color-cream)] knit-texture">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[var(--color-accent)] font-medium mb-3">{tg('badge')}</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)] mb-4">
              {tg('title')}
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              {tg('subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gaugeItems.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-[var(--color-primary)]/10 hover:shadow-xl hover:shadow-[var(--color-primary)]/5 transition-all hover:-translate-y-1"
              >
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-bold text-[var(--color-accent)]">
                    {item.gauge}
                  </span>
                  <span className="text-lg font-semibold text-[var(--color-primary)]">
                    {item.name}
                  </span>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm font-medium mb-4">
                  {item.thickness}
                </div>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  {item.usage}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[var(--color-cream)] knit-texture">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
