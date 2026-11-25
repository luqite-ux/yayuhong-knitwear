import { NextRequest, NextResponse } from 'next/server';
import { getIndexNowKey } from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

/** IndexNow 校验 key 文件（根目录 /{key}.txt 重写到本路由） */
export async function GET(req: NextRequest) {
  const expectedKey = getIndexNowKey();
  const requestedKey = req.nextUrl.searchParams.get('key');

  if (requestedKey && requestedKey !== expectedKey) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  return new NextResponse(expectedKey, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
