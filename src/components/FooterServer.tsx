import { getSiteProfile } from '@/lib/site-profile';
import { getCurrentSiteKey } from '@/lib/site';
import Footer from '@/components/Footer';
import type { SocialLinks } from '@/components/Footer';

interface FooterServerProps {
  locale: string;
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

/**
 * Footer 的服务器组件包装器
 * 仅在海外站查询 site_profile，国内站直接渲染 Footer（使用默认 props）
 */
export default async function FooterServer({ locale }: FooterServerProps) {
  const siteKey = await getCurrentSiteKey();

  // 国内站直接渲染 Footer，不传 props
  if (siteKey === 'china') {
    return <Footer />;
  }

  // 海外站：查询 site_profile
  let footerProps: {
    socialLinks?: SocialLinks;
    copyright?: string;
    icp?: string;
    companyFooter?: string;
    addressFooter?: string;
    whatsappNumber?: string;
  } = {};

  try {
    const siteProfile = await getSiteProfile();

    if (siteProfile) {
      // social_links 映射到 Footer 期望的结构
      const social = siteProfile.social_links;
      if (social && typeof social === 'object') {
        const socialLinks: SocialLinks = {
          twitter: social.twitter || undefined,
          instagram: social.instagram || undefined,
          linkedin: social.linkedin || undefined,
          whatsapp: social.whatsapp || undefined,
        };
        // 只有至少有一个有效值时才传入
        const hasAny = Object.values(socialLinks).some((v) => v && v !== '#');
        if (hasAny) {
          footerProps.socialLinks = socialLinks;
        }
      }

      // footer_config 中的字段
      const footerConfig = siteProfile.footer_config;
      if (footerConfig && typeof footerConfig === 'object') {
        if (footerConfig.copyright !== undefined) {
          const val = getLocalized(footerConfig.copyright, locale, '');
          if (val) footerProps.copyright = val;
        }
        if (footerConfig.icp !== undefined) {
          const val = getLocalized(footerConfig.icp, locale, '');
          if (val) footerProps.icp = val;
        }
        if (footerConfig.company_footer !== undefined) {
          const val = getLocalized(footerConfig.company_footer, locale, '');
          if (val) footerProps.companyFooter = val;
        }
        if (footerConfig.address_footer !== undefined) {
          const val = getLocalized(footerConfig.address_footer, locale, '');
          if (val) footerProps.addressFooter = val;
        }
      }

      // whatsapp number
      if (siteProfile.contact?.whatsapp) {
        const wa = String(siteProfile.contact.whatsapp).replace(/\D/g, '');
        if (wa) footerProps.whatsappNumber = wa;
      }
    }
  } catch (err) {
    console.error('FooterServer: failed to fetch site_profile, using fallbacks', err);
  }

  return <Footer {...footerProps} />;
}
