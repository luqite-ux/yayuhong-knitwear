import crypto from 'node:crypto';
import { verify } from '@node-rs/argon2';
import { sql } from './db';

const COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 天

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('缺少环境变量 ADMIN_SESSION_SECRET');
  return secret;
}

function signToken(token: string): string {
  const hmac = crypto.createHmac('sha256', getSessionSecret());
  hmac.update(token);
  return token + '.' + hmac.digest('hex');
}

function verifySignedToken(signed: string): string | null {
  const idx = signed.lastIndexOf('.');
  if (idx < 0) return null;
  const token = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = crypto.createHmac('sha256', getSessionSecret()).update(token).digest('hex');
  if (sig.length !== expected.length) return null;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? token : null;
}

export interface SessionInfo {
  tokenHash: string;
  expiresAt: Date;
}

export async function login(email: string, password: string): Promise<string | null> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !hash) return null;
  if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) return null;
  const ok = await verify(hash, password, { algorithm: 2 });
  if (!ok) return null;

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
  await sql`insert into admin_sessions (token_hash, expires_at) values (${tokenHash}, ${expiresAt})`;
  return signToken(token);
}

export async function verifySession(signedToken: string | undefined): Promise<boolean> {
  if (!signedToken) return false;
  const token = verifySignedToken(signedToken);
  if (!token) return false;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const rows = await sql<{ expires_at: Date }[]>`
    select expires_at from admin_sessions where token_hash = ${tokenHash}
  `;
  if (rows.length === 0) return false;
  if (new Date(rows[0].expires_at).getTime() < Date.now()) {
    await sql`delete from admin_sessions where token_hash = ${tokenHash}`;
    return false;
  }
  return true;
}

export async function logout(signedToken: string | undefined): Promise<void> {
  if (!signedToken) return;
  const token = verifySignedToken(signedToken);
  if (!token) return;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  await sql`delete from admin_sessions where token_hash = ${tokenHash}`;
}

export function getCookieName(): string {
  return COOKIE_NAME;
}

export function getSessionMaxAge(): number {
  return SESSION_MAX_AGE;
}

export function setSessionCookie(res: any, signedToken: string): void {
  res.cookies.set(COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(res: any): void {
  res.cookies.delete(COOKIE_NAME);
}
