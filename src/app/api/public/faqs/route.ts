import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { detectSiteKey } from '@/lib/site';
import { localizeText, toTraditional } from '@/lib/zh-hant';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get('locale') || 'zh';
  const category = searchParams.get('category');
  const host = req.headers.get('host') || '';
  const siteKey = detectSiteKey(host);
  const siteParam = searchParams.get('site');
  const effectiveSite = siteParam || siteKey;

  let faqs;
  if (category) {
    faqs = await sql`
      select id, category, question, answer, sort
      from content_faqs
      where is_active = true and category = ${category}
        and sites && array['global', ${effectiveSite}]::text[]
      order by sort, created_at desc
    `;
  } else {
    faqs = await sql`
      select id, category, question, answer, sort
      from content_faqs
      where is_active = true
        and sites && array['global', ${effectiveSite}]::text[]
      order by sort, created_at desc
    `;
  }

  const data = faqs.map((f) => {
    const q = f.question as Record<string, string>;
    const a = f.answer as Record<string, string>;
    return {
      id: f.id,
      category: f.category && locale === 'zh-TW' ? toTraditional(String(f.category)) : f.category,
      question: localizeText(q, locale),
      answer: localizeText(a, locale),
    };
  });

  return NextResponse.json({ faqs: data });
}
