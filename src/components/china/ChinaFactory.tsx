import Link from 'next/link';

export default function ChinaFactory() {
  return (
    <section className="py-20 bg-amber-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 左侧：图片拼贴 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="/images/hero/hero-main.jpg"
                  alt="工厂全貌"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-sm">
                  生产车间
                </div>
              </div>
            </div>
            <div className="space-y-4 pt-10">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-sm">
                  电脑横机
                </div>
              </div>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-lg">
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-sm">
                  后整车间
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：文案 */}
          <div>
            <span className="text-amber-600 font-medium text-sm tracking-wider">ABOUT FACTORY</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3 mb-6">
              20年毛织老厂<br />
              用匠心织好每一件毛衣
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                亚裕鸿毛织厂创立于2005年，坐落于中国毛织名镇——广东汕头澄海。
                二十年来，我们专注于毛衫的设计与生产，从最初的十几人小作坊发展到如今拥有300余台电脑横机、
                月产能超100万件的现代化针织企业。
              </p>
              <p>
                我们服务过国内外数百家品牌客户，产品涵盖女装毛衫、童装毛衣、男装针织等全品类。
                无论是高端精品还是快时尚爆款，我们都能以稳定的品质和合理的价格，为客户创造价值。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="text-3xl font-bold text-amber-600">2005</div>
                <div className="text-sm text-slate-500 mt-1">建厂年份</div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="text-3xl font-bold text-amber-600">300+</div>
                <div className="text-sm text-slate-500 mt-1">电脑横机</div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="text-3xl font-bold text-amber-600">100万+</div>
                <div className="text-sm text-slate-500 mt-1">月产能（件）</div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="text-3xl font-bold text-amber-600">500+</div>
                <div className="text-sm text-slate-500 mt-1">合作客户</div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/factory"
                className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold"
              >
                了解更多工厂实力
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
