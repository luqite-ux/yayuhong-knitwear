import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getCurrentSiteKey } from '@/lib/site';
import { Link } from '@/i18n/navigation';
import { zhText } from '@/lib/zh-hant';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const siteKey = await getCurrentSiteKey();

  if (siteKey === 'china') {
    return {
      title: '如何使用微信 - 亚裕鸿毛织厂',
      description: '微信安装使用指南',
    };
  }

  const titles: Record<string, string> = {
    en: 'How to Use WeChat - Yayuhong Knitwear',
    zh: '如何使用微信 - 亚裕鸿毛织厂',
    'zh-TW': '如何使用微信 - 亞裕鴻毛織廠',
    ru: 'Как использовать WeChat - Yayuhong Knitwear',
    ar: 'كيفية استخدام WeChat - Yayuhong Knitwear',
    de: 'So verwenden Sie WeChat - Yayuhong Knitwear',
    es: 'Cómo usar WeChat - Yayuhong Knitwear',
    fr: 'Comment utiliser WeChat - Yayuhong Knitwear',
    ja: 'WeChatの使い方 - Yayuhong Knitwear',
    pt: 'Como usar o WeChat - Yayuhong Knitwear',
  };

  return {
    title: titles[locale] || titles.en,
    description: zhText(
      locale,
      '微信安装使用指南 - 下载微信、注册账号、扫描二维码添加联系人',
      'WeChat guide - Download, register, and scan QR code to connect with us',
    ),
  };
}

export default async function WeChatGuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'wechatGuide' });

  const steps = [
    { num: 1, key: 'step1' },
    { num: 2, key: 'step2' },
    { num: 3, key: 'step3' },
    { num: 4, key: 'step4' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#07C160] mb-6">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.85-2.397-1.364-3.948-1.364-5.61 0-3.477 3.056-6.296 6.83-6.296.314 0 .62.023.923.05C15.068 3.706 12.183 2.188 8.691 2.188zM6.785 5.526a1.121 1.121 0 1 1 0 2.242 1.121 1.121 0 0 1 0-2.242zm3.81 0a1.121 1.121 0 1 1 0 2.242 1.121 1.121 0 0 1 0-2.242zm3.715 3.95c-3.244 0-5.876 2.453-5.876 5.481 0 1.608.751 3.04 1.946 4.04a.489.489 0 0 1 .176.55l-.335 1.258a.21.21 0 0 0-.033.114c0 .13.104.234.234.234a.232.232 0 0 0 .117-.034l1.57-.924a.708.708 0 0 1 .589-.075 6.74 6.74 0 0 0 2.886.648c.221 0 .437-.018.653-.04-.683-1.993-.867-2.85-.867-4.193 0-2.892 2.554-5.24 5.71-5.24.035 0 .07.005.105.006-.55-2.09-2.595-3.834-5.069-4.063a7.35 7.35 0 0 0-.24-.017zm-2.453 2.728a.94.94 0 1 1 0 1.88.94.94 0 0 1 0-1.88zm4.906 0a.94.94 0 1 1 0 1.88.94.94 0 0 1 0-1.88z"/>
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            {t('title')}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* QR Code Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {t('qrTitle')}
          </h2>
          <div className="inline-block w-48 h-48 bg-slate-50 rounded-xl p-3 mb-4">
            <img
              src="/images/wechat-qr.jpg"
              alt="WeChat QR Code"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <p className="text-sm text-slate-500">
            {t('qrDesc')}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-8">
          {steps.map((step) => (
            <div key={step.num} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#07C160] text-white font-bold text-lg flex items-center justify-center">
                  {step.num}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {t(`${step.key}.title`)}
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-3">
                    {t(`${step.key}.desc`)}
                  </p>
                  {step.num === 1 && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      <a
                        href="https://apps.apple.com/app/wechat/id414478124"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.99 9.05 7.24c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.54.12 2.7.71 3.48 1.76-3.18 1.91-2.55 6.34.48 7.43-.61 1.59-.98 1.59-2.61 1.89zM12.03 7.25c-.18-2.3 1.74-4.18 3.87-4.37.32 2.48-2.13 4.62-3.87 4.37z"/>
                        </svg>
                        App Store
                      </a>
                      <a
                        href="https://play.google.com/store/apps/details?id=com.tencent.mm"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a.994.994 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.686-3.687l2.399 1.389c.787.456.787 1.716 0 2.172l-2.399 1.389L15.396 12l2.789-2.789zM5.864 2.658l10.937 6.333-2.302 2.302L5.864 2.658z"/>
                        </svg>
                        Google Play
                      </a>
                    </div>
                  )}
                  {step.num === 2 && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-[#07C160]"></span>
                        {t('step2.tip1')}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-[#07C160]"></span>
                        {t('step2.tip2')}
                      </div>
                    </div>
                  )}
                  {step.num === 4 && (
                    <div className="mt-4 p-4 bg-[#07C160]/5 border border-[#07C160]/20 rounded-lg">
                      <p className="text-sm text-slate-700">
                        {t('step4.tip')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp Alternative */}
        <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] rounded-2xl p-8 text-center mb-8">
          <h3 className="text-xl font-bold text-white mb-2">
            {t('whatsappTitle')}
          </h3>
          <p className="text-white/90 mb-4">
            {t('whatsappDesc')}
          </p>
          <a
            href="https://wa.me/8613829659110"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#128C7E] rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t('whatsappBtn')}
          </a>
        </div>

        {/* Contact CTA */}
        <div className="text-center">
          <p className="text-slate-600 mb-4">
            {t('contactPrompt')}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            {t('contactBtn')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
