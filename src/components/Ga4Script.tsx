import { getGa4MeasurementId } from '@/lib/google';

/**
 * GA4 谷歌分析脚本注入组件（国际站）
 * 服务端组件，从 secrets 读取 Measurement ID 后注入 gtag 脚本
 */
export default async function Ga4Script() {
  const measurementId = await getGa4MeasurementId();
  if (!measurementId) return null;

  return (
    <>
      {/* Google tag (gtag.js) - Google Analytics */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');
          `.trim(),
        }}
      />
    </>
  );
}
