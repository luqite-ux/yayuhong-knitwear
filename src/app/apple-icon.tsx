import { ImageResponse } from 'next/og';

/**
 * iOS / iPadOS 主屏图标（180×180）
 * 与 favicon 同款几何设计，保持品牌一致
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="180" height="180" rx="40" ry="40" fill="#FFFFFF" />
        <circle cx="90" cy="90" r="78" fill="#0F2A44" />
        <circle cx="90" cy="90" r="72" fill="none" stroke="#D4A843" strokeWidth="5" />
        {/* 交叉纱线 */}
        <path d="M45 45 L135 135" stroke="#D4A843" strokeWidth="10" strokeLinecap="round" />
        <path d="M135 45 L45 135" stroke="#D4A843" strokeWidth="10" strokeLinecap="round" />
        {/* 中心结 */}
        <circle cx="90" cy="90" r="15" fill="#FFFFFF" />
        <circle cx="90" cy="90" r="8" fill="#D4A843" />
      </svg>
    ),
    { ...size },
  );
}
