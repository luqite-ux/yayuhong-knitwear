import { getSiteProfile } from '@/lib/site-profile';
import FloatingContact from '@/components/FloatingContact';

/**
 * FloatingContact 的服务器组件包装器
 * 从 site_profile 读取 whatsapp 号码并传递给客户端组件
 * 失败时优雅降级，渲染默认 FloatingContact
 */
export default async function FloatingContactServer() {
  try {
    const siteProfile = await getSiteProfile();

    if (siteProfile?.contact?.whatsapp) {
      const whatsappNumber = String(siteProfile.contact.whatsapp).replace(/\D/g, '');
      if (whatsappNumber) {
        return <FloatingContact whatsappNumber={whatsappNumber} />;
      }
    }
  } catch (err) {
    console.error('FloatingContactServer: failed to fetch site_profile, using fallback', err);
  }

  return <FloatingContact />;
}
