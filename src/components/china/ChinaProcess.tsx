const steps = [
  { num: '01', title: '需求沟通', desc: '客户提供款式图/样衣/参考图，确认面料、克重、数量等要求' },
  { num: '02', title: '报价打样', desc: '1-2个工作日出报价，确认后7天内完成打样，可寄样确认' },
  { num: '03', title: '确认样板', desc: '客户确认样板细节，如有调整免费修改一次，直到满意' },
  { num: '04', title: '大货生产', desc: '签订合同，支付定金，安排纱线采购，15-25天完成大货' },
  { num: '05', title: '质检发货', desc: '全检QC后包装，支持第三方验货，结清尾款发货' },
  { num: '06', title: '售后跟进', desc: '专人跟进售后反馈，持续优化品质，建立长期合作' },
];

export default function ChinaProcess() {
  return (
    <section className="py-20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-amber-400 font-medium text-sm tracking-wider">PROCESS</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            合作流程
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            标准化的合作流程，让每一步都清晰透明
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div
              key={i}
              className="relative bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:border-amber-500/30 transition-colors"
            >
              <div className="text-5xl font-bold text-amber-500/20 mb-4">
                {s.num}
              </div>
              <h3 className="text-xl font-bold mb-3 text-amber-400">
                {s.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {s.desc}
              </p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 text-amber-500/30 text-2xl">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
