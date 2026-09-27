import Link from 'next/link';

export default function ChinaFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* 公司信息 */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold">
                修
              </div>
              <div>
                <div className="font-bold text-white">亚裕鸿毛织厂</div>
                <div className="text-xs text-slate-500">Xiuyu Knitwear Factory</div>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              专注毛衫制造20年，提供OEM/ODM一站式服务。
              女装、童装、男装全品类毛衫定制，源头工厂直供。
            </p>
            <div className="flex gap-3">
              <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-amber-600 transition-colors cursor-pointer">
                <span className="text-sm">微</span>
              </div>
              <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-amber-600 transition-colors cursor-pointer">
                <span className="text-sm">抖</span>
              </div>
              <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-amber-600 transition-colors cursor-pointer">
                <span className="text-sm">1688</span>
              </div>
            </div>
          </div>

          {/* 产品分类 */}
          <div>
            <h4 className="text-white font-semibold mb-5">产品中心</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/products" className="hover:text-amber-400 transition-colors">女装毛衫</Link></li>
              <li><Link href="/products" className="hover:text-amber-400 transition-colors">童装毛衣</Link></li>
              <li><Link href="/products" className="hover:text-amber-400 transition-colors">男装针织</Link></li>
              <li><Link href="/products" className="hover:text-amber-400 transition-colors">秋冬外套</Link></li>
              <li><Link href="/products" className="hover:text-amber-400 transition-colors">春夏针织</Link></li>
            </ul>
          </div>

          {/* 服务项目 */}
          <div>
            <h4 className="text-white font-semibold mb-5">服务项目</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/services" className="hover:text-amber-400 transition-colors">OEM贴牌加工</Link></li>
              <li><Link href="/services" className="hover:text-amber-400 transition-colors">ODM设计开发</Link></li>
              <li><Link href="/services" className="hover:text-amber-400 transition-colors">小批量定制</Link></li>
              <li><Link href="/services" className="hover:text-amber-400 transition-colors">来图来样打版</Link></li>
              <li><Link href="/factory" className="hover:text-amber-400 transition-colors">工厂验厂参观</Link></li>
            </ul>
          </div>

          {/* 联系方式 */}
          <div>
            <h4 className="text-white font-semibold mb-5">联系我们</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>广东省汕头市澄海区<br />冠山南祥路30号</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>138-0013-8000</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>xiuyu@xiuyumaoshan.cn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 底部版权 */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <div>© 2025 亚裕鸿毛织厂 版权所有</div>
          <div className="flex gap-5">
            <Link href="/articles" className="hover:text-slate-300">行业资讯</Link>
            <Link href="/faq" className="hover:text-slate-300">常见问题</Link>
            <Link href="/contact" className="hover:text-slate-300">联系我们</Link>
            <a href="#" className="hover:text-slate-300">粤ICP备XXXXXXXX号</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
