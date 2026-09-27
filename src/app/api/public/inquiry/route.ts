import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, company, subject, message, locale } = body;

  if (!name || !email || !message) {
    return NextResponse.json({ error: '请填写姓名、邮箱和留言' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';

  await sql`
    insert into inquiries (name, email, phone, company, subject, message, locale, ip)
    values (${name}, ${email}, ${phone || null}, ${company || null}, ${subject || null}, ${message}, ${locale || 'en'}, ${ip})
  `;

  return NextResponse.json({ ok: true });
}
