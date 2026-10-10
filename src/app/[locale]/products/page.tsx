import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import FloatingContact from '@/components/FloatingContact';
import ProductGrid from '@/components/ProductGrid';
import { zhText, localizeText } from '@/lib/zh-hant';
import { type ProductItem } from '@/components/ProductDetailModal';
import { sql, deepParseJson } from '@/lib/db';
import { getCurrentSiteKey } from '@/lib/site';

export const dynamic = 'force-dynamic';

const A = (id: string, suffix = 'UL640') => `https://m.media-amazon.com/images/I/${id}._AC_${suffix}_.jpg`;

const AE = (hash: string) => `https://ae-pic-a1.aliexpress-media.com/kf/${hash}.jpg_480x480q75.jpg_.webp`;

// 兜底数据（数据库没有产品时使用）
const fallbackProducts = {
  womens: {
    nameKey: 'categories.0.name',
    descKey: 'categories.0.desc',
    countKey: 'categories.0.count',
    cover: '/images/products/womens-sweater-1.jpg',
    items: [
      { img: A('71BsfwmWb8L'), name: { en: 'Knit Pullover Sweater', zh: '针织套头毛衣' } },
      { img: A('91MnaEuJ6qL'), name: { en: 'Turtleneck Knit', zh: '高领针织' } },
      { img: A('714sG2Nx9zL'), name: { en: 'Oversized Cardigan', zh: '宽松开衫' } },
      { img: A('71MIDEyOPEL'), name: { en: 'Crew Neck Sweater', zh: '圆领毛衣' } },
      { img: A('71QLU3sm3CL'), name: { en: 'Ribbed Pullover', zh: '罗纹套头衫' } },
      { img: A('71rf-YGgaoL'), name: { en: 'V-Neck Knit', zh: 'V领针织' } },
      { img: A('71LtG1o2ILL'), name: { en: 'Striped Sweater', zh: '条纹毛衣' } },
      { img: A('81VKtFTaCbL'), name: { en: 'Chunky Knit', zh: '粗针针织' } },
      { img: A('81rvZ2khfWL'), name: { en: 'Slim Fit Sweater', zh: '修身毛衣' } },
      { img: A('71tg-6WKPbL'), name: { en: 'Belted Cardigan', zh: '系带开衫' } },
      { img: A('71k2q2NsDAL'), name: { en: 'Color Block Knit', zh: '拼色针织' } },
      { img: A('81Rj8Gj7FML'), name: { en: 'Casual Pullover', zh: '休闲套头衫' } },
      { img: A('71ERv3nt+3L'), name: { en: 'Button Cardigan', zh: '扣子开衫' } },
      { img: A('81nKsNNhG5L'), name: { en: 'Textured Knit', zh: '纹理针织' } },
      { img: A('817Ygaz9iqL'), name: { en: 'Fitted Sweater', zh: '合身毛衣' } },
      { img: A('71rBZ1tZF5L'), name: { en: 'Trendy Pullover', zh: '时尚套头衫' } },
      { img: A('71EMLE2FjpL'), name: { en: 'Loose Knit', zh: '宽松针织' } },
      { img: A('71l9N09tGUL'), name: { en: 'Mock Neck', zh: '半高领' } },
      { img: A('81opFGAsGEL'), name: { en: 'Classic Cardigan', zh: '经典开衫' } },
      { img: A('61E2I1WMn2L'), name: { en: 'Casual Knit', zh: '休闲针织' } },
      { img: AE('Sab811e739bbf4c919809910c20ca9bc5d'), name: { en: 'Knit Pullover', zh: '针织套头衫' } },
      { img: AE('S086494d2d6ec4f3695056364de3874b0A'), name: { en: 'Casual Cardigan', zh: '休闲开衫' } },
      { img: AE('Sc599169132fa4fb787717a6927666628H'), name: { en: 'Fashion Sweater', zh: '时尚毛衣' } },
      { img: AE('S3bf69909ca1a410184fc2f90a3f25449N'), name: { en: 'Slim Knit', zh: '修身针织' } },
    ],
  },
  kids: {
    nameKey: 'categories.1.name',
    descKey: 'categories.1.desc',
    countKey: 'categories.1.count',
    cover: '/images/products/kids-sweater-1.jpg',
    items: [
      { img: A('71VeK2OC67L'), name: { en: 'Girls Cardigan Sweater', zh: '女童开衫毛衣' } },
      { img: A('81+hZubygYL'), name: { en: 'Chunky Knit Striped Sweater', zh: '粗针条纹毛衣' } },
      { img: A('719ltCK5qkL'), name: { en: 'Turtleneck Cable Knit', zh: '高领麻花针织' } },
      { img: A('71ny6va6ONL'), name: { en: 'Long Sleeve Turtleneck', zh: '长袖高领毛衣' } },
      { img: A('71lEexSFe0L'), name: { en: 'Button Cardigan', zh: '扣子开衫' } },
      { img: A('71P4b97PGHL'), name: { en: 'Baby Knit Pullover', zh: '婴儿针织套头衫' } },
      { img: A('71VEkouw0aL'), name: { en: 'Cotton V-Neck Sweater', zh: '棉质V领毛衣' } },
      { img: A('81WdWBvaHbL'), name: { en: 'Toddler Knit Pullover', zh: '幼儿针织套头衫' } },
      { img: A('81DzFvD5GhL'), name: { en: 'Baby Knit Cardigan', zh: '婴儿针织开衫' } },
      { img: A('81GIJMQPLUL'), name: { en: 'Toddler Knit Sweater', zh: '幼儿针织毛衣' } },
      { img: A('81VDq73hnsL'), name: { en: 'Christmas Cardigan', zh: '圣诞开衫' } },
      { img: A('91fXWTAna9L'), name: { en: 'Zip Cardigan Sweater', zh: '拉链开衫毛衣' } },
      { img: A('91zJvX0ld0L'), name: { en: 'Crewneck Pullover', zh: '圆领套头衫' } },
      { img: A('71tmEYFi23L'), name: { en: 'Cable Knit Sweater', zh: '麻花毛衣' } },
      { img: A('81w-uTR7U+L'), name: { en: 'Chunky Pullover', zh: '粗针套头衫' } },
      { img: A('81Ap9JW0f0L'), name: { en: 'Boys Cable Cardigan', zh: '男童麻花开衫' } },
      { img: A('61TMTJpTD1L'), name: { en: 'Knit Sweater Dress', zh: '针织毛衣裙' } },
      { img: A('714bTwpjdeL'), name: { en: 'Crew Neck Sweater', zh: '圆领毛衣' } },
      { img: AE('S0f9b29bb9fa34ca49a1fef223929f00d1'), name: { en: 'Kids Knit Sweater', zh: '儿童针织毛衣' } },
      { img: A('71L-oOW1qiL'), name: { en: 'Open Front Cardigan', zh: '敞襟开衫' } },
    ],
  },
  mens: {
    nameKey: 'categories.2.name',
    descKey: 'categories.2.desc',
    countKey: 'categories.2.count',
    cover: '/images/products/mens-sweater-1.jpg',
    items: [
      { img: A('71Pd57qe64L'), name: { en: 'Quarter Zip Pullover', zh: '半拉链套头衫' } },
      { img: A('81JmpBmn0CL'), name: { en: 'Knit Cardigan', zh: '针织开衫' } },
      { img: A('81kmjezerUL'), name: { en: 'Casual Sweater', zh: '休闲毛衣' } },
      { img: A('71fyxjVIVTL'), name: { en: 'Cable Knit Pullover', zh: '麻花套头衫' } },
      { img: A('81D+bCgn8hL'), name: { en: 'Crew Neck Sweater', zh: '圆领毛衣' } },
      { img: A('81AARXiGz5L'), name: { en: 'Slim Pullover', zh: '修身套头衫' } },
      { img: A('71fm7+WAt4L'), name: { en: 'V-Neck Sweater', zh: 'V领毛衣' } },
      { img: A('71EAeDCOQ3L'), name: { en: 'Stand Collar Knit', zh: '立领针织' } },
      { img: A('81pmsd3S2rL'), name: { en: 'Pullover Sweater', zh: '套头毛衣' } },
      { img: A('61J7FTJaGYL'), name: { en: 'Casual Knit', zh: '休闲针织' } },
      { img: A('61qxbX+getL'), name: { en: 'Fitted Sweater', zh: '合身毛衣' } },
      { img: A('711N-N1M08L'), name: { en: 'Quarter Zip', zh: '半拉链' } },
      { img: A('81ywc3pNK2L'), name: { en: 'Mock Neck', zh: '半高领' } },
      { img: A('71OMLQJFXBL'), name: { en: 'Crew Neck Knit', zh: '圆领针织' } },
      { img: A('81Rzt9FBpbL'), name: { en: 'Casual Cardigan', zh: '休闲开衫' } },
      { img: A('71vm5me60oL'), name: { en: 'Pullover Knit', zh: '套头针织' } },
      { img: A('91828yo7t4L'), name: { en: 'Essential Sweater', zh: '基础款毛衣' } },
      { img: A('81zbUrUlm0L'), name: { en: 'Basic Pullover', zh: '基础套头衫' } },
      { img: A('71zt76aD5DL'), name: { en: 'Crew Neck Knit', zh: '圆领针织' } },
      { img: A('A1Tv-5E3lPL'), name: { en: 'Stand Collar Pullover', zh: '立领套头衫' } },
      { img: AE('S7716de674d1147bb9726abbc1454c800K'), name: { en: 'Men Knit Sweater', zh: '男款针织毛衣' } },
      { img: AE('S17e51289db414bb287097dfe096ac183O'), name: { en: 'Casual Men Knit', zh: '男款休闲针织' } },
    ],
  },
  loungewear: {
    nameKey: 'categories.3.name',
    descKey: 'categories.3.desc',
    countKey: 'categories.3.count',
    cover: '/images/products/loungewear-1.jpg',
    items: [
      { img: A('61sxC-eMdsL'), name: { en: 'Waffle Knit Set', zh: '华夫格套装' } },
      { img: A('61hCX7JVNXL'), name: { en: 'Lounge Set', zh: '家居套装' } },
      { img: A('81dB8hu1gSL'), name: { en: '2 Piece Waffle Knit', zh: '华夫格两件套' } },
      { img: A('71j9mySqJcL'), name: { en: 'Knit Pajama Set', zh: '针织睡衣套装' } },
      { img: A('71HziNRiyWL'), name: { en: 'Lounge Pullover', zh: '家居套头衫' } },
      { img: A('61atE+Z9XvL'), name: { en: '2 Piece Outfit', zh: '两件套' } },
      { img: A('81wynY6LMUL'), name: { en: 'Robe Set', zh: '家居袍套装' } },
      { img: A('71IAqNRfiOL'), name: { en: 'Knit Set', zh: '针织套装' } },
      { img: A('71kSodT3yqL'), name: { en: 'Pajama Set', zh: '睡衣套装' } },
      { img: A('61fX8FqSBkL'), name: { en: 'Cardigan Set', zh: '开衫套装' } },
      { img: A('81r9ya4kcHL'), name: { en: 'Lounge Outfit', zh: '家居服' } },
      { img: A('81KEthz+SNL'), name: { en: 'Waffle Robe', zh: '华夫格浴袍' } },
      { img: A('613eYRGbCIL'), name: { en: 'Knit Sweater Set', zh: '针织毛衣套装' } },
      { img: A('6120kiW-mRL'), name: { en: 'Track Suit', zh: '运动套装' } },
      { img: A('81CcCMlQEUL'), name: { en: 'Pajama Set', zh: '睡衣套装' } },
      { img: A('71V3u+WE3JL'), name: { en: 'Lounge Set', zh: '家居套装' } },
      { img: A('71PU9FZG5CL'), name: { en: '2 Piece Outfit', zh: '两件套' } },
      { img: A('51MXY4Z4doL'), name: { en: 'Knit Sweater Set', zh: '针织套装' } },
      { img: A('71ljx+S3oSL'), name: { en: 'V-Neck Set', zh: 'V领套装' } },
      { img: A('51vk7F8zAKL'), name: { en: 'Knit Pajama Set', zh: '针织睡衣' } },
    ],
  },
  pet: {
    nameKey: 'categories.4.name',
    descKey: 'categories.4.desc',
    countKey: 'categories.4.count',
    cover: '/images/products/pet-clothes-1.jpg',
    items: [
      { img: A('716G6O3lx5L'), name: { en: 'Christmas Dog Sweater', zh: '圣诞狗毛衣' } },
      { img: A('71-aM8zq-kL'), name: { en: 'Reversible Dog Coat', zh: '双面狗外套' } },
      { img: A('71FtD3zO7lL'), name: { en: 'Thermal Dog Sweater', zh: '保暖狗毛衣' } },
      { img: A('71j5MuRSoAL'), name: { en: 'Dot Pattern Sweater', zh: '波点毛衣' } },
      { img: A('812dZEy3lUL'), name: { en: '3 Pack Dog Sweaters', zh: '三件装狗毛衣' } },
      { img: A('81jS+ryE0AL'), name: { en: 'Dog Sweatshirt', zh: '狗卫衣' } },
      { img: A('81Uwvuglm7L'), name: { en: 'Pumpkin Dog Sweater', zh: '南瓜款狗毛衣' } },
      { img: A('81SLW-zJ+kL'), name: { en: 'Lightweight Dog Sweater', zh: '轻薄狗毛衣' } },
      { img: A('81V8-FpMDYL'), name: { en: 'Knitted Dog Sweater', zh: '针织狗毛衣' } },
      { img: A('61rXLspTGdL'), name: { en: 'Dog Hoodie', zh: '狗连帽衫' } },
      { img: A('71YpCA9uyaL'), name: { en: 'Winter Dog Sweater', zh: '冬季狗毛衣' } },
      { img: A('71S2qbS1ySL'), name: { en: 'Turtleneck Dog Sweater', zh: '高领狗毛衣' } },
      { img: A('71zcm-YMLgL'), name: { en: 'Dog Fleece Jacket', zh: '狗抓绒外套' } },
      { img: A('71odYgS6-uL'), name: { en: 'Halloween Dog Sweater', zh: '万圣节狗毛衣' } },
      { img: A('81Jn9icOVJL'), name: { en: 'Turtleneck Knit', zh: '高领针织' } },
      { img: A('81H6tfRRW8L'), name: { en: '3 Pack Fleece Sweater', zh: '三件装抓绒衣' } },
      { img: A('51d8Mb5RAfL'), name: { en: 'Dog Hoodie', zh: '狗连帽衫' } },
      { img: A('71ePmzG8P2L'), name: { en: 'Windproof Dog Sweater', zh: '防风狗毛衣' } },
      { img: A('61+lpx6oIVL'), name: { en: 'Dog Pullover', zh: '狗套头衫' } },
      { img: A('71K0baygxbL'), name: { en: 'Turtleneck Dog Sweater', zh: '高领狗毛衣' } },
    ],
  },
  accessories: {
    nameKey: 'categories.5.name',
    descKey: 'categories.5.desc',
    countKey: 'categories.5.count',
    cover: '/images/products/accessories-1.jpg',
    items: [
      { img: A('712DRIxoFOL'), name: { en: 'Knit Beanie & Scarf', zh: '针织帽围巾' } },
      { img: A('81r-DwiI0jL'), name: { en: 'Winter Hat Set', zh: '冬季帽子套装' } },
      { img: A('71OUBmokiNL'), name: { en: 'Merino Wool Set', zh: '羊毛套装' } },
      { img: A('81h+2Sq-Q4L'), name: { en: 'Knit Hat Set', zh: '针织帽套装' } },
      { img: A('81KzhYQqmPL'), name: { en: 'Scarf & Hat Set', zh: '围巾帽套装' } },
      { img: A('71QFKSOWw+L'), name: { en: 'Beanie Scarf Gloves', zh: '帽围巾手套' } },
      { img: A('810waJjRMxL'), name: { en: 'Winter Set', zh: '冬季套装' } },
      { img: A('81j8Bg-n1wL'), name: { en: 'Cashmere Hat & Scarf', zh: '羊绒帽围巾' } },
      { img: A('814aPfdTiEL'), name: { en: 'Knit Set', zh: '针织套装' } },
      { img: A('71P6yWIA-aL'), name: { en: 'Beanie Scarf Set', zh: '帽围巾套装' } },
      { img: A('71F2Y8d2YJL'), name: { en: 'Fuzzy Socks Set', zh: '毛绒袜套装' } },
      { img: A('71WsMNaluKL'), name: { en: 'Beanie Scarf Tote', zh: '帽围巾托特' } },
      { img: A('61f4tnQfBwL'), name: { en: 'Knit Accessories', zh: '针织配饰' } },
      { img: A('81d2iczYB7L'), name: { en: '3 PCS Knitted Set', zh: '三件针织套装' } },
      { img: A('81Bylmm2P0L'), name: { en: 'Winter Hat Scarf Set', zh: '冬帽围巾套装' } },
      { img: A('814-qxhBEbL'), name: { en: '12 Pcs Winter Set', zh: '十二件冬季套装' } },
      { img: A('81QBRiuSXvL'), name: { en: 'Beanie Scarf Gloves', zh: '帽围巾手套' } },
      { img: A('81cOQRoMe0L'), name: { en: 'Fleece Knit Neck Set', zh: '抓绒围巾套装' } },
      { img: A('81YEm4MQq3L'), name: { en: 'Knit Hat & Scarf', zh: '针织帽围巾' } },
      { img: A('616W1UjjlsL'), name: { en: 'Knit Accessories', zh: '针织配饰' } },
    ],
  },
};

