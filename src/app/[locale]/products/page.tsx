import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import FloatingContact from '@/components/FloatingContact';
import ProductGrid from '@/components/ProductGrid';
import { zhText } from '@/lib/zh-hant';
import { type ProductItem } from '@/components/ProductDetailModal';

export const dynamic = 'force-dynamic';

const A = (id: string, suffix = 'UL640') => `https://m.media-amazon.com/images/I/${id}._AC_${suffix}_.jpg`;

const AE = (hash: string) => `https://ae-pic-a1.aliexpress-media.com/kf/${hash}.jpg_480x480q75.jpg_.webp`;

const fallbackProducts = {
  womens: {
    nameKey: 'categories.0.name',
    descKey: 'categories.0.desc',
    countKey: 'categories.0.count',
    cover: A('71WfBqJdQOL'),
    items: [
      { img: A('71WfBqJdQOL'), name: { en: 'Cable Knit Sweater Dress', zh: '绞花针织毛衣连衣裙' }, material: { en: '100% Acrylic', zh: '100%腈纶' } },
      { img: A('61tBZJwYj-L'), name: { en: 'Turtleneck Pullover Sweater', zh: '高领套头毛衣' }, material: { en: 'Soft Viscose Blend', zh: '柔软粘胶混纺' } },
      { img: A('714kL5pLmKL'), name: { en: 'Oversized Cardigan', zh: '宽松开衫外套' }, material: { en: 'Chunky Knit', zh: '粗针针织' } },
      { img: A('61MZR3D6FJL'), name: { en: 'Cropped Knit Top', zh: '短款针织上衣' }, material: { en: 'Ribbed Knit', zh: '罗纹针织' } },
      { img: A('71oGkM6ZpKL'), name: { en: 'Mohair Blend Sweater', zh: '马海毛混纺毛衣' }, material: { en: 'Mohair Blend', zh: '马海毛混纺' } },
      { img: A('61ZJ2Lq6CwL'), name: { en: 'V-Neck Knit Vest', zh: 'V领针织马甲' }, material: { en: 'Wool Blend', zh: '羊毛混纺' } },
      { img: A('71m5FqXl5QL'), name: { en: 'Balloon Sleeve Sweater', zh: '灯笼袖毛衣' }, material: { en: 'Soft Acrylic', zh: '柔软腈纶' } },
      { img: A('61qT2W7kTNL'), name: { en: 'Houndstooth Cardigan', zh: '千鸟格开衫' }, material: { en: 'Wool Blend', zh: '羊毛混纺' } },
      { img: A('71zXK3pXsQL'), name: { en: 'Mock Neck Sweater', zh: '半高领毛衣' }, material: { en: 'Cashmere Feel', zh: '羊绒手感' } },
      { img: A('61HkK4ZzKpL'), name: { en: 'Argyle Pullover', zh: '菱格纹套头衫' }, material: { en: 'Cotton Blend', zh: '棉混纺' } },
      { img: A('71B5J8fKjAL'), name: { en: 'Puff Sleeve Cardigan', zh: '泡泡袖开衫' }, material: { en: 'Soft Knit', zh: '柔软针织' } },
      { img: A('61sN9G3QjKL'), name: { en: 'Striped Knit Dress', zh: '条纹针织连衣裙' }, material: { en: 'Ribbed Knit', zh: '罗纹针织' } },
      { img: A('71X25Kq2fTL'), name: { en: 'Off Shoulder Sweater', zh: '露肩毛衣' }, material: { en: 'Soft Acrylic', zh: '柔软腈纶' } },
      { img: A('61wV5c7fGRL'), name: { en: 'Fair Isle Sweater', zh: '费尔岛毛衣' }, material: { en: 'Wool Blend', zh: '羊毛混纺' } },
      { img: A('71pQ4LcM6fL'), name: { en: 'Wrap Cardigan', zh: '裹身开衫' }, material: { en: 'Soft Knit', zh: '柔软针织' } },
      { img: A('61gL5ZXJ4TL'), name: { en: 'Crop Knit Cardigan', zh: '短款针织开衫' }, material: { en: 'Ribbed Knit', zh: '罗纹针织' } },
      { img: A('71n8J5KqRvL'), name: { en: 'Tunic Sweater', zh: '长款毛衣' }, material: { en: 'Soft Acrylic', zh: '柔软腈纶' } },
      { img: A('61JKSq7rXqL'), name: { en: 'Cowl Neck Sweater', zh: '堆堆领毛衣' }, material: { en: 'Chunky Knit', zh: '粗针针织' } },
      { img: A('71Dk4wJfqZL'), name: { en: 'Peplum Knit Top', zh: '荷叶边针织上衣' }, material: { en: 'Ribbed Knit', zh: '罗纹针织' } },
      { img: A('61M4VwfqNLL'), name: { en: 'Longline Cardigan', zh: '长款开衫' }, material: { en: 'Soft Knit', zh: '柔软针织' } },
    ],
  },
  kids: {
    nameKey: 'categories.1.name',
    descKey: 'categories.1.desc',
    countKey: 'categories.1.count',
    cover: A('71g3KqZJw-L'),
    items: [
      { img: A('71g3KqZJw-L'), name: { en: 'Kids Cable Knit Sweater', zh: '儿童绞花毛衣' }, material: { en: 'Cotton Blend', zh: '棉混纺' } },
      { img: A('61MZpQwZXfL'), name: { en: 'Toddler Turtleneck', zh: '幼儿高领毛衣' }, material: { en: 'Soft Cotton', zh: '柔软棉' } },
      { img: A('714LwVq5sQL'), name: { en: 'Kids Hooded Cardigan', zh: '儿童连帽开衫' }, material: { en: 'Fleece Lined', zh: '加绒内衬' } },
      { img: A('61fwZcKJfGL'), name: { en: 'Kids Striped Sweater', zh: '儿童条纹毛衣' }, material: { en: 'Cotton Blend', zh: '棉混纺' } },
      { img: A('71zZp3KJnQL'), name: { en: 'Baby Knit Set', zh: '婴儿针织套装' }, material: { en: '100% Cotton', zh: '100%棉' } },
      { img: A('61QVpLKJSSL'), name: { en: 'Kids Fair Isle Sweater', zh: '儿童费尔岛毛衣' }, material: { en: 'Acrylic Blend', zh: '腈纶混纺' } },
      { img: A('71X3pJwqRkL'), name: { en: 'Toddler Cardigan', zh: '幼儿开衫' }, material: { en: 'Soft Cotton', zh: '柔软棉' } },
      { img: A('61nJwZgJ3VL'), name: { en: 'Kids Pullover Set', zh: '儿童套头套装' }, material: { en: 'Cotton Blend', zh: '棉混纺' } },
      { img: A('71sLk5LJzKL'), name: { en: 'Baby Romper Knit', zh: '婴儿针织连体衣' }, material: { en: '100% Cotton', zh: '100%棉' } },
      { img: A('61wJp4KqJnL'), name: { en: 'Kids Zip Up Sweater', zh: '儿童拉链毛衣' }, material: { en: 'Fleece Lined', zh: '加绒内衬' } },
      { img: A('71gLQqJqfFL'), name: { en: 'Kids Cable Dress', zh: '儿童绞花连衣裙' }, material: { en: 'Cotton Blend', zh: '棉混纺' } },
      { img: A('61TZwKqJ9PL'), name: { en: 'Toddler Vest', zh: '幼儿马甲' }, material: { en: 'Warm Knit', zh: '保暖针织' } },
    ],
  },
  mens: {
    nameKey: 'categories.2.name',
    descKey: 'categories.2.desc',
    countKey: 'categories.2.count',
    cover: A('713vq5n8GqL'),
    items: [
      { img: A('713vq5n8GqL'), name: { en: 'Men Crew Neck Sweater', zh: '男士圆领毛衣' }, material: { en: 'Cotton Blend', zh: '棉混纺' } },
      { img: A('61kL9wLq7tL'), name: { en: 'Men V-Neck Pullover', zh: '男士V领套头衫' }, material: { en: 'Wool Blend', zh: '羊毛混纺' } },
      { img: A('71fMwqJtSrL'), name: { en: 'Men Full Zip Cardigan', zh: '男士全拉链开衫' }, material: { en: 'Fleece Lined', zh: '加绒内衬' } },
      { img: A('61sZ4KJj5gL'), name: { en: 'Men Turtleneck Sweater', zh: '男士高领毛衣' }, material: { en: 'Soft Acrylic', zh: '柔软腈纶' } },
      { img: A('71Qq8ZKJnBL'), name: { en: 'Men Cable Knit Sweater', zh: '男士绞花毛衣' }, material: { en: '100% Cotton', zh: '100%棉' } },
      { img: A('61qN5wLqVkL'), name: { en: 'Men Henley Sweater', zh: '男士亨利领毛衣' }, material: { en: 'Cotton Blend', zh: '棉混纺' } },
      { img: A('71nLwZQq8LL'), name: { en: 'Men Shawl Collar Cardigan', zh: '男士青果领开衫' }, material: { en: 'Wool Blend', zh: '羊毛混纺' } },
      { img: A('61TQq2KJp9L'), name: { en: 'Men Half Zip Sweater', zh: '男士半拉链毛衣' }, material: { en: 'Soft Knit', zh: '柔软针织' } },
      { img: A('71pJ4wKj3wL'), name: { en: 'Men Argyle Sweater Vest', zh: '男士菱格毛背心' }, material: { en: 'Wool Blend', zh: '羊毛混纺' } },
      { img: A('61wL5qJjHvL'), name: { en: 'Men Ribbed Mock Neck', zh: '男士半高领罗纹衫' }, material: { en: 'Cotton Blend', zh: '棉混纺' } },
      { img: A('71ZJw6KqL9L'), name: { en: 'Men Chunky Knit Sweater', zh: '男士粗针毛衣' }, material: { en: 'Acrylic Wool', zh: '腈纶羊毛' } },
      { img: A('61gLJ4wJq5L'), name: { en: 'Men Striped Crewneck', zh: '男士条纹圆领衫' }, material: { en: 'Cotton Blend', zh: '棉混纺' } },
      { img: A('71kKp8LJqQL'), name: { en: 'Men Merino Wool Sweater', zh: '男士美丽诺羊毛衫' }, material: { en: '100% Merino', zh: '100%美丽诺' } },
      { img: A('61Ddw3ZJkKL'), name: { en: 'Men Cashmere Blend Sweater', zh: '男士羊绒混纺毛衣' }, material: { en: 'Cashmere Blend', zh: '羊绒混纺' } },
      { img: A('71wNq5Kj2vL'), name: { en: 'Men Baseball Cardigan', zh: '男士棒球开衫' }, material: { en: 'Fleece Lined', zh: '加绒内衬' } },
    ],
  },
  loungewear: {
    nameKey: 'categories.3.name',
    descKey: 'categories.3.desc',
    countKey: 'categories.3.count',
    cover: A('71V7sZnGqgL'),
    items: [
      { img: A('71V7sZnGqgL'), name: { en: '2-Piece Knit Lounge Set', zh: '两件套针织家居服' }, material: { en: 'Soft Ribbed Knit', zh: '柔软罗纹针织' } },
      { img: A('61mV7zKjB-L'), name: { en: 'Cozy Cardigan Set', zh: '舒适开衫套装' }, material: { en: 'Chunky Knit', zh: '粗针针织' } },
      { img: A('71nLp2DjqLL'), name: { en: 'Knit Loungewear Set', zh: '针织家居套装' }, material: { en: 'Soft Acrylic', zh: '柔软腈纶' } },
      { img: A('61Sq6BkJfLL'), name: { en: 'Ribbed Knit Pajamas', zh: '罗纹针织睡衣' }, material: { en: 'Cotton Blend', zh: '棉混纺' } },
      { img: A('71wZq8LJvQL'), name: { en: 'Oversized Knit Set', zh: '宽松针织套装' }, material: { en: 'Soft Knit', zh: '柔软针织' } },
      { img: A('61gLvZQjXKL'), name: { en: 'Knit Robe & Gown Set', zh: '针织睡袍套装' }, material: { en: 'Warm Knit', zh: '保暖针织' } },
    ],
  },
  pet: {
    nameKey: 'categories.4.name',
    descKey: 'categories.4.desc',
    countKey: 'categories.4.count',
    cover: AE('S65cc01234567456789abcdef012345673'),
    items: [
      { img: AE('S65cc01234567456789abcdef012345673'), name: { en: 'Dog Cable Knit Sweater', zh: '狗狗绞花毛衣' }, material: { en: 'Acrylic Knit', zh: '腈纶针织' } },
      { img: AE('Hf8cc5e1234567890abcdef1234567890b'), name: { en: 'Cat Turtleneck Sweater', zh: '猫咪高领毛衣' }, material: { en: 'Soft Knit', zh: '柔软针织' } },
      { img: AE('Jd7ff0abcdef1234567890abcdef123456a'), name: { en: 'Pet Christmas Sweater', zh: '宠物圣诞毛衣' }, material: { en: 'Acrylic Knit', zh: '腈纶针织' } },
      { img: AE('Gb6aa345678901234567890abcdef12345c'), name: { en: 'Dog Hoodie Knitwear', zh: '狗狗连帽针织衫' }, material: { en: 'Fleece Lined', zh: '加绒内衬' } },
      { img: AE('Ed9bb78901234567890abcdef12345678d'), name: { en: 'Pet Cardigan', zh: '宠物开衫' }, material: { en: 'Soft Knit', zh: '柔软针织' } },
      { img: AE('Fa2cc1234567890abcdef1234567890e'), name: { en: 'Dog Striped Sweater', zh: '狗狗条纹毛衣' }, material: { en: 'Cotton Blend', zh: '棉混纺' } },
    ],
  },
  accessories: {
    nameKey: 'categories.5.name',
    descKey: 'categories.5.desc',
    countKey: 'categories.5.count',
    cover: A('61T8JZLqNcL'),
    items: [
      { img: A('61T8JZLqNcL'), name: { en: 'Knit Beanie Hat', zh: '针织冷帽' }, material: { en: 'Acrylic Knit', zh: '腈纶针织' } },
      { img: A('71wLpZQjKvL'), name: { en: 'Cable Knit Scarf', zh: '绞花针织围巾' }, material: { en: 'Soft Acrylic', zh: '柔软腈纶' } },
      { img: A('61nJw5KqJpL'), name: { en: 'Knit Gloves', zh: '针织手套' }, material: { en: 'Warm Knit', zh: '保暖针织' } },
      { img: A('71gLQqRjNtL'), name: { en: 'Infinity Scarf', zh: '围脖' }, material: { en: 'Chunky Knit', zh: '粗针针织' } },
      { img: A('61Sq9BkLv9L'), name: { en: 'Pom Pom Beanie', zh: '毛球针织帽' }, material: { en: 'Acrylic Knit', zh: '腈纶针织' } },
      { img: A('71X5pZwQj7L'), name: { en: 'Fingerless Gloves', zh: '半指手套' }, material: { en: 'Ribbed Knit', zh: '罗纹针织' } },
      { img: A('61MZw2KjSrL'), name: { en: 'Knit Headband', zh: '针织发带' }, material: { en: 'Soft Knit', zh: '柔软针织' } },
      { img: A('71ZJp3LqR6L'), name: { en: 'Ear Warmer Headband', zh: '护耳发带' }, material: { en: 'Fleece Lined', zh: '加绒内衬' } },
    ],
  },
};

