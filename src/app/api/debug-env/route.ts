import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const allEnvKeys = Object.keys(process.env).sort();
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const hasAdminSessionSecret = !!process.env.ADMIN_SESSION_SECRET;
  const hasNodeEnv = !!process.env.NODE_ENV;

  return NextResponse.json({
    ok: true,
    hasDatabaseUrl,
    hasAdminSessionSecret,
    hasNodeEnv,
    nodeEnv: process.env.NODE_ENV,
    totalEnvVars: allEnvKeys.length,
    publicKeys: allEnvKeys.filter(k =>
      k.startsWith('NEXT_PUBLIC_') || k === 'NODE_ENV' || k === 'VERCEL' || k === 'VERCEL_ENV'
    ),
  });
}
