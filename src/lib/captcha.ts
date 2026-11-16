import { createHash, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { sql } from './db';

export const CAPTCHA_COOKIE_NAME = 'inquiry_captcha';
export const CAPTCHA_TTL_SECONDS = 600;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function hashCode(id: string, code: string) {
  return createHash('sha256').update(`${id}:${code}`).digest('hex');
}

function renderCaptchaSvg(code: string) {
  const lines = Array.from({ length: 6 }, () => (
    `<line x1="${randomInt(0, 151)}" y1="${randomInt(0, 53)}" x2="${randomInt(0, 151)}" y2="${randomInt(0, 53)}" stroke="#94a3b8" stroke-width="1" opacity="0.65" />`
  )).join('');

  const dots = Array.from({ length: 16 }, () => (
    `<circle cx="${randomInt(0, 151)}" cy="${randomInt(0, 53)}" r="1" fill="#64748b" opacity="0.55" />`
  )).join('');

  const digits = code.split('').map((digit, index) => {
    const x = 17 + index * 28;
    const y = randomInt(34, 42);
    const rotation = randomInt(-20, 21);
    const fontSize = randomInt(27, 34);
    return `<text x="${x}" y="${y}" transform="rotate(${rotation} ${x} ${y})" fill="#0f172a" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700" text-anchor="middle">${digit}</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="52" viewBox="0 0 150 52"><rect width="150" height="52" rx="8" fill="#f1f5f9" />${lines}${dots}${digits}</svg>`;
}

export async function createCaptchaChallenge() {
  const id = randomUUID();
  const code = randomInt(0, 100000).toString().padStart(5, '0');
  const expiresAt = new Date(Date.now() + CAPTCHA_TTL_SECONDS * 1000);

  await sql`
    insert into captcha_challenges (id, code_hash, expires_at)
    values (${id}, ${hashCode(id, code)}, ${expiresAt})
  `;
  await sql`
    delete from captcha_challenges
    where expires_at < now() - interval '1 day'
  `;

  return { id, svg: renderCaptchaSvg(code) };
}

export async function consumeCaptchaChallenge(id: string | undefined, submittedCode: unknown) {
  if (!id || !UUID_PATTERN.test(id)) return false;

  const code = typeof submittedCode === 'string' ? submittedCode.trim() : '';

  // 每次校验都消费挑战，包括错误答案，防止暴力重试和验证码复用。
  const rows = await sql<{ code_hash: string }[]>`
    update captcha_challenges
    set used_at = now()
    where id = ${id}
      and used_at is null
      and expires_at > now()
    returning code_hash
  `;

  if (rows.length !== 1 || !/^\d{5}$/.test(code)) return false;

  const expected = Buffer.from(rows[0].code_hash, 'hex');
  const actual = Buffer.from(hashCode(id, code), 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