const categoryKeys = ['womens', 'kids', 'mens', 'loungewear', 'pet', 'accessories'];

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'products' });

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[var(--color-accent)] blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">{t('hero.title')}</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">{t('hero.subtitle')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="inline-flex items-center px-8 py-3 bg-[var(--color-accent)] text-[var(--color-primary)] font-semibold rounded-full hover:bg-white transition-colors">
              {t('hero.cta')}
            </Link>
            <Link href="#categories" className="inline-flex items-center px-8 py-3 border-2 border-white/50 text-white font-semibold rounded-full hover:bg-white/10 transition-colors">
              {t('hero.viewAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* Category Quick Nav */}
      <section id="categories" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categoryKeys.map((key, i) => {
              const cat = fallbackProducts[key as keyof typeof fallbackProducts];
              const name = t(cat.nameKey);
              return (
                <a
                  key={i}
                  href={`#category-${i}`}
                  className="flex flex-col items-center p-4 rounded-xl bg-[var(--color-cream)] hover:bg-[var(--color-primary)]/5 transition-colors group"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-3 ring-2 ring-transparent group-hover:ring-[var(--color-accent)] transition-all">
                    <img
                      src={cat.cover}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-[var(--color-primary)] text-center">
                    {name}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <ProductGrid
        categories={fallbackProducts as any}
        categoryKeys={categoryKeys}
        t={t}
        locale={locale}
      />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('cta.title')}</h2>
          <p className="text-lg text-white/80 mb-8">{t('cta.subtitle')}</p>
          <Link href="/contact" className="inline-flex items-center px-10 py-4 bg-[var(--color-accent)] text-[var(--color-primary)] font-semibold rounded-full text-lg hover:bg-white transition-colors">
            {t('cta.button')}
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      <FloatingContact />
    </>
  );
}
