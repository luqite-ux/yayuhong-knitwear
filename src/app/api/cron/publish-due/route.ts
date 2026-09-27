import { NextRequest, NextResponse } from 'next/server';
import { requireCronSecret } from '@/lib/guard';
import { publishDueDrafts } from '@/lib/seo-pipeline';

export async function GET(req: NextRequest) {
  if (!requireCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await publishDueDrafts();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
