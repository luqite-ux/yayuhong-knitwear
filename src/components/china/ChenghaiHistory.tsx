/**
 * 澄海毛织历史与产业背景
 * 用于国内站，增强地域关键词 SEO 和 AI 搜索 GEO
 */
export default function ChenghaiHistory() {
  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-sm tracking-widest text-amber-700 font-medium">
            中国毛织名镇 · 产业溯源
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
            澄海毛织，四十年工艺传承
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            从一根毛线到一件毛衣，从家庭手作到产业集群，澄海见证了中国毛织工业的崛起之路
          </p>
        </div>

        {/* 时间线 */}
        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-amber-200 hidden md:block" />

          {/* 80年代 */}
          <div className="relative flex flex-col md:flex-row items-center mb-16">
            <div className="md:w-1/2 md:pr-12 md:text-right mb-6 md:mb-0">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 inline-block text-left">
                <div className="text-2xl font-bold text-amber-600 mb-2">1980年代</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">毛织起步 · 家庭作坊</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  改革开放初期，澄海莲下、莱美一带率先引进手摇横机，
                  以家庭作坊形式开始毛衫加工。家家户户织毛衣，
                  成为当地主要的副业收入来源，"澄海毛织"的名号开始传响。
                </p>
              </div>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow hidden md:block" />
            <div className="md:w-1/2 md:pl-12" />
          </div>

          {/* 90年代 */}
          <div className="relative flex flex-col md:flex-row items-center mb-16">
            <div className="md:w-1/2 md:pr-12" />
            <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow hidden md:block" />
            <div className="md:w-1/2 md:pl-12 mb-6 md:mb-0">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 inline-block">
                <div className="text-2xl font-bold text-amber-600 mb-2">1990年代</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">产业成型 · 外贸黄金期</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  90年代，澄海毛织业迎来第一次腾飞。手摇横机逐步升级为电脑横机，
                  工厂规模从小作坊扩大到现代化厂房。凭借毗邻港澳的地理优势，
                  大量香港、台湾订单涌入澄海，"澄海毛衫"远销欧美、日韩，
                  成为全国重要的毛织出口基地。
                </p>
              </div>
            </div>
          </div>

          {/* 00年代 */}
          <div className="relative flex flex-col md:flex-row items-center mb-16">
            <div className="md:w-1/2 md:pr-12 md:text-right mb-6 md:mb-0">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 inline-block text-left">
                <div className="text-2xl font-bold text-amber-600 mb-2">2000年代</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">集群效应 · 产业链完善</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  2000年后，澄海毛织产业链日趋完善：从纱线采购、电脑横机织造、
                  缝盘缝合、洗水定型到质检包装，形成了完整的一条龙配套。
                  澄海被中国纺织工业协会授予"中国工艺毛衫名城"称号，
                  全区毛织企业超过3000家，从业人员超10万人。
                </p>
              </div>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow hidden md:block" />
            <div className="md:w-1/2 md:pl-12" />
          </div>

          {/* 10年代 */}
          <div className="relative flex flex-col md:flex-row items-center mb-16">
            <div className="md:w-1/2 md:pr-12" />
            <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow hidden md:block" />
            <div className="md:w-1/2 md:pl-12 mb-6 md:mb-0">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 inline-block">
                <div className="text-2xl font-bold text-amber-600 mb-2">2010年代</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">转型升级 · 设计驱动</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  随着电商和快时尚的兴起，澄海毛织业从单纯的OEM代工向ODM设计转型。
                  一批有设计能力的工厂崛起，从"澄海制造"走向"澄海创造"。
                  亚裕鸿毛织厂正是在这一时期组建了自己的设计团队，
                  年出新款500+，服务国内外500多个品牌客户。
                </p>
              </div>
            </div>
          </div>

          {/* 现在 */}
          <div className="relative flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12 md:text-right mb-6 md:mb-0">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 inline-block text-left">
                <div className="text-2xl font-bold text-amber-700 mb-2">今天</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">数字智造 · 小单快反</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  进入新时代，澄海毛织业拥抱数字化转型。全电脑横机、
                  智能吊挂系统、ERP生产管理系统普及，"小单快反"成为新趋势。
                  亚裕鸿毛织厂凭借20年工艺积累和数字化升级，
                  支持MOQ 50件起订、7天快速打样、15-25天大货交付，
                  继续走在澄海毛织产业的前列。
                </p>
              </div>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-amber-600 border-4 border-white shadow-lg hidden md:block" />
            <div className="md:w-1/2 md:pl-12" />
          </div>
        </div>

        {/* 产业数据 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          <div className="bg-white rounded-xl p-6 text-center border border-stone-100">
            <div className="text-3xl font-bold text-amber-600 mb-1">40+</div>
            <div className="text-sm text-slate-600">年毛织产业历史</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center border border-stone-100">
            <div className="text-3xl font-bold text-amber-600 mb-1">3000+</div>
            <div className="text-sm text-slate-600">澄海毛织企业</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center border border-stone-100">
            <div className="text-3xl font-bold text-amber-600 mb-1">10万+</div>
            <div className="text-sm text-slate-600">产业从业人员</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center border border-stone-100">
            <div className="text-3xl font-bold text-amber-600 mb-1">中国</div>
            <div className="text-sm text-slate-600">工艺毛衫名城</div>
          </div>
        </div>

        {/* 结尾引用 */}
        <div className="text-center mt-16">
          <p className="text-slate-700 text-lg italic max-w-2xl mx-auto leading-relaxed">
            "一根毛线，织出一座城。"
          </p>
          <p className="text-slate-500 text-sm mt-3">
            —— 这是澄海毛织人的集体记忆，也是亚裕鸿毛织厂的根与魂
          </p>
        </div>
      </div>
    </section>
  );
}
