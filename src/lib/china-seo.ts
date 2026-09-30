import { sql } from '@/lib/db';

/**
 * 获取国内站SEO配置
 * 如果数据库不可用，返回空对象（使用默认值）
 */
export async function getChinaSeoConfig() {
  try {
    if (!process.env.DATABASE_URL) {
      return {};
    }
    const rows = await sql`
      select baidu_verification, baidu_analytics, baidu_push_token,
             haosou_verification, sogou_verification, shenma_verification,
             doubao_verification, china_seo, china_geo
      from site_profile
      order by created_at
      limit 1
    `;
    return rows[0] || {};
  } catch (e) {
    console.error('获取国内SEO配置失败，使用默认值:', e);
    return {};
  }
}

/**
 * 生成国内站专用的 SEO meta 标签
 * 包括百度、360、搜狗、神马等国内搜索引擎验证
 */
export function getChinaSeoMetas(config: Record<string, unknown>) {
  const metas: Array<{ name?: string; content?: string; property?: string; httpEquiv?: string }> = [];

  // 百度验证
  if (config.baidu_verification) {
    metas.push({ name: 'baidu-site-verification', content: config.baidu_verification as string });
  }

  // 360好搜验证
  if (config.haosou_verification) {
    metas.push({ name: '360-site-verification', content: config.haosou_verification as string });
  }

  // 搜狗验证
  if (config.sogou_verification) {
    metas.push({ name: 'sogou_site_verification', content: config.sogou_verification as string });
  }

  // 神马验证
  if (config.shenma_verification) {
    metas.push({ name: 'shenma-site-verification', content: config.shenma_verification as string });
  }

  // 豆包AI搜索验证
  if (config.doubao_verification) {
    metas.push({ name: 'doubao-site-verification', content: config.doubao_verification as string });
  }

  // 国内SEO额外配置
  const chinaSeo = config.china_seo as Record<string, string> | undefined;
  if (chinaSeo) {
    if (chinaSeo.keywords) {
      metas.push({ name: 'keywords', content: chinaSeo.keywords });
    }
    if (chinaSeo.author) {
      metas.push({ name: 'author', content: chinaSeo.author });
    }
    if (chinaSeo.copyright) {
      metas.push({ name: 'copyright', content: chinaSeo.copyright });
    }
  }

  return metas;
}

/**
 * 生成企业知识图谱结构化数据（百度/AI搜索友好）
 */
export function getOrganizationSchema(config?: Record<string, unknown>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '汕头市澄海区亚裕鸿毛织厂',
    alternateName: '亚裕鸿毛织厂',
    url: 'https://xiuyumaoshan.cn',
    logo: 'https://xiuyumaoshan.cn/logo.png',
    description: '汕头市澄海区亚裕鸿毛织厂，20年毛织经验，专业提供毛衣OEM贴牌、ODM设计开发、来图来样定制服务。',
    foundingDate: '2005',
    foundLocation: '广东省汕头市澄海区',
    numberOfEmployees: '200-500',
    areaServed: '中国',
    industry: '毛织服装制造',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+86-138-0013-8000',
      contactType: 'sales',
      availableLanguage: ['Chinese'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '汕头市澄海区莱美工业区',
      addressLocality: '澄海区',
      addressRegion: '广东省汕头市',
      addressCountry: 'CN',
    },
    sameAs: [
      'https://xiuyuknit.com',
    ],
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: '毛衣OEM贴牌加工',
          description: '来图来样贴牌生产，支持客户品牌',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: '毛衫ODM设计开发',
          description: '独立设计开发，从款式到打样到大货',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: '小批量毛衣定制',
          description: 'MOQ 50件起订，小单快反',
        },
      },
    ],
  };
}

/**
 * 生成本地企业结构化数据（百度地图/本地搜索友好）
 */
export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://xiuyumaoshan.cn#business',
    name: '汕头市澄海区亚裕鸿毛织厂',
    image: 'https://xiuyumaoshan.cn/logo.png',
    url: 'https://xiuyumaoshan.cn',
    telephone: '+86-138-0013-8000',
    priceRange: '¥¥',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '莱美工业区',
      addressLocality: '澄海区',
      addressRegion: '汕头市',
      addressCountry: 'CN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 23.48,
      longitude: 116.77,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:30',
      closes: '18:00',
    },
    areaServed: '全国',
  };
}

/**
 * 生成 FAQPage 结构化数据（AI搜索引用友好）
 */
export function getFaqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}

/**
 * 生成 HowTo 结构化数据（AI搜索步骤类答案友好）
 */
export function getHowToSchema(name: string, steps: Array<{ name: string; text: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/**
 * 生成百度百科风格的企业简介（AI搜索知识卡片友好）
 * 包含：基本信息、发展历程、主营业务、核心优势、企业文化
 */
export function getBaiduBaikeStyleData() {
  return {
    公司名称: '亚裕鸿毛织厂',
    成立时间: '2005年',
    总部地点: '广东省汕头市澄海区',
    经营范围: '毛衫、毛衣、针织服装的设计、生产、销售',
    公司类型: '生产制造型企业',
    员工数: '300-500人',
    月产能: '100万件以上',
    主要产品: '女装毛衫、童装毛衣、男装针织',
    服务模式: 'OEM贴牌加工、ODM设计开发、来图来样定制',
    品牌理念: '品质为本，客户至上',
  };
}
