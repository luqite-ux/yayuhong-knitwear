import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * 临时维护路由：从审计日志中找回管理员登录邮箱
 * 认证：Authorization: Bearer <RECOVER_TOKEN>
 * 用完即删（连同 RECOVER_TOKEN 环境变量）
 */
export async function POST(req: NextRequest) {
  const token = process.env.RECOVER_TOKEN;
  const authHeader = req.headers.get('authorization');
  if (!token || authHeader !== `Bearer ${token}`) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const rows = await sql`
    select actor, count(*)::int as n, max(created_at) as last_at
    from audit_logs
    where action = 'login'
    group by actor
    order by last_at desc
  `;

  return NextResponse.json({ loginActors: rows });
}
