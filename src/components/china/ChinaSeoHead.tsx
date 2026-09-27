import { getChinaSeoConfig, getChinaSeoMetas, getOrganizationSchema, getLocalBusinessSchema, getBaiduBaikeStyleData } from '@/lib/china-seo';

/**
 * 国内站 SEO 组件：
 * - 注入百度/360/搜狗/神马/豆包 验证 meta
 * - 注入企业知识图谱 JSON-LD
 * - 注入百度统计脚本
 * - 注入 AI 搜索友好的结构化数据
 */
export default async function ChinaSeoHead() {
  const config = await getChinaSeoConfig();
  const metas = getChinaSeoMetas(config as Record<string, unknown>);
  const orgSchema = getOrganizationSchema(config as Record<string, unknown>);
  const localSchema = getLocalBusinessSchema();
  const baikeData = getBaiduBaikeStyleData();

  return (
    <>
      {/* 搜索引擎验证 meta */}
      {metas.map((m, i) => (
        <meta key={i} name={m.name} property={m.property} content={m.content} />
      ))}

      {/* 企业知识图谱 JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      {/* 本地商家 JSON-LD（百度本地搜索） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }}
      />

      {/* 百度百科风格企业信息注释（AI搜索知识卡片友好） */}
      <script
        type="application/json"
        data-purpose="enterprise-info"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(baikeData) }}
      />

      {/* 百度统计 */}
      {config.baidu_analytics && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?${config.baidu_analytics}";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();
            `.trim(),
          }}
        />
      )}
    </>
  );
}
