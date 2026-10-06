import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/guard';

export async function GET(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 });

  const followUps = await sql`
    select id, action, content, status_before, status_after, created_by, created_at
    from inquiry_follow_ups
    where inquiry_id = ${id}
    order by created_at desc
  `;

  return NextResponse.json({ followUps });
}
