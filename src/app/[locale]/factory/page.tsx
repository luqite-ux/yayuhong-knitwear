import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import FloatingContact from '@/components/FloatingContact';
import { zhText } from '@/lib/zh-hant';
import { sql, deepParseJson } from '@/lib/db';
import { getCurrentSiteKey } from '@/lib/site';

export const dynamic = 'force-dynamic';

const features = [
  { icon: '🏭', key: 'features.0' },
  { icon: '👥', key: 'features.1' },
  { icon: '🔍', key: 'features.2' },
  { icon: '⚡', key: 'features.3' },
];

const equipmentList = [
  { name: '电脑横机', nameEn: 'Computerized Flat Knitting Machine', count: 200 },
  { name: '半自动横机', nameEn: 'Semi-automatic Flat Knitting Machine', count: 150 },
  { name: '缝合机', nameEn: 'Linking Machine', count: 80 },
  { name: '整烫设备', nameEn: 'Ironing Equipment', count: 50 },
  { name: '质检流水线', nameEn: 'QC Assembly Line', count: 6 },
  { name: '设计打版系统', nameEn: 'Design & Pattern System', count: 10 },
];

const processSteps = [
  { icon: '📐', title: '设计打版', titleEn: 'Design & Pattern', desc: '专业设计师根据需求设计款式，制作样板', descEn: 'Professional designers create styles and patterns based on requirements' },
  { icon: '🧶', title: '原料采购', titleEn: 'Material Sourcing', desc: '精选优质纱线，严格把控原料品质', descEn: 'Carefully selected high-quality yarns with strict quality control' },
  { icon: '🪡', title: '编织生产', titleEn: 'Knitting Production', desc: '熟练工人操作机器，高效生产', descEn: 'Skilled workers operating machines for efficient production' },
  { icon: '🔗', title: '缝合套口', titleEn: 'Linking & Seaming', desc: '精细缝合工艺，确保每一处接口牢固美观', descEn: 'Fine linking craftsmanship ensuring sturdy and beautiful seams' },
  { icon: '🔥', title: '整烫定型', titleEn: 'Ironing & Shaping', desc: '专业整烫工艺，塑造完美版型', descEn: 'Professional ironing process for perfect shaping' },
  { icon: '✅', title: '质检包装', titleEn: 'QC & Packaging', desc: '三道质检工序，确保每一件产品合格', descEn: 'Three QC stages ensuring every piece meets standards' },
];

async function fetchFactoryData(siteKey: string) {
  try {
    const [equipments, processes] = await Promise.all([
      sql`
        select id, name, quantity, icon_key, sort
        from content_factory_equipments
        where is_active = true
          and sites && array['global', ${siteKey}]::text[]
        order by sort, id asc
      `,
      sql`
        select id, title, description, step_number, icon_key, sort
        from content_factory_processes
        where is_active = true
          and sites && array['global', ${siteKey}]::text[]
        order by sort, step_number, id asc
      `,
    ]);

    const parsedEquipments = (equipments as any[]).map((e) => ({
      name: (deepParseJson(e.name) as Record<string, string>)?.zh || '',
      nameEn: (deepParseJson(e.name) as Record<string, string>)?.en || '',
      count: e.quantity || 0,
    }));

    const defaultIcons = ['📐', '🧶', '🪡', '🔗', '🔥', '✅', '📦', '🎨'];
    const parsedProcesses = (processes as any[]).map((p, i) => {
      const title = deepParseJson(p.title) as Record<string, string>;
      const desc = deepParseJson(p.description) as Record<string, string>;
      return {
        icon: p.icon_key || defaultIcons[i % defaultIcons.length],
        title: title?.zh || '',
        titleEn: title?.en || '',
        desc: desc?.zh || '',
        descEn: desc?.en || '',
      };
    });

    if (parsedEquipments.length === 0 && parsedProcesses.length === 0) return null;

    return {
      equipments: parsedEquipments.length > 0 ? parsedEquipments : null,
      processes: parsedProcesses.length > 0 ? parsedProcesses : null,
    };
  } catch (err) {
    console.error('Failed to fetch factory data from DB:', err);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'factory' });
  
  return {
    title: t('title') + ' - Yayuhong Knitwear',
    description: t('subtitle'),
  };
}

