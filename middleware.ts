import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './src/i18n/routing';
import { detectSiteKey } from './src/lib/site';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const siteKey = detectSiteKey(host);
  const { pathname } = request.nextUrl;

  // 跳过：静态资源、api、admin、_next、_vercel 等
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname === '/llms.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname.includes('.') // 带扩展名的静态文件
  ) {
    return NextResponse.next();
  }

  // 国内站：单语言简体，无 locale 前缀
  // 把 /xxx 内部重写到 /zh/xxx
  if (siteKey === 'china') {
    if (pathname === '/zh-TW' || pathname.startsWith('/zh-TW/')) {
      const rest = pathname.slice('/zh-TW'.length) || '/';
      const newUrl = request.nextUrl.clone();
      newUrl.pathname = rest;
      return NextResponse.redirect(newUrl);
    }
    // 如果已经有 /zh/ 前缀（直接访问的），继续走 intl middleware
    if (pathname.startsWith('/zh/') || pathname === '/zh') {
      return intlMiddleware(request);
    }
    // 重写到 /zh 路径
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = `/zh${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(newUrl);
  }

  // 海外站：正常多语言 middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/(zh-TW|zh|en|ru|es|de|fr|pt|ja|ar|vn)/:path*',
    '/((?!_next|_vercel|admin|api|llms\\.txt|sitemap\\.xml|robots\\.txt|.*\\..*).*)',
  ],
};
