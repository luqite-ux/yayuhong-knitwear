'use client';

import { useEffect } from 'react';
import { captureAttribution } from '@/lib/attribution';

/**
 * 全站归因捕获组件：挂载在根 layout，每次路由变化时捕获一次。
 * 不渲染任何 UI。
 */
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return null;
}