export default async function FactoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'factory' });
  const siteKey = await getCurrentSiteKey();

  // 尝试从数据库读取，失败则用兜底数据
  const dbData = await fetchFactoryData(siteKey);
  const equipmentData = dbData?.equipments || equipmentList;
  const processData = dbData?.processes || processSteps;

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

      {/* About Section */}
      <section className="py-20 bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-3xl aspect-[4/3] overflow-hidden shadow-xl">
              <img 
                src="/images/factory/factory-workshop.jpg" 
                alt="Factory workshop"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium mb-4">
                {zhText(locale, '关于我们', 'About Us')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)] mb-6">
                {zhText(locale, '20年匠心制造，专注每一针一线', '20 Years of Craftsmanship, Stitch by Stitch')}
              </h2>
              <div className="space-y-4 text-[var(--color-text-secondary)] leading-relaxed">
                <p>
                  {zhText(
                    locale,
                    '亚裕鸿毛织厂坐落于中国毛织名镇——广东省汕头市澄海区，这里拥有近40年的工艺毛衫生产历史，是全国重要的毛衫生产基地。',
                    'Yayuhong Knitwear Factory is located in Chenghai District, Shantou City, Guangdong Province - a famous knitwear town in China with nearly 40 years of craftsmanship sweater production history.',
                  )}
                </p>
                <p>
                  {zhText(
                    locale,
                    '工厂成立于2004年，经过20年的发展，目前拥有核心技术人员20人，加工工区30个，日产毛衫30000件。我们始终坚持"品质第一、客户至上"的经营理念，为全球客户提供优质的毛织产品和服务。',
                    'Founded in 2004, after 20 years of development, we now have 20 core technicians and 30 production workshops, with a daily capacity of 30,000 sweaters. We always adhere to the "Quality First, Customer First" business philosophy.',
                  )}
                </p>
                <p>
                  {zhText(
                    locale,
                    '我们的产品远销欧美、东南亚、中东等全球多个国家和地区，是众多知名快时尚品牌和电商平台的核心供应商。',
                    'Our products are exported to Europe, America, Southeast Asia, the Middle East and many other countries and regions. We are a core supplier to many well-known fast fashion brands and e-commerce platforms.',
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-4">
              {zhText(locale, '我们的优势', 'Our Strengths')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, index) => {
              const title = t(`${feat.key}.title`);
              const desc = t(`${feat.key}.desc`);
              return (
                <div key={index} className="bg-[var(--color-warm-gray)] rounded-2xl p-6 text-center">
                  <div className="text-4xl mb-4">{feat.icon}</div>
                  <h3 className="font-bold text-[var(--color-primary)] mb-2">{title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Equipment */}
      <section className="py-20 bg-[var(--color-warm-gray)] knit-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-4">
              {zhText(locale, '生产设备', 'Production Equipment')}
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              {zhText(
                locale,
                '配备先进的生产设备，确保高效稳定的产能和卓越的产品品质',
                'Equipped with advanced production equipment to ensure efficient and stable capacity with excellent product quality',
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {equipmentData.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center card-hover">
                <div className="text-3xl font-bold text-gold-gradient mb-2">
                  {item.count}+
                </div>
                <p className="text-sm font-medium text-[var(--color-primary)]">
                  {zhText(locale, item.name, item.nameEn)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Production Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-4">
              {zhText(locale, '生产流程', 'Production Process')}
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              {zhText(
                locale,
                '6道核心工序，层层把控，确保每一件产品都达到最高品质标准',
                '6 core processes with layered control ensuring every product meets the highest quality standards',
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {processData.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center text-2xl text-white mb-4">
                  {step.icon}
                </div>
                <h4 className="font-semibold text-[var(--color-primary)] mb-2">
                  {zhText(locale, step.title, step.titleEn)}
                </h4>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {zhText(locale, step.desc, step.descEn)}
                </p>
                {index < processData.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-3 text-[var(--color-border)]">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-dark)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {zhText(locale, '想实地参观我们的工厂？', 'Want to visit our factory?')}
          </h2>
          <p className="text-white/70 text-lg mb-8">
            {zhText(
              locale,
              '欢迎预约实地参观，亲眼见证我们的生产实力和品质管控',
              'Schedule a visit to see our production capacity and quality control firsthand',
            )}
          </p>
          <Link href="/contact" className="btn-primary !bg-white !text-[var(--color-primary)]">
            {zhText(locale, '预约参观', 'Schedule a Visit')}
          </Link>
        </div>
      </section>

      <FloatingContact />
    </>
  );
}
