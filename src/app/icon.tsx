import { ImageResponse } from 'next/og';

/**
 * 网站主图标（favicon / 浏览器标签页）
 * 深蓝圆底 + 金色描边 + 交叉纱线符号
 * 32px 下几何图形比文字清晰，配色与 logo-primary.jpg / logo-new.jpg 一致
 */
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <svg width="32" height="32" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="28" fill="#0F2A44" />
        <circle cx="32" cy="32" r="25" fill="none" stroke="#D4A843" strokeWidth="2" />
        {/* 交叉纱线 × */}
        <path d="M18 18 L46 46" stroke="#D4A843" strokeWidth="4" strokeLinecap="round" />
        <path d="M46 18 L18 46" stroke="#D4A843" strokeWidth="4" strokeLinecap="round" />
        {/* 中心白点，表示"结" */}
        <circle cx="32" cy="32" r="5" fill="#FFFFFF" />
      </svg>
    ),
    { ...size },
  );
}
