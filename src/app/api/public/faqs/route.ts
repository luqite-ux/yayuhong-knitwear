import { NextRequest, NextResponse } from 'next/server';
import { sql, deepParseJson } from '@/lib/db';
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

  let rows;
  if (category) {
    rows = await sql`
      select id, category, question, answer, sort
      from content_faqs
      where is_active = true and category = ${category}
        and sites && array['global', ${effectiveSite}]::text[]
      order by sort, created_at desc
    `;
  } else {
    rows = await sql`
      select id, category, question, answer, sort
      from content_faqs
      where is_active = true
        and sites && array['global', ${effectiveSite}]::text[]
      order by sort, created_at desc
    `;
  }

  const faqs = deepParseJson(rows) as Array<{
    id: string;
    category: string | null;
    question: Record<string, string>;
    answer: Record<string, string>;
    sort: number;
  }>;

  const data = faqs.map((f) => {
    return {
      id: f.id,
      category: f.category && locale === 'zh-TW' ? toTraditional(f.category) : f.category,
      question: localizeText(f.question, locale),
      answer: localizeText(f.answer, locale),
    };
  });

  return NextResponse.json({ faqs: data });
}
