const advantages = [
  {
    icon: '🏭',
    title: '源头工厂',
    desc: '自有生产基地，300+台电脑横机，从纱线到成品一站式交付，省去中间环节',
  },
  {
    icon: '🎨',
    title: '设计研发',
    desc: '资深设计团队，每年推出500+新款，支持来图来样定制、ODM贴牌开发',
  },
  {
    icon: '⚡',
    title: '快速反应',
    desc: '7天出样，15-25天大货交付，小单快反模式，适应电商快节奏补货需求',
  },
  {
    icon: '✅',
    title: '品质保证',
    desc: '五道质检工序，全检出厂。支持第三方验货，长期合作客户返修率低于1%',
  },
  {
    icon: '💰',
    title: '价格优势',
    desc: '工厂直供，同等品质价格低10-20%。量大价优，支持阶梯报价',
  },
  {
    icon: '🤝',
    title: '诚信服务',
    desc: '20年老厂，客户复购率90%以上。专人一对一跟进，沟通高效响应及时',
  },
];

export default function ChinaAdvantages() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-amber-600 font-medium text-sm tracking-wider">WHY CHOOSE US</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3 mb-4">
            为什么选择亚裕鸿毛织厂？
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            二十年专注毛衫制造，用实力说话，用品质赢得客户信赖
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.map((item, i) => (
            <div
              key={i}
              className="group bg-slate-50 hover:bg-amber-50 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-slate-100 hover:border-amber-200"
            >
              <div className="text-4xl mb-5">{item.icon}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-amber-700 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
