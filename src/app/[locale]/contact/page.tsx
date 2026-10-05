import { setRequestLocale, getTranslations } from 'next-intl/server';
import ContactForm from '@/components/ContactForm';
import FloatingContact from '@/components/FloatingContact';
import { zhText } from '@/lib/zh-hant';
import { Link } from '@/i18n/navigation';
import { getSiteProfile } from '@/lib/site-profile';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  
  return {
    title: t('title') + ' - Yayuhong Knitwear',
    description: t('subtitle'),
  };
}

/**
 * 从可能是多语言对象或纯字符串的值中获取当前语言的文本
 */
function getLocalized(val: unknown, locale: string, fallback: string): string {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, string>;
    if (locale === 'zh' && obj.zh) return obj.zh;
    if (locale === 'zh-TW' && obj.hant) return obj.hant;
    if (obj.en) return obj.en;
    if (obj.zh) return obj.zh;
  }
  return fallback;
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contact' });
  const info = await getTranslations({ locale, namespace: 'contact.info' });

  // 读取 site_profile，失败时用翻译文件兜底
  let siteProfile = null;
  try {
    siteProfile = await getSiteProfile();
  } catch (err) {
    console.error('ContactPage: failed to fetch site_profile, using fallbacks', err);
  }

  const contact = siteProfile?.contact || null;

  // 从 DB 读取或使用翻译兜底
  const email = contact?.email || info('email');
  const phone = contact?.phone || info('phone');
  const whatsapp = contact?.whatsapp || info('whatsapp');
  const address = getLocalized(contact?.address, locale, info('address'));
  const workTime = contact?.work_time
    ? getLocalized(contact.work_time, locale, info('workTime'))
    : info('workTime');

  // WhatsApp 号码（用于链接），优先从 contact.whatsapp 取纯数字部分
  const whatsappNumber = contact?.whatsapp ? String(contact.whatsapp).replace(/\D/g, '') : '8613829659110';
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

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

      {/* Contact content */}
      <section className="py-20 bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Left: Contact info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6">
                  {zhText(locale, '联系方式', 'Contact Information')}
                </h2>
              </div>
              
              {/* Factory */}
              <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)]/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-xl">
                    🏭
                  </div>
                  <h3 className="font-semibold text-[var(--color-primary)]">
                    {info('factoryName')}
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-[var(--color-accent)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[var(--color-text-secondary)]">{address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-[var(--color-text-secondary)]">{phone}</span>
                  </div>
                </div>
              </div>
              
              {/* Company */}
              <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)]/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-secondary)]/10 flex items-center justify-center text-xl">
                    🏢
                  </div>
                  <h3 className="font-semibold text-[var(--color-primary)]">
                    {info('companyName')}
                  </h3>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {zhText(
                    locale,
                    '深圳分公司，负责国内及海外市场业务对接',
                    '深圳分公司，負責國內及海外市場業務對接',
                    'Shenzhen branch - responsible for domestic and overseas business development',
                  )}
                </p>
              </div>
              
              {/* Quick contact */}
              <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-dark)] rounded-2xl p-6 text-white">
                <h3 className="font-semibold text-lg mb-4">
                  {zhText(locale, '快速联系', 'Quick Contact')}
                </h3>
                <div className="space-y-4">
                  <a href={`mailto:${email}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-white/60">{zhText(locale, '邮箱', 'Email')}</div>
                      <div className="font-medium">{email}</div>
                    </div>
                  </a>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.328.328 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-white/60">{zhText(locale, '微信', 'WeChat')}</div>
                      <div className="font-medium">{info('wechat')}</div>
                    </div>
                  </div>
                  
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-white/60">WhatsApp</div>
                      <div className="font-medium">{whatsapp}</div>
                    </div>
                  </a>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {workTime}
                  </div>
                </div>
              </div>

              {/* QR Codes */}
              <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)]/50">
                <h3 className="font-semibold text-[var(--color-primary)] mb-4">
                  {zhText(locale, '扫码联系', 'Scan to Connect')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* WeChat QR */}
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-2 text-center font-medium">
                      {zhText(locale, '微信', 'WeChat')}
                    </p>
                    <div className="aspect-square bg-white rounded-lg border border-[var(--color-border)]/50 p-2">
                      <img
                        src="/images/wechat-qr.jpg"
                        alt="WeChat QR Code"
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                    <p className="text-xs text-center mt-2 text-[var(--color-text-muted)]">
                      {info('wechat')}
                    </p>
                    {locale !== 'zh' && (
                      <Link
                        href="/wechat-guide"
                        className="flex items-center justify-center gap-1 mt-2 text-xs text-[#07C160] hover:opacity-70 transition-opacity"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.657-1.79 3-4 3-.083 0-.165-.003-.246-.009C9.689 13.063 8 14.362 8 16" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12" />
                        </svg>
                        {locale === 'zh-TW' ? '如何使用微信？' : 'How to use WeChat?'}
                      </Link>
                    )}
                  </div>
                  {/* WhatsApp QR */}
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <p className="text-xs text-green-600 mb-2 text-center font-medium">
                      WhatsApp
                    </p>
                    <div className="aspect-square bg-white rounded-lg border-2 border-green-500/30 p-2 group-hover:border-green-500 transition-colors">
                      <img
                        src="/images/whatsapp-qr.png"
                        alt="WhatsApp QR Code"
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                    <p className="text-xs text-center mt-2 text-green-600 font-medium">
                      {whatsapp}
                    </p>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Right: Contact form */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6">
                {zhText(locale, '发送询盘', 'Send Inquiry')}
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="h-64 bg-[var(--color-warm-gray)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">📍</div>
          <p className="text-[var(--color-text-muted)]">
            {zhText(locale, '地图位置（待嵌入）', 'Map location (to be embedded)')}
          </p>
        </div>
      </section>

      <FloatingContact whatsappNumber={whatsappNumber} />
    </>
  );
}
