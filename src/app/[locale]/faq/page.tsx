import { sql } from '@/lib/db';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import FaqAccordion from '@/components/FaqAccordion';
import { getCurrentSiteKey } from '@/lib/site';

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

  const faqs = rows.map((r) => {
    const q = r.question as Record<string, string>;
    const a = r.answer as Record<string, string>;
    return {
      id: r.id,
      category: r.category,
      question: q[locale] || q.en || q.zh || '',
      answer: a[locale] || a.en || a.zh || '',
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
