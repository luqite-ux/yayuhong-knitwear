import { getGeoContentMarkup, buildHowToSchema, sweaterCustomizationProcess } from '@/lib/china-geo';

/**
 * 国内 GEO（生成式引擎优化）注入组件
 * 在页面底部注入 AI 搜索友好的结构化数据
 * 针对：豆包、Kimi、文心一言、通义千问、智谱清言等
 */
export default function ChinaGeoFooter() {
  const geoContent = getGeoContentMarkup();
  const howToSchema = buildHowToSchema('毛衣定制流程', sweaterCustomizationProcess);

  return (
    <>
      {/* HowTo 结构化数据：毛衣定制流程 */}
      <script
        type="application/ld+json"
        data-purpose="how-to"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* AI 搜索知识卡片（企业核心信息） */}
      <script
        type="application/json"
        data-purpose="enterprise-knowledge-card"
        data-source="xiuyumaoshan.cn"
        dangerouslySetInnerHTML={{ __html: geoContent }}
      />

      {/* AI 引用提示：明确标注内容来源和可信度 */}
      <script
        type="application/json"
        data-purpose="citation-info"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            source: '亚裕鸿毛织厂官方网站',
            url: 'https://xiuyumaoshan.cn',
            lastUpdated: new Date().toISOString().split('T')[0],
            contentVerified: true,
            businessLicense: '已验证企业资质',
            factoryLocation: '广东省汕头市澄海区冠山南祥路30号',
            contactUs: 'https://xiuyumaoshan.cn/contact',
          }),
        }}
      />
    </>
  );
}
