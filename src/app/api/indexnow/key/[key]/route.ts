import { NextResponse } from 'next/server';
import { getIndexNowKey } from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

/** 校验根目录重写过来的 IndexNow key，避免任意 *.txt 都返回有效密钥。 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const expectedKey = getIndexNowKey();

  if (key !== expectedKey) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
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
