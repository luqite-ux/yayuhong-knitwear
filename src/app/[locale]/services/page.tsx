import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import FloatingContact from '@/components/FloatingContact';
import ProcessTimeline from '@/components/ProcessTimeline';
import { zhText } from '@/lib/zh-hant';

const servicesData = [
  {
    icon: '🎨',
    key: 'items.0',
    color: 'from-[var(--color-primary)] to-[var(--color-primary-light)]',
    highlights: [
      { zh: '每月100+新款设计', en: '100+ new designs monthly' },
      { zh: '专业设计团队', en: 'Professional design team' },
      { zh: '趋势预测分析', en: 'Trend forecasting & analysis' },
      { zh: '独家款式授权', en: 'Exclusive style licensing' },
    ],
  },
  {
    icon: '🏷️',
    key: 'items.1',
    color: 'from-[var(--color-accent)] to-[var(--color-accent-light)]',
    highlights: [
      { zh: '来图来样定制', en: 'Design/sample-based customization' },
      { zh: '品牌贴牌服务', en: 'Private label service' },
      { zh: '定制包装吊牌', en: 'Custom packaging & hangtags' },
      { zh: '严格保密协议', en: 'Strict confidentiality agreement' },
    ],
  },
  {
    icon: '⚡',
    key: 'items.2',
    color: 'from-[var(--color-secondary)] to-[var(--color-secondary-light)]',
    highlights: [
      { zh: '50件即可起订', en: 'MOQ starting at 50 pcs' },
      { zh: '7天快速交货', en: '7-day fast delivery' },
      { zh: '灵活补单机制', en: 'Flexible reorder system' },
      { zh: '适合电商直播', en: 'Perfect for e-commerce & livestream' },
    ],
  },
  {
    icon: '📦',
    key: 'items.3',
    color: 'from-[var(--color-yarn-forest)] to-[#3d5e50]',
    highlights: [
      { zh: '日产30,000件产能', en: '30,000 pcs daily capacity' },
      { zh: '稳定的交期保障', en: 'Reliable delivery schedule' },
      { zh: '大货质量稳定', en: 'Consistent bulk quality' },
      { zh: '支持第三方验货', en: 'Third-party inspection support' },
    ],
  },
];

const faqData = [
  {
    qZh: '最小起订量是多少？',
    qEn: 'What is the minimum order quantity (MOQ)?',
    aZh: '我们的起订量非常灵活，常规款式50件即可起订，特殊款式或复杂工艺可能需要适当提高起订量。对于新客户，我们鼓励小单试款，降低您的试错成本。',
    aEn: 'Our MOQ is very flexible. Regular styles start from 50 pieces. Special styles or complex craftsmanship may require a slightly higher MOQ. For new customers, we encourage small trial orders to reduce your risk.',
  },
  {
    qZh: '打样需要多长时间？费用多少？',
    qEn: 'How long does sampling take and how much does it cost?',
    aZh: '常规款式打样3-5天，复杂款式5-7天。打样费根据款式复杂度收取，通常在100-300元/件之间。下单大货后，达到一定数量可退还打样费。',
    aEn: 'Regular styles take 3-5 days for sampling, complex styles take 5-7 days. Sampling fees depend on complexity, usually $15-$50 per piece. After placing a bulk order that meets a certain quantity, the sampling fee can be refunded.',
  },
  {
    qZh: '大货生产周期是多久？',
    qEn: 'What is the bulk production lead time?',
    aZh: '小批量订单（50-500件）通常7-10天，中等批量（500-2000件）10-15天，大批量订单（2000件以上）15-25天。具体交期根据款式复杂度和订单数量确定。',
    aEn: 'Small batch orders (50-500 pcs) usually take 7-10 days, medium batches (500-2000 pcs) take 10-15 days, and large volume orders (2000+ pcs) take 15-25 days. Exact lead time depends on style complexity and order quantity.',
  },
  {
    qZh: '可以提供什么付款方式？',
    qEn: 'What payment terms do you offer?',
    aZh: '常规付款方式：30%定金 + 70%发货前付清。支持对公转账、支付宝、微信、PayPal、西联汇款、T/T等多种支付方式。长期合作客户可协商更灵活的付款条件。',
    aEn: 'Standard payment terms: 30% deposit + 70% before shipment. We accept bank transfer, PayPal, Western Union, T/T, and more. Flexible payment terms can be negotiated for long-term partners.',
  },
  {
    qZh: '你们能出口到哪些国家？',
    qEn: 'Which countries can you export to?',
    aZh: '我们可以出口到全球大多数国家和地区，包括美国、加拿大、欧盟各国、英国、澳大利亚、东南亚、中东等。我们有丰富的外贸经验，可以协助处理报关、物流等事宜。',
    aEn: 'We can export to most countries and regions worldwide, including the US, Canada, EU countries, UK, Australia, Southeast Asia, the Middle East, and more. We have extensive foreign trade experience and can assist with customs clearance and logistics.',
  },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'services' });
  
  return {
    title: t('title') + ' - Yayuhong Knitwear',
    description: t('subtitle'),
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'services' });

  return (
    <>
      {/* Page Header */}
      <section className="hero-gradient pt-32 pb-20 knit-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {t('title')}
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#faf8f5"/>
          </svg>
        </div>
      </section>

      {/* Services detail */}
      <section className="py-20 bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {servicesData.map((service, index) => {
            const title = t(`${service.key}.title`);
            const desc = t(`${service.key}.desc`);
            const isReverse = index % 2 === 1;
            
            return (
              <div
                key={index}
                className={`grid lg:grid-cols-2 gap-12 items-center ${isReverse ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={`${isReverse ? 'lg:order-2' : ''}`}>
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-4xl mb-6 shadow-lg`}
                  >
                    {service.icon}
                  </div>
                  <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-4">
                    {title}
                  </h2>
                  <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">
                    {desc}
                  </p>
                  <div className="space-y-3">
                    {service.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-[var(--color-text-secondary)]">
                          {zhText(locale, h.zh, h.en)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8">
                    <Link href="/contact" className="btn-outline">
                      {zhText(locale, '了解详情', 'Learn More')}
                    </Link>
                  </div>
                </div>
                <div className={`${isReverse ? 'lg:order-1' : ''}`}>
                  <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-white to-[var(--color-warm-gray)] border border-[var(--color-border)] flex items-center justify-center text-8xl">
                    {service.icon}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProcessTimeline />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[var(--color-warm-gray)] knit-texture">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-4">
              {zhText(locale, '常见问题', 'FAQ')}
            </h2>
            <p className="text-[var(--color-text-secondary)]">
              {zhText(locale, '以下是客户最常问的问题，希望能解答您的疑惑', 'Here are the most frequently asked questions')}
            </p>
          </div>
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-[var(--color-border)]/50">
                <h3 className="font-semibold text-[var(--color-primary)] mb-3 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center text-sm flex-shrink-0">
                    Q
                  </span>
                  {zhText(locale, faq.qZh, faq.qEn)}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed pl-9">
                  {zhText(locale, faq.aZh, faq.aEn)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-dark)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {zhText(locale, '还有其他问题？', 'Have more questions?')}
          </h2>
          <p className="text-white/70 text-lg mb-8">
            {zhText(
              locale,
              '随时联系我们，专业团队为您一对一解答',
              'Contact us anytime for personalized answers from our expert team',
            )}
          </p>
          <Link href="/contact" className="btn-primary !bg-white !text-[var(--color-primary)]">
            {zhText(locale, '立即咨询', 'Contact Us')}
          </Link>
        </div>
      </section>

      <FloatingContact />
    </>
  );
}
