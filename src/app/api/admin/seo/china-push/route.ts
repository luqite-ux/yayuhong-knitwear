import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guard';
import { pushAllChinaUrlsToBaidu, baiduPushUrls, getChinaSiteUrls } from '@/lib/china-baidu';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// 手动触发全量推送
export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  try {
    const result = await pushAllChinaUrlsToBaidu();
    await logAudit('admin', 'baidu_push', 'china_seo', { result });
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 获取国内站 URL 列表 + 推送状态
export async function GET() {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const urls = await getChinaSiteUrls();
  return NextResponse.json({
    totalUrls: urls.length,
    urls: urls.slice(0, 50), // 只返回前50条预览
  });
}
