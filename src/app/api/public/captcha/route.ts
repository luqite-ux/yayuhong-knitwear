import { NextResponse } from 'next/server';
import {
  CAPTCHA_COOKIE_NAME,
  CAPTCHA_TTL_SECONDS,
  createCaptchaChallenge,
} from '@/lib/captcha';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { id, svg } = await createCaptchaChallenge();
  const response = new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });

  response.cookies.set({
    name: CAPTCHA_COOKIE_NAME,
    value: id,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CAPTCHA_TTL_SECONDS,
  });

  return response;
}
