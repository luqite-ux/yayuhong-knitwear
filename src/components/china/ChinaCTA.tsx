import Link from 'next/link';

export default function ChinaCTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-amber-500 to-amber-600">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          有毛衫定制需求？
        </h2>
        <p className="text-amber-100 text-lg mb-8 max-w-2xl mx-auto">
          无论是来图来样、贴牌加工还是ODM开发，告诉我们您的需求，
          24小时内给您专业报价。
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-amber-600 hover:bg-amber-50 font-semibold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-lg"
          >
            立即咨询
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </Link>
          <a
            href="tel:+8613800138000"
            className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded-xl transition-all"
          >
            电话咨询
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
        </div>
        <div className="mt-8 text-amber-100 text-sm">
          微信同号 · 24小时在线 · 免费报价
        </div>
      </div>
    </section>
  );
}
