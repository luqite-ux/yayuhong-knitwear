import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { notifyInquiry } from '@/lib/notify';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name, email, phone, company, subject, message, locale,
    // 归因字段
    referrer, landing_page, submit_page,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content,
    first_touch_at,
  } = body;

  if (!name || !email || !message) {
    return NextResponse.json({ error: '请填写姓名、邮箱和留言' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
  const userAgent = req.headers.get('user-agent') || '';

  // 首次触点时间在客户端生成，需校验合法性；不合法则置空
  let firstTouchAt: string | null = null;
  if (first_touch_at) {
    const d = new Date(first_touch_at);
    if (!Number.isNaN(d.getTime())) firstTouchAt = d.toISOString();
  }

  await sql`
    insert into inquiries (
      name, email, phone, company, subject, message, locale, ip,
      referrer, landing_page, submit_page,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      user_agent, first_touch_at
    )
    values (
      ${name}, ${email}, ${phone || null}, ${company || null}, ${subject || null}, ${message}, ${locale || 'en'}, ${ip},
      ${referrer || null}, ${landing_page || null}, ${submit_page || null},
      ${utm_source || null}, ${utm_medium || null}, ${utm_campaign || null}, ${utm_term || null}, ${utm_content || null},
      ${userAgent}, ${firstTouchAt}
    )
  `;

  await notifyInquiry({
    name, email, phone, company, subject, message, locale: locale || 'en',
    referrer, landing_page, submit_page,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content,
  });

  return NextResponse.json({ ok: true });
}
