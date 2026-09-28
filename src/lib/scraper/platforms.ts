import { PlatformConfig } from './types';

/**
 * Platform configurations for product scraping.
 * Maps each e-commerce platform's categories to our internal category slugs.
 * Other AI tools can use these URLs as starting points for scraping.
 */
export const platforms: Record<string, PlatformConfig> = {
  shein: {
    id: 'shein',
    name: 'SHEIN',
    fullName: 'SHEIN Fast Fashion',
    site: 'https://us.shein.com',
    currency: 'USD',
    language: 'en',
    status: 'active',
    categories: [
      {
        slug: 'womens',
        name: { en: "Women's Sweaters", zh: '女装毛衣' },
        url: 'https://us.shein.com/pdsearch/sweaters%20for%20women/?ici=s1_tab01spots01003000300&src_identifier=st%3D2%60sc%3Dsweaters%60sr%3D0%60ps%3D1&src_module=search_in_category&src_tab_page_id=page_search1687499246935&page=1',
        keywords: ['sweater', 'knitwear', 'pullover', 'cardigan'],
      },
      {
        slug: 'mens',
        name: { en: "Men's Sweaters", zh: '男装毛衣' },
        url: 'https://us.shein.com/pdsearch/men%20sweaters/?ici=s1_tab01spots01003000300&src_identifier=st%3D2%60sc%3Dmen%20sweater%60sr%3D0%60ps%3D1&src_module=search_in_category&src_tab_page_id=page_search1687499246935&page=1',
        keywords: ['men sweater', 'mens knitwear', 'mens pullover'],
      },
      {
        slug: 'kids',
        name: { en: 'Kids Sweaters', zh: '童装毛衣' },
        url: 'https://us.shein.com/pdsearch/kids%20sweaters/?ici=s1_tab01spots01003000300&src_identifier=st%3D2%60sc%3Dkids%20sweater%60sr%3D0%60ps%3D1&src_module=search_in_category&src_tab_page_id=page_search1687499246935&page=1',
        keywords: ['kids sweater', 'children knitwear', 'girl sweater', 'boy sweater'],
      },
      {
        slug: 'loungewear',
        name: { en: 'Loungewear Sets', zh: '居家套装' },
        url: 'https://us.shein.com/pdsearch/knit%20loungewear%20set/?ici=s1_tab01spots01003000300&src_identifier=st%3D2%60sc%3Dknit%20loungewear%60sr%3D0%60ps%3D1&src_module=search_in_category&src_tab_page_id=page_search1687499246935&page=1',
        keywords: ['knit loungewear', 'knit two piece', 'sweater set'],
      },
      {
        slug: 'pet',
        name: { en: 'Pet Clothes', zh: '宠物服饰' },
        url: 'https://us.shein.com/pdsearch/pet%20sweater/?ici=s1_tab01spots01003000300&src_identifier=st%3D2%60sc%3Dpet%20sweater%60sr%3D0%60ps%3D1&src_module=search_in_category&src_tab_page_id=page_search1687499246935&page=1',
        keywords: ['pet sweater', 'dog sweater', 'cat sweater', 'pet knit'],
      },
      {
        slug: 'accessories',
        name: { en: 'Knit Accessories', zh: '针织配饰' },
        url: 'https://us.shein.com/pdsearch/knit%20accessories/?ici=s1_tab01spots01003000300&src_identifier=st%3D2%60sc%3Dknit%20accessories%60sr%3D0%60ps%3D1&src_module=search_in_category&src_tab_page_id=page_search1687499246935&page=1',
        keywords: ['knit scarf', 'knit hat', 'beanie', 'knit gloves', 'knit bag'],
      },
    ],
    categoryMapping: {
      womens: 'womens',
      mens: 'mens',
      kids: 'kids',
      loungewear: 'loungewear',
      pet: 'pet',
      accessories: 'accessories',
    },
  },

  amazon: {
    id: 'amazon',
    name: 'Amazon',
    fullName: 'Amazon US',
    site: 'https://www.amazon.com',
    currency: 'USD',
    language: 'en',
    status: 'active',
    categories: [
      {
        slug: 'womens',
        name: { en: "Women's Sweaters", zh: '女装毛衣' },
        url: 'https://www.amazon.com/s?k=sweaters+for+women',
        keywords: ['womens sweater', 'womens knit top', 'womens pullover'],
      },
      {
        slug: 'mens',
        name: { en: "Men's Sweaters", zh: '男装毛衣' },
        url: 'https://www.amazon.com/s?k=sweaters+for+men',
        keywords: ['mens sweater', 'mens pullover', 'mens cardigan'],
      },
      {
        slug: 'kids',
        name: { en: 'Kids Sweaters', zh: '童装毛衣' },
        url: 'https://www.amazon.com/s?k=sweaters+for+kids',
        keywords: ['kids sweater', 'children sweater', 'girls sweater', 'boys sweater'],
      },
      {
        slug: 'loungewear',
        name: { en: 'Knit Loungewear', zh: '针织居家服' },
        url: 'https://www.amazon.com/s?k=knit+loungewear+set+women',
        keywords: ['knit loungewear set', 'sweater lounge set', 'knit two piece set'],
      },
      {
        slug: 'pet',
        name: { en: 'Pet Sweaters', zh: '宠物毛衣' },
        url: 'https://www.amazon.com/s?k=dog+sweaters+for+small+dogs',
        keywords: ['dog sweater', 'pet sweater', 'dog knitwear', 'cat sweater'],
      },
      {
        slug: 'accessories',
        name: { en: 'Knit Accessories', zh: '针织配饰' },
        url: 'https://www.amazon.com/s?k=knit+scarf+hat+set',
        keywords: ['knit scarf', 'beanie hat', 'knit gloves', 'knit accessories set'],
      },
    ],
    categoryMapping: {
      womens: 'womens',
      mens: 'mens',
      kids: 'kids',
      loungewear: 'loungewear',
      pet: 'pet',
      accessories: 'accessories',
    },
  },

  aliexpress: {
    id: 'aliexpress',
    name: 'AliExpress',
    fullName: 'AliExpress Global',
    site: 'https://www.aliexpress.com',
    currency: 'USD',
    language: 'en',
    status: 'active',
    categories: [
      {
        slug: 'womens',
        name: { en: "Women's Sweaters", zh: '女装毛衣' },
        url: 'https://www.aliexpress.com/w/wholesale-women-sweater.html',
        keywords: ['women sweater', 'womens knitwear', 'ladies sweater'],
      },
      {
        slug: 'mens',
        name: { en: "Men's Sweaters", zh: '男装毛衣' },
        url: 'https://www.aliexpress.com/w/wholesale-men-sweater.html',
        keywords: ['men sweater', 'mens knitwear', 'man pullover'],
      },
      {
        slug: 'kids',
        name: { en: 'Kids Sweaters', zh: '童装毛衣' },
        url: 'https://www.aliexpress.com/w/wholesale-kids-sweater.html',
        keywords: ['kids sweater', 'children sweater', 'baby sweater'],
      },
      {
        slug: 'loungewear',
        name: { en: 'Knit Loungewear', zh: '针织居家服' },
        url: 'https://www.aliexpress.com/w/wholesale-knit-loungewear-set.html',
        keywords: ['knit loungewear', 'knit two piece', 'sweater tracksuit'],
      },
      {
        slug: 'pet',
        name: { en: 'Pet Clothes', zh: '宠物服饰' },
        url: 'https://www.aliexpress.com/w/wholesale-pet-sweater.html',
        keywords: ['pet sweater', 'dog sweater', 'pet clothes'],
      },
      {
        slug: 'accessories',
        name: { en: 'Knit Accessories', zh: '针织配饰' },
        url: 'https://www.aliexpress.com/w/wholesale-knit-hat-scarf.html',
        keywords: ['knit hat', 'knit scarf', 'beanie', 'knit gloves'],
      },
    ],
    categoryMapping: {
      womens: 'womens',
      mens: 'mens',
      kids: 'kids',
      loungewear: 'loungewear',
      pet: 'pet',
      accessories: 'accessories',
    },
  },

  temu: {
    id: 'temu',
    name: 'Temu',
    fullName: 'Temu Marketplace',
    site: 'https://www.temu.com',
    currency: 'USD',
    language: 'en',
    status: 'beta',
    categories: [
      {
        slug: 'womens',
        name: { en: "Women's Sweaters", zh: '女装毛衣' },
        url: 'https://www.temu.com/search_result.html?search_key=women%20sweater',
        keywords: ['women sweater', 'womens knitwear'],
      },
      {
        slug: 'mens',
        name: { en: "Men's Sweaters", zh: '男装毛衣' },
        url: 'https://www.temu.com/search_result.html?search_key=men%20sweater',
        keywords: ['men sweater', 'mens pullover'],
      },
      {
        slug: 'kids',
        name: { en: 'Kids Sweaters', zh: '童装毛衣' },
        url: 'https://www.temu.com/search_result.html?search_key=kids%20sweater',
        keywords: ['kids sweater', 'children knit'],
      },
      {
        slug: 'loungewear',
        name: { en: 'Knit Loungewear', zh: '针织居家服' },
        url: 'https://www.temu.com/search_result.html?search_key=knit%20loungewear%20set',
        keywords: ['knit loungewear set', 'sweater lounge set'],
      },
      {
        slug: 'pet',
        name: { en: 'Pet Clothes', zh: '宠物服饰' },
        url: 'https://www.temu.com/search_result.html?search_key=pet%20sweater',
        keywords: ['pet sweater', 'dog sweater'],
      },
      {
        slug: 'accessories',
        name: { en: 'Knit Accessories', zh: '针织配饰' },
        url: 'https://www.temu.com/search_result.html?search_key=knit%20hat%20scarf%20set',
        keywords: ['knit hat', 'knit scarf', 'beanie set'],
      },
    ],
    categoryMapping: {
      womens: 'womens',
      mens: 'mens',
      kids: 'kids',
      loungewear: 'loungewear',
      pet: 'pet',
      accessories: 'accessories',
    },
  },

  walmart: {
    id: 'walmart',
    name: 'Walmart',
    fullName: 'Walmart US',
    site: 'https://www.walmart.com',
    currency: 'USD',
    language: 'en',
    status: 'beta',
    categories: [
      {
        slug: 'womens',
        name: { en: "Women's Sweaters", zh: '女装毛衣' },
        url: 'https://www.walmart.com/search?q=women+sweaters',
        keywords: ['women sweaters', 'womens knitwear'],
      },
      {
        slug: 'mens',
        name: { en: "Men's Sweaters", zh: '男装毛衣' },
        url: 'https://www.walmart.com/search?q=men+sweaters',
        keywords: ['men sweaters', 'mens pullover'],
      },
      {
        slug: 'kids',
        name: { en: 'Kids Sweaters', zh: '童装毛衣' },
        url: 'https://www.walmart.com/search?q=kids+sweaters',
        keywords: ['kids sweaters', 'children sweaters'],
      },
      {
        slug: 'loungewear',
        name: { en: 'Knit Loungewear', zh: '针织居家服' },
        url: 'https://www.walmart.com/search?q=knit+loungewear+set',
        keywords: ['knit loungewear set', 'sweater lounge set'],
      },
      {
        slug: 'pet',
        name: { en: 'Pet Clothes', zh: '宠物服饰' },
        url: 'https://www.walmart.com/search?q=dog+sweaters',
        keywords: ['dog sweaters', 'pet sweaters'],
      },
      {
        slug: 'accessories',
        name: { en: 'Knit Accessories', zh: '针织配饰' },
        url: 'https://www.walmart.com/search?q=knit+hat+scarf+gloves+set',
        keywords: ['knit hat scarf', 'beanie set'],
      },
    ],
    categoryMapping: {
      womens: 'womens',
      mens: 'mens',
      kids: 'kids',
      loungewear: 'loungewear',
      pet: 'pet',
      accessories: 'accessories',
    },
  },

  alibaba: {
    id: 'alibaba',
    name: 'Alibaba',
    fullName: 'Alibaba Wholesale',
    site: 'https://www.alibaba.com',
    currency: 'USD',
    language: 'en',
    status: 'planned',
    categories: [
      {
        slug: 'womens',
        name: { en: "Women's Sweaters (Wholesale)", zh: '女装毛衣（批发）' },
        url: 'https://www.alibaba.com/trade/search?SearchText=women+sweater+knitwear',
        keywords: ['women sweater wholesale', 'knitwear manufacturer', 'custom sweater'],
      },
      {
        slug: 'mens',
        name: { en: "Men's Sweaters (Wholesale)", zh: '男装毛衣（批发）' },
        url: 'https://www.alibaba.com/trade/search?SearchText=men+sweater+knitwear',
        keywords: ['men sweater wholesale', 'mens knitwear factory'],
      },
      {
        slug: 'kids',
        name: { en: 'Kids Sweaters (Wholesale)', zh: '童装毛衣（批发）' },
        url: 'https://www.alibaba.com/trade/search?SearchText=kids+sweater+knitwear',
        keywords: ['kids sweater wholesale', 'children knitwear factory'],
      },
    ],
    categoryMapping: {
      womens: 'womens',
      mens: 'mens',
      kids: 'kids',
    },
  },
};

export function getPlatform(platformId: string): PlatformConfig | undefined {
  return platforms[platformId.toLowerCase()];
}

export function getPlatformList(): Array<{
  id: string;
  name: string;
  fullName: string;
  status: string;
  categoryCount: number;
}> {
  return Object.values(platforms).map((p) => ({
    id: p.id,
    name: p.name,
    fullName: p.fullName,
    status: p.status,
    categoryCount: p.categories.length,
  }));
}

export function mapPlatformCategory(platformId: string, platformCategory: string): string | null {
  const platform = platforms[platformId.toLowerCase()];
  if (!platform) return null;
  return platform.categoryMapping[platformCategory] || null;
}
