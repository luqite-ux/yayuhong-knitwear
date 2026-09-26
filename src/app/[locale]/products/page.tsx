import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import FloatingContact from '@/components/FloatingContact';

const productCategories = [
  { 
    image: '/images/products/womens-sweater-1.jpg', 
    nameKey: 'categories.0.name', 
    descKey: 'categories.0.desc', 
    countKey: 'categories.0.count', 
    items: 6 
  },
  { 
    image: '/images/products/kids-sweater-1.jpg', 
    nameKey: 'categories.1.name', 
    descKey: 'categories.1.desc', 
    countKey: 'categories.1.count', 
    items: 6 
  },
  { 
    image: '/images/products/mens-sweater-1.jpg', 
    nameKey: 'categories.2.name', 
    descKey: 'categories.2.desc', 
    countKey: 'categories.2.count', 
    items: 6 
  },
  { 
    image: '/images/products/loungewear-1.jpg', 
    nameKey: 'categories.3.name', 
    descKey: 'categories.3.desc', 
    countKey: 'categories.3.count', 
    items: 6 
  },
  { 
    image: '/images/products/pet-clothes-1.jpg', 
    nameKey: 'categories.4.name', 
    descKey: 'categories.4.desc', 
    countKey: 'categories.4.count', 
    items: 6 
  },
  { 
    image: '/images/products/accessories-1.jpg', 
    nameKey: 'categories.5.name', 
    descKey: 'categories.5.desc', 
    countKey: 'categories.5.count', 
    items: 6 
  },
];

const styleNames = ['Crew Neck', 'V-Neck', 'Cardigan', 'Turtleneck', 'Hoodie', 'Oversized'];

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
      {/* Page Header */}
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

      {/* Categories */}
      <section className="py-16 bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {productCategories.map((cat, index) => {
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
                      src={cat.image} 
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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

      {/* Product details sections */}
      <section className="pb-20 bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {productCategories.map((cat, catIndex) => {
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
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {styleNames.map((style, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl overflow-hidden card-hover border border-[var(--color-border)]/50 cursor-pointer group"
                    >
                      <div className="aspect-square overflow-hidden bg-[var(--color-warm-gray)]">
                        <img 
                          src={cat.image} 
                          alt={`${name} - ${style}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-[var(--color-primary)] truncate">
                          {style}
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

      {/* CTA */}
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
