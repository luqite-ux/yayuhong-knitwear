import Link from 'next/link';

const services = [
  {
    title: 'OEM 贴牌加工',
    desc: '来图来样加工，客户提供设计稿或样衣，我们按图/按样生产，贴客户品牌',
    tags: ['来图加工', '来样加工', '贴牌生产'],
    icon: '📝',
  },
  {
    title: 'ODM 设计开发',
    desc: '客户只需提供品类、风格或参考图，我们独立完成设计开发、打样到大货',
    tags: ['款式设计', '花型开发', '全套ODM'],
    icon: '🎨',
  },
  {
    title: '小批量定制',
    desc: '支持小单快反，50件起订。适合电商测款、小众品牌、创业起步客户',
    tags: ['MOQ 50件', '快速翻单', '灵活生产'],
    icon: '📦',
  },
  {
    title: '品牌大单合作',
    desc: '长期服务国内外知名品牌，月产能100万件，满足大单量稳定交付需求',
    tags: ['稳定产能', '品质管控', '长期合作'],
    icon: '🏢',
  },
];

export default function ChinaServices() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-amber-600 font-medium text-sm tracking-wider">OUR SERVICES</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3 mb-4">
            服务范围
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            全方位毛衫定制服务，满足不同客户的合作需求
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-5">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                  {s.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {s.tags.map((tag, j) => (
                      <span
                        key={j}
                        className="text-xs px-3 py-1 bg-slate-100 text-slate-600 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-8 py-3.5 rounded-xl transition-all"
          >
            了解更多合作方式
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