const categoryKeys = ['womens', 'kids', 'mens', 'loungewear', 'pet', 'accessories'] as const;

const slugToKeyMap: Record<string, string> = {
  'womens-sweater': 'womens',
  'womens-knitwear': 'womens',
  'kids-sweater': 'kids',
  'kids-knitwear': 'kids',
  'mens-sweater': 'mens',
  'mens-knitwear': 'mens',
  'loungewear-set': 'loungewear',
  'loungewear': 'loungewear',
  'pet-clothes': 'pet',
  'pet-knitwear': 'pet',
  'knit-accessories': 'accessories',
  'accessories': 'accessories',
  // 越南站点分类
  'vn-cardigans': 'womens',
  'vn-knit-tops': 'womens',
  'vn-polo-shirts': 'mens',
  'vn-basics': 'womens',
  'vn-loungewear': 'loungewear',
};

const categoryCovers: Record<string, string> = {
  womens: '/images/products/womens-sweater-1.jpg',
  kids: '/images/products/kids-sweater-1.jpg',
  mens: '/images/products/mens-sweater-1.jpg',
  loungewear: '/images/products/loungewear-1.jpg',
  pet: '/images/products/pet-clothes-1.jpg',
  accessories: '/images/products/accessories-1.jpg',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'products' });
  return { title: t('title') + ' - Yayuhong Knitwear', description: t('subtitle') };
}

