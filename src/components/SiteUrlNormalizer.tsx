'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * 国内站 URL 规范化：
 * 如果访问的是 xiuyumaoshan.cn 且路径以 /zh 开头，
 * 自动替换为无前缀版本（保持 URL 干净）
 */
export default function SiteUrlNormalizer() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const host = window.location.hostname;
    const isChinaSite = host.includes('xiuyumaoshan.cn');
    if (!isChinaSite) return;

    // 如果路径以 /zh 开头，替换为无前缀版本
    if (pathname === '/zh' || pathname.startsWith('/zh/')) {
      const newPath = pathname === '/zh' ? '/' : pathname.slice(3);
      window.history.replaceState(null, '', newPath);
    }
  }, [pathname, router]);

  return null;
}
