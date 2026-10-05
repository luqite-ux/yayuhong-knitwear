import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await sql`select 1 as ok`;
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err.message,
        stack: err.stack?.slice(0, 500),
        code: err.code,
        name: err.name,
      },
      { status: 500 },
    );
  }
}
