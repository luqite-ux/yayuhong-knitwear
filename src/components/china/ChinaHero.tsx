import Link from 'next/link';

export default function ChinaHero() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* 背景纹理 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 左侧文案 */}
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
              <span className="text-amber-300 text-sm font-medium">20年毛织行业经验 · 源头工厂直供</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              亚裕鸿毛织厂
              <span className="block text-2xl md:text-3xl lg:text-4xl text-amber-400 mt-3 font-normal">
                专业毛衣OEM · ODM定制
              </span>
            </h1>

            <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
              坐落于中国毛织重镇——广东汕头澄海。拥有完整的生产链条，从设计打样到大货生产，
              为国内外品牌、电商、批发商提供一站式毛衫定制服务。
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/contact" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-amber-500/25">
                立即咨询报价
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/products" className="inline-flex items-center gap-2 border border-slate-600 hover:border-slate-400 text-white font-medium px-8 py-3.5 rounded-xl transition-all">
                查看产品
              </Link>
            </div>

            {/* 核心数据 */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-700/50">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-amber-400">20+</div>
                <div className="text-sm text-slate-400 mt-1">年行业经验</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-amber-400">3万+</div>
                <div className="text-sm text-slate-400 mt-1">日产能（件）</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-amber-400">7天</div>
                <div className="text-sm text-slate-400 mt-1">快速打样</div>
              </div>
            </div>
          </div>

          {/* 右侧图片区 */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/images/hero/hero-main.jpg"
                alt="亚裕鸿毛织厂生产车间"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
            </div>

            {/* 浮动卡片：品质认证 */}
            <div className="absolute -left-6 top-8 bg-white text-slate-800 rounded-2xl px-5 py-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-lg">品质保障</div>
                  <div className="text-xs text-slate-500">全检品控 · 返修率&lt;1%</div>
                </div>
              </div>
            </div>

            {/* 浮动卡片：MOQ */}
            <div className="absolute -right-4 bottom-20 bg-white text-slate-800 rounded-2xl px-5 py-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">
                  📦
                </div>
                <div>
                  <div className="font-bold text-lg">小单快反</div>
                  <div className="text-xs text-slate-500">MOQ 50件起订</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部装饰条 */}
      <div className="bg-slate-950/50 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-6 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-amber-400">★</span>
              女装毛衫 / 童装毛衣 / 男装针织
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400">★</span>
              来图来样 / ODM设计 / OEM代工
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400">★</span>
              汕头澄海 · 自有工厂 · 支持验厂
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
