import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/guard';
import { logAudit } from '@/lib/audit';

const VALID_STATUSES = ['new', 'contacting', 'quoted', 'won', 'lost', 'spam'];

export async function GET(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  let inquiries;
  if (status && VALID_STATUSES.includes(status)) {
    inquiries = await sql`
      select id, name, email, phone, whatsapp, company, subject, message, locale, ip,
             status, source, admin_note, country, created_at
      from inquiries
      where status = ${status}
      order by created_at desc
      limit 200
    `;
  } else {
    inquiries = await sql`
      select id, name, email, phone, whatsapp, company, subject, message, locale, ip,
             status, source, admin_note, country, created_at
      from inquiries
      order by created_at desc
      limit 200
    `;
  }

  // 统计各状态数量
  const stats = await sql`
    select status, count(*)::int as count
    from inquiries
    group by status
    order by status
  `;

  return NextResponse.json({ inquiries, stats });
}

// 状态变更
export async function PATCH(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, status, note } = body as { id: string; status: string; note?: string };

    if (!id || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: '无效参数' }, { status: 400 });
    }

    // 查旧状态
    const old = await sql`select status from inquiries where id = ${id}`;
    if (old.length === 0) {
      return NextResponse.json({ error: '询盘不存在' }, { status: 404 });
    }

    await sql`
      update inquiries set status = ${status}, updated_at = now()
      where id = ${id}
    `;

    // 写跟进记录
    await sql`
      insert into inquiry_follow_ups (inquiry_id, action, content, status_before, status_after, created_by)
      values (${id}, 'status_change', ${note || ''}, ${old[0].status}, ${status}, 'admin')
    `;

    await logAudit('admin', 'inquiry_status', id, { from: old[0].status, to: status });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 添加备注/跟进记录
export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, action, content } = body as { id: string; action: string; content: string };

    if (!id || !content) {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 });
    }

    const validActions = ['note', 'call', 'email', 'whatsapp', 'quote'];
    const act = validActions.includes(action) ? action : 'note';

    await sql`
      insert into inquiry_follow_ups (inquiry_id, action, content, created_by)
      values (${id}, ${act}, ${content}, 'admin')
    `;

    // 同时更新 admin_note（如果是普通备注）
    if (act === 'note') {
      await sql`update inquiries set admin_note = ${content}, updated_at = now() where id = ${id}`;
    }

    await logAudit('admin', `inquiry_${act}`, id, {});
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