async function fetchProductsFromDB(siteKey: string, locale: string) {
  try {
    // 越南语版本额外包含越南专属产品（sites 含 'vn'）
    const isVn = locale === 'vn';

    const productsQuery = isVn
      ? sql`
          select
            p.id, p.slug, p.name, p.summary, p.cover_url, p.gallery_urls,
            p.model, p.is_active, p.sort,
            c.slug as category_slug
          from content_products p
          left join content_categories c on p.category_id = c.id
          where p.is_active = true
            and (p.sites && array['global', ${siteKey}]::text[]
                 or p.sites && array['vn']::text[])
          order by p.sort, p.created_at
        `
      : sql`
          select
            p.id, p.slug, p.name, p.summary, p.cover_url, p.gallery_urls,
            p.model, p.is_active, p.sort,
            c.slug as category_slug
          from content_products p
          left join content_categories c on p.category_id = c.id
          where p.is_active = true
            and p.sites && array['global', ${siteKey}]::text[]
          order by p.sort, p.created_at
        `;

    const categoriesQuery = isVn
      ? sql`
          select id, slug, name, sort
          from content_categories
          where sites && array['global', ${siteKey}]::text[]
             or slug like 'vn-%'
          order by sort, created_at
        `
      : sql`
          select id, slug, name, sort
          from content_categories
          order by sort, created_at
        `;

    const [products, categories] = await Promise.all([productsQuery, categoriesQuery]);

    if (products.length === 0) return null;

    const parsedProducts = (products as any[]).map((p) => ({
      id: p.id,
      slug: p.slug,
      model: p.model,
      cover_url: p.cover_url,
      category_slug: p.category_slug,
      name: deepParseJson(p.name) as Record<string, string>,
      summary: deepParseJson(p.summary) as Record<string, string>,
      gallery_urls: deepParseJson(p.gallery_urls) as string[] | null,
    }));

    const parsedCategories = (categories as any[]).map((c) => ({
      id: c.id,
      slug: c.slug,
      sort: c.sort,
      name: deepParseJson(c.name) as Record<string, string>,
    }));

    const grouped: Record<string, {
      nameKey: string;
      descKey: string;
      countKey: string;
      cover: string;
      items: ProductItem[];
      categoryName?: Record<string, string>;
      categorySlug?: string;
    }> = {};

    for (const key of categoryKeys) {
      grouped[key] = {
        nameKey: '',
        descKey: '',
        countKey: '',
        cover: categoryCovers[key] || '/images/products/placeholder.jpg',
        items: [],
      };
    }

    for (const cat of parsedCategories) {
      const key = slugToKeyMap[cat.slug || ''];
      if (key && grouped[key]) {
        // 越南语版本：优先使用有 vi 字段的分类名称
        const existingName = grouped[key].categoryName;
        const catName = cat.name as Record<string, string>;
        if (locale === 'vn' && existingName) {
          const existingHasVi = existingName.vi || existingName.vn;
          const newHasVi = catName.vi || catName.vn;
          if (newHasVi && !existingHasVi) {
            grouped[key].categoryName = catName;
            grouped[key].categorySlug = cat.slug;
          }
        } else {
          grouped[key].categoryName = catName;
          grouped[key].categorySlug = cat.slug;
        }
      }
    }

    for (const p of parsedProducts) {
      const key = slugToKeyMap[p.category_slug || ''];
      if (key && grouped[key]) {
        const item: ProductItem = {
          img: p.cover_url || '',
          name: p.name || { en: p.model || 'Product', zh: p.model || '产品' },
          slug: p.slug,
          material: p.summary || undefined,
        };
        grouped[key].items.push(item);
      }
    }

    const filtered: Record<string, typeof grouped[string]> = {};
    for (const key of categoryKeys) {
      if (grouped[key].items.length > 0) {
        filtered[key] = grouped[key];
      }
    }

    const activeKeys = categoryKeys.filter((k) => filtered[k]);
    return { categories: filtered, categoryKeys: activeKeys };
  } catch (err) {
    console.error('Failed to fetch products from DB:', err);
    return null;
  }
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'products' });
  const siteKey = await getCurrentSiteKey();

  const dbData = await fetchProductsFromDB(siteKey, locale);
  const categories = dbData ? dbData.categories : (fallbackProducts as any);
  const activeCategoryKeys = dbData ? dbData.categoryKeys : (categoryKeys as unknown as string[]);

  return (
    <>
      <section className="hero-gradient pt-32 pb-20 knit-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#faf8f5"/>
          </svg>
        </div>
      </section>

      <section className="py-16 bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {activeCategoryKeys.map((key, index) => {
              const cat = categories[key];
              const name = cat.categoryName
                ? localizeText(cat.categoryName, locale) || key
                : t(cat.nameKey || `categories.${index}.name`);
              const count = `${cat.items.length} ${zhText(locale, '款', 'SKUs')}`;
              const linkHref = cat.categorySlug
                ? `/products/category/${cat.categorySlug}`
                : `#category-${index}`;
              return (
                <Link key={index} href={linkHref} className="bg-white rounded-xl overflow-hidden card-hover border border-[var(--color-border)]/50 block group">
                  <div className="aspect-square overflow-hidden relative">
                    <img src={cat.cover} alt={`${name} - ${t('title')}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
                      <span className="text-white text-xs font-medium">{count}</span>
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="font-semibold text-sm text-[var(--color-primary)]">{name}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <ProductGrid categories={categories} categoryKeys={activeCategoryKeys} />

      <section className="py-20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-dark)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {zhText(locale, '没有找到合适的款式？', "Can't find what you're looking for?")}
          </h2>
          <p className="text-white/70 text-lg mb-8">
            {zhText(locale, '我们支持来图来样定制，专业设计团队为您量身打造', 'We offer custom design services. Our professional team can bring your ideas to life.')}
          </p>
          <Link href="/contact" className="btn-primary !bg-white !text-[var(--color-primary)]">
            {zhText(locale, '立即定制', 'Customize Now')}
          </Link>
        </div>
      </section>

      <FloatingContact />
    </>
  );
}
