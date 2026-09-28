import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import FloatingContact from '@/components/FloatingContact';

const imgApi = (prompt: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=square`;

const P = (color: string, style: string, detail = '') =>
  imgApi(`E-commerce product photo: ${color} ${style} knitwear sweater${detail ? ', ' + detail : ''}, flat lay on white background, professional fashion catalog, high quality`);

const allProducts = {
  womens: {
    nameKey: 'categories.0.name',
    descKey: 'categories.0.desc',
    countKey: 'categories.0.count',
    cover: '/images/products/womens-sweater-1.jpg',
    items: [
      { img: P('cream', 'cable knit pullover', 'soft wool'), name: { en: 'Cable Knit Pullover', zh: '麻花套头衫' } },
      { img: P('beige', 'oversized turtleneck', 'chunky knit'), name: { en: 'Oversized Turtleneck', zh: '宽松高领' } },
      { img: P('grey', 'ribbed knit sweater', 'slim fit'), name: { en: 'Ribbed Knit Sweater', zh: '罗纹针织衫' } },
      { img: P('burgundy', 'v-neck cardigan', 'button front'), name: { en: 'V-Neck Cardigan', zh: 'V领开衫' } },
      { img: P('camel', 'chunky knit pullover', 'crew neck'), name: { en: 'Chunky Crew Neck', zh: '粗针圆领' } },
      { img: P('pink', 'cropped knit sweater', 'boxy fit'), name: { en: 'Cropped Knit', zh: '短款针织' } },
      { img: P('navy', 'striped pullover', 'breton style'), name: { en: 'Striped Pullover', zh: '条纹套头衫' } },
      { img: P('olive', 'knit dress', 'midi length'), name: { en: 'Knit Dress', zh: '针织连衣裙' } },
      { img: P('white', 'off-shoulder sweater', 'loose knit'), name: { en: 'Off-Shoulder Knit', zh: '露肩毛衣' } },
      { img: P('rust', 'bell sleeve sweater', 'boho style'), name: { en: 'Bell Sleeve Knit', zh: '喇叭袖针织' } },
      { img: P('mustard', 'wrap cardigan', 'shawl collar'), name: { en: 'Wrap Cardigan', zh: '裹身开衫' } },
      { img: P('teal', 'fair isle pullover', ' Nordic pattern'), name: { en: 'Fair Isle Sweater', zh: '提花毛衣' } },
      { img: P('charcoal', 'aran sweater', 'cable pattern'), name: { en: 'Aran Sweater', zh: '阿兰毛衣' } },
      { img: P('ivory', 'boat neck sweater', 'loose fit'), name: { en: 'Boat Neck Knit', zh: '船领毛衣' } },
      { img: P('sage', 'boyfriend sweater', 'slouchy'), name: { en: 'Boyfriend Sweater', zh: '男友风毛衣' } },
      { img: P('lavender', 'hooded knit', 'drawstring'), name: { en: 'Hooded Knit', zh: '连帽针织' } },
      { img: P('terracotta', 'knit coat', 'longline'), name: { en: 'Knit Coat', zh: '针织外套' } },
      { img: P('dusty rose', 'poncho', 'fringe hem'), name: { en: 'Knit Poncho', zh: '针织披肩' } },
      { img: P('brown', 'tunic sweater', 'side slit'), name: { en: 'Tunic Sweater', zh: '长款毛衣' } },
      { img: P('black', 'blazer-style knit', 'structured'), name: { en: 'Knit Blazer', zh: '针织西装' } },
    ],
  },
  kids: {
    nameKey: 'categories.1.name',
    descKey: 'categories.1.desc',
    countKey: 'categories.1.count',
    cover: '/images/products/kids-sweater-1.jpg',
    items: [
      { img: '/images/products/kids/kids16.avif', name: { en: 'Striped Pullover', zh: '条纹套头衫' } },
      { img: '/images/products/kids/kids17.avif', name: { en: 'Color Block Knit', zh: '拼色针织' } },
      { img: P('navy', 'kids graphic sweater', 'star pattern'), name: { en: 'Star Pattern Sweater', zh: '星星图案毛衣' } },
      { img: P('grey', 'kids ribbed knit', 'crew neck'), name: { en: 'Ribbed Crew Neck', zh: '罗纹圆领' } },
      { img: P('burgundy', 'kids cable knit', ' aran pattern'), name: { en: 'Cable Knit Sweater', zh: '麻花毛衣' } },
      { img: P('cream', 'kids cardigan', 'button front'), name: { en: 'Button Cardigan', zh: '扣子开衫' } },
      { img: P('blue', 'kids pullover', 'stripe pattern'), name: { en: 'Striped Pullover', zh: '条纹套头衫' } },
      { img: P('yellow', 'kids knit set', 'matching set'), name: { en: 'Knit Set', zh: '针织套装' } },
      { img: P('green', 'kids hooded sweater', 'kangaroo pocket'), name: { en: 'Hooded Sweater', zh: '连帽毛衣' } },
      { img: P('pink', 'kids turtleneck', 'ribbed cuff'), name: { en: 'Kids Turtleneck', zh: '儿童高领' } },
      { img: P('purple', 'kids knit vest', 'sleeveless'), name: { en: 'Knit Vest', zh: '针织马甲' } },
      { img: P('red', 'kids fair isle', 'Nordic pattern'), name: { en: 'Fair Isle Sweater', zh: '提花毛衣' } },
      { img: P('teal', ' kids patterned sweater', 'animal motif'), name: { en: 'Patterned Sweater', zh: '花纹毛衣' } },
      { img: P('orange', 'kids zip-neck', 'quarter zip'), name: { en: 'Quarter Zip', zh: '半拉链' } },
      { img: P('mint', 'kids crew neck', 'color block'), name: { en: 'Color Block Crew', zh: '拼色圆领' } },
      { img: P('coral', 'kids knit poncho', 'fringe hem'), name: { en: 'Kids Poncho', zh: '儿童披肩' } },
      { img: P('lavender', 'kids oversized sweater', 'slouchy fit'), name: { en: 'Oversized Sweater', zh: '宽松毛衣' } },
      { img: P('white', 'kids knit hoodie', 'pom pom detail'), name: { en: 'Pom Pom Hoodie', zh: '毛球连帽衫' } },
      { img: P('charcoal', 'kids polo sweater', 'collar detail'), name: { en: 'Polo Sweater', zh: 'Polo毛衣' } },
      { img: P('mustard', 'kids geometric knit', 'diamond pattern'), name: { en: 'Geometric Knit', zh: '几何针织' } },
    ],
  },
  mens: {
    nameKey: 'categories.2.name',
    descKey: 'categories.2.desc',
    countKey: 'categories.2.count',
    cover: '/images/products/mens-sweater-1.jpg',
    items: [
      { img: '/images/products/mens/mens01.jpg', name: { en: 'Classic Pullover', zh: '经典套头衫' } },
      { img: '/images/products/mens/mens02.jpg', name: { en: 'Crew Neck', zh: '圆领毛衣' } },
      { img: '/images/products/mens/mens03.jpg', name: { en: 'V-Neck Cardigan', zh: 'V领开衫' } },
      { img: '/images/products/mens/mens04.jpg', name: { en: 'Turtleneck', zh: '高领毛衣' } },
      { img: '/images/products/mens/mens05.jpg', name: { en: 'Knit Hoodie', zh: '针织连帽衫' } },
      { img: '/images/products/mens/mens06.jpg', name: { en: 'Cable Knit', zh: '麻花针织' } },
      { img: P('navy', 'mens quarter zip pullover', 'stand collar'), name: { en: 'Quarter Zip', zh: '半拉链' } },
      { img: P('charcoal', 'mens ribbed sweater', 'slim fit'), name: { en: 'Ribbed Sweater', zh: '罗纹毛衣' } },
      { img: P('olive', 'mens grandpa cardigan', 'wood buttons'), name: { en: 'Grandpa Cardigan', zh: '复古开衫' } },
      { img: P('camel', 'mens shawl collar', 'chunky knit'), name: { en: 'Shawl Collar', zh: '披肩领' } },
      { img: P('burgundy', 'mens fair isle', 'Nordic pattern'), name: { en: 'Fair Isle', zh: '提花毛衣' } },
      { img: P('forest green', 'mens striped sweater', 'crew neck'), name: { en: 'Striped Crew', zh: '条纹圆领' } },
      { img: P('slate', 'mens knit blazer', 'structured'), name: { en: 'Knit Blazer', zh: '针织西装' } },
      { img: P('sand', 'mens oversized sweater', 'loose fit'), name: { en: 'Oversized Knit', zh: '宽松针织' } },
      { img: P('chocolate', 'mens textured knit', 'waffle pattern'), name: { en: 'Textured Knit', zh: '纹理针织' } },
      { img: P('rust', 'mens mock neck', 'ribbed cuff'), name: { en: 'Mock Neck', zh: '半高领' } },
      { img: P('stone', 'mens knit vest', 'sleeveless'), name: { en: 'Knit Vest', zh: '针织马甲' } },
      { img: P('espresso', 'mens polo sweater', 'collar'), name: { en: 'Polo Sweater', zh: 'Polo毛衣' } },
      { img: P('steel grey', 'mens fitted pullover', 'merino wool'), name: { en: 'Fitted Pullover', zh: '修身套头衫' } },
      { img: P('wine', 'mens cable cardigan', 'button front'), name: { en: 'Cable Cardigan', zh: '麻花开衫' } },
    ],
  },
  loungewear: {
    nameKey: 'categories.3.name',
    descKey: 'categories.3.desc',
    countKey: 'categories.3.count',
    cover: '/images/products/loungewear-1.jpg',
    items: [
      { img: '/images/products/loungewear/loungewear00.jpg', name: { en: 'Knit Set', zh: '针织套装' } },
      { img: P('grey', 'cozy knit two-piece set', 'oversized'), name: { en: 'Cozy Two-Piece', zh: '舒适两件套' } },
      { img: P('cream', 'knit jogger set', 'ribbed cuff'), name: { en: 'Knit Jogger Set', zh: '针织运动套装' } },
      { img: P('sage', 'soft lounge set', 'relaxed fit'), name: { en: 'Soft Lounge Set', zh: '柔软家居套装' } },
      { img: P('navy', 'knit romper', 'short sleeve'), name: { en: 'Knit Romper', zh: '针织连体衣' } },
      { img: P('camel', 'lounge pullover set', 'wide leg pant'), name: { en: 'Lounge Pullover Set', zh: '家居套头套装' } },
      { img: P('white', 'knit sweatpants set', 'drawstring'), name: { en: 'Knit Sweat Set', zh: '针织卫衣套装' } },
      { img: P('black', 'lounge shorts set', 'crop top'), name: { en: 'Lounge Shorts Set', zh: '家居短裤套装' } },
      { img: P('brown', 'ribbed loungewear', 'bodycon fit'), name: { en: 'Ribbed Loungewear', zh: '罗纹家居服' } },
      { img: P('dusty pink', 'knit jumpsuit', 'belted waist'), name: { en: 'Knit Jumpsuit', zh: '针织连身裤' } },
      { img: P('olive', 'hoodie and jogger set', 'fleece lined'), name: { en: 'Hoodie Set', zh: '连帽套装' } },
      { img: P('lavender', 'cardigan and shorts set', 'cute fit'), name: { en: 'Cardigan Set', zh: '开衫套装' } },
      { img: P('terracotta', 'tunic and leggings', 'lounge fit'), name: { en: 'Tunic Set', zh: '长衣套装' } },
      { img: P('mustard', 'knit top and pants', 'matching'), name: { en: 'Knit Top & Pants', zh: '针织上衣裤' } },
      { img: P('teal', 'lounge dress', 'sweater knit'), name: { en: 'Lounge Dress', zh: '家居连衣裙' } },
      { img: P('burgundy', 'knit set with belt', 'wrap style'), name: { en: 'Belted Knit Set', zh: '系带针织套装' } },
      { img: P('sand', 'oversized lounge set', 'boyfriend fit'), name: { en: 'Oversized Lounge Set', zh: '宽松家居套装' } },
      { img: P('charcoal', 'knit joggers', 'tapered leg'), name: { en: 'Knit Joggers', zh: '针织慢跑裤' } },
      { img: P('coral', 'cozy cardigan set', 'open front'), name: { en: 'Cozy Cardigan Set', zh: '舒适开衫套装' } },
      { img: P('slate', 'ribbed lounge set', 'crop and high waist'), name: { en: 'Ribbed Lounge Set', zh: '罗纹家居套装' } },
    ],
  },
  pet: {
    nameKey: 'categories.4.name',
    descKey: 'categories.4.desc',
    countKey: 'categories.4.count',
    cover: '/images/products/pet-clothes-1.jpg',
    items: [
      { img: '/images/products/pet/pet01.jpg', name: { en: 'Red Knit Sweater', zh: '红色针织衫' } },
      { img: '/images/products/pet/pet02.jpg', name: { en: 'Blue Knit Sweater', zh: '蓝色针织衫' } },
      { img: '/images/products/pet/pet03.jpg', name: { en: 'Pink Knit Sweater', zh: '粉色针织衫' } },
      { img: '/images/products/pet/pet04.jpg', name: { en: 'Striped Knit Sweater', zh: '条纹针织衫' } },
      { img: P('yellow', 'dog knit sweater', 'small breed'), name: { en: 'Yellow Dog Sweater', zh: '黄色狗毛衣' } },
      { img: P('green', 'dog cable knit sweater', 'medium breed'), name: { en: 'Cable Dog Sweater', zh: '麻花狗毛衣' } },
      { img: P('navy', 'dog striped sweater', 'crew neck'), name: { en: 'Navy Striped Sweater', zh: '海军蓝条纹' } },
      { img: P('cream', 'dog turtleneck sweater', 'rolled neck'), name: { en: 'Dog Turtleneck', zh: '狗狗高领' } },
      { img: P('brown', 'dog hooded sweater', 'kangaroo pocket'), name: { en: 'Dog Hooded Sweater', zh: '狗连帽毛衣' } },
      { img: P('teal', 'dog patterned sweater', 'geometric'), name: { en: 'Patterned Dog Sweater', zh: '花纹狗毛衣' } },
      { img: P('orange', 'dog fair isle sweater', 'Nordic'), name: { en: 'Fair Isle Dog Sweater', zh: '提花狗毛衣' } },
      { img: P('purple', 'dog knit vest', 'sleeveless'), name: { en: 'Dog Knit Vest', zh: '狗针织马甲' } },
      { img: P('white', 'dog star pattern sweater', 'cute'), name: { en: 'Star Pattern Sweater', zh: '星星图案毛衣' } },
      { img: P('charcoal', 'dog chunky knit sweater', 'warm'), name: { en: 'Chunky Dog Sweater', zh: '粗针狗毛衣' } },
      { img: P('burgundy', 'dog ribbed sweater', 'slim fit'), name: { en: 'Ribbed Dog Sweater', zh: '罗纹狗毛衣' } },
      { img: P('mint', 'dog polo sweater', 'collar detail'), name: { en: 'Dog Polo Sweater', zh: '狗Polo毛衣' } },
      { img: P('coral', 'cat knit sweater', 'small pet'), name: { en: 'Cat Knit Sweater', zh: '猫针织衫' } },
      { img: P('lavender', 'dog color block sweater', 'modern'), name: { en: 'Color Block Dog Sweater', zh: '拼色狗毛衣' } },
      { img: P('mustard', 'dog aran sweater', 'cable pattern'), name: { en: 'Aran Dog Sweater', zh: '阿兰狗毛衣' } },
      { img: P('sky blue', 'dog graphic sweater', 'cute print'), name: { en: 'Graphic Dog Sweater', zh: '图案狗毛衣' } },
    ],
  },
  accessories: {
    nameKey: 'categories.5.name',
    descKey: 'categories.5.desc',
    countKey: 'categories.5.count',
    cover: '/images/products/accessories-1.jpg',
    items: [
      { img: '/images/products/accessories/acc01.jpg', name: { en: 'Knit Accessories', zh: '针织配饰' } },
      { img: '/images/products/accessories/acc02.jpg', name: { en: 'Wool Scarf', zh: '羊毛围巾' } },
      { img: '/images/products/accessories/acc03.jpg', name: { en: 'Beanie Hat', zh: '针织帽' } },
      { img: '/images/products/accessories/acc04.jpg', name: { en: 'Knit Gloves', zh: '针织手套' } },
      { img: '/images/products/accessories/acc05.jpg', name: { en: 'Crochet Bag', zh: '钩织包' } },
      { img: '/images/products/accessories/acc06.jpg', name: { en: 'Knit Headband', zh: '针织发带' } },
      { img: P('cream', 'knit infinity scarf', 'chunky'), name: { en: 'Infinity Scarf', zh: '无限围巾' } },
      { img: P('grey', 'cable knit beanie', 'folded cuff'), name: { en: 'Cable Beanie', zh: '麻花毛线帽' } },
      { img: P('beige', 'fingerless gloves', 'mittens'), name: { en: 'Fingerless Gloves', zh: '半指手套' } },
      { img: P('navy', 'pom pom beanie', 'ribbed knit'), name: { en: 'Pom Pom Beanie', zh: '毛球帽' } },
      { img: P('black', 'knit neck warmer', 'cowl'), name: { en: 'Neck Warmer', zh: '保暖脖套' } },
      { img: P('olive', 'ear warmer band', 'fleece lined'), name: { en: 'Ear Warmer', zh: '保暖耳带' } },
      { img: P('camel', 'knit tote bag', 'cotton blend'), name: { en: 'Knit Tote Bag', zh: '针织托特包' } },
      { img: P('white', 'wrist warmers', 'ribbed cuff'), name: { en: 'Wrist Warmers', zh: '护腕' } },
      { img: P('burgundy', 'leg warmers', 'ribbed knit'), name: { en: 'Leg Warmers', zh: '护腿' } },
      { img: P('mustard', 'knit snood', 'circular'), name: { en: 'Knit Snood', zh: '筒状围巾' } },
      { img: P('teal', 'knit mittens', 'full finger'), name: { en: 'Knit Mittens', zh: '连指手套' } },
      { img: P('rust', 'knit cowl neck', 'loose drape'), name: { en: 'Cowl Neck', zh: '堆堆围巾' } },
      { img: P('sage', 'knit beret', 'French style'), name: { en: 'Knit Beret', zh: '针织贝雷帽' } },
      { img: P('charcoal', 'knit headwrap', 'wide band'), name: { en: 'Knit Headwrap', zh: '针织宽发带' } },
    ],
  },
};

const categoryKeys = ['womens', 'kids', 'mens', 'loungewear', 'pet', 'accessories'] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'products' });

  return {
    title: t('title') + ' - Yayuhong Knitwear',
    description: t('subtitle'),
  };
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'products' });

  return (
    <>
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

      <section className="py-16 bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoryKeys.map((key, index) => {
              const cat = allProducts[key];
              const name = t(cat.nameKey);
              const count = t(cat.countKey);
              return (
                <a
                  key={index}
                  href={`#category-${index}`}
                  className="bg-white rounded-xl overflow-hidden card-hover border border-[var(--color-border)]/50 block group"
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={cat.cover}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
                      <span className="text-white text-xs font-medium">{count}</span>
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <h4 className="font-semibold text-sm text-[var(--color-primary)]">
                      {name}
                    </h4>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-20 bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {categoryKeys.map((key, catIndex) => {
            const cat = allProducts[key];
            const name = t(cat.nameKey);
            const desc = t(cat.descKey);

            return (
              <div key={catIndex} id={`category-${catIndex}`}>
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary)] mb-2">
                      {name}
                    </h2>
                    <p className="text-[var(--color-text-secondary)]">{desc}</p>
                  </div>
                  <Link href="/contact" className="hidden sm:inline-flex text-[var(--color-accent)] font-medium text-sm hover:underline">
                    {locale === 'zh' ? '询价 →' : 'Get Quote →'}
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {cat.items.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl overflow-hidden card-hover border border-[var(--color-border)]/50 cursor-pointer group"
                    >
                      <div className="aspect-square overflow-hidden bg-[var(--color-warm-gray)]">
                        <img
                          src={item.img}
                          alt={`${name} - ${locale === 'zh' ? item.name.zh : item.name.en}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-[var(--color-primary)] truncate">
                          {locale === 'zh' ? item.name.zh : item.name.en}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          {locale === 'zh' ? '支持定制' : 'Customizable'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-dark)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {locale === 'zh' ? '没有找到合适的款式？' : "Can't find what you're looking for?"}
          </h2>
          <p className="text-white/70 text-lg mb-8">
            {locale === 'zh'
              ? '我们支持来图来样定制，专业设计团队为您量身打造'
              : 'We offer custom design services. Our professional team can bring your ideas to life.'}
          </p>
          <Link href="/contact" className="btn-primary !bg-white !text-[var(--color-primary)]">
            {locale === 'zh' ? '立即定制' : 'Customize Now'}
          </Link>
        </div>
      </section>

      <FloatingContact />
    </>
  );
}
