import { NextResponse } from 'next/server';
import { getIndexNowKey } from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

/** IndexNow 校验 key 文件（通过 keyLocation 指向本路由） */
export async function GET() {
  return new NextResponse(getIndexNowKey(), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
