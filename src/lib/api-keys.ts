import crypto from 'crypto';
import { sql } from './db';

export interface ApiKeyInfo {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  rate_limit: number;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
}

export function generateApiKey(): { key: string; keyHash: string; keyPrefix: string } {
  const raw = crypto.randomBytes(16).toString('hex');
  const key = `yyk_${raw}`;
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');
  const keyPrefix = `yyk_${raw.substring(0, 6)}`;
  return { key, keyHash, keyPrefix };
}

export async function verifyApiKey(key: string): Promise<boolean> {
  if (!key || !key.startsWith('yyk_')) return false;

  const keyHash = crypto.createHash('sha256').update(key).digest('hex');

  try {
    const rows = await sql`
      select id, is_active, expires_at
      from admin_api_keys
      where key_hash = ${keyHash}
      limit 1
    `;

    if (rows.length === 0) return false;

    const k = rows[0];
    if (!k.is_active) return false;
    if (k.expires_at && new Date(k.expires_at) < new Date()) return false;

    await sql`
      update admin_api_keys
      set last_used_at = now()
      where key_hash = ${keyHash}
    `;

    return true;
  } catch {
    return false;
  }
}

export async function checkApiKeyPermission(key: string, permission: string): Promise<boolean> {
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');

  try {
    const rows = await sql`
      select permissions
      from admin_api_keys
      where key_hash = ${keyHash} and is_active = true
      limit 1
    `;

    if (rows.length === 0) return false;

    const perms = rows[0].permissions as string[];
    return perms.includes('*') || perms.includes(permission);
  } catch {
    return false;
  }
}

export async function createApiKey(
  name: string,
  permissions: string[] = ['*'],
  rateLimit: number = 1000,
  expiresAt?: Date,
): Promise<{ id: string; key: string; keyPrefix: string }> {
  const { key, keyHash, keyPrefix } = generateApiKey();

  const rows = await sql`
    insert into admin_api_keys (name, key_hash, key_prefix, permissions, rate_limit, expires_at)
    values (
      ${name},
      ${keyHash},
      ${keyPrefix},
      ${permissions}::text[],
      ${rateLimit},
      ${expiresAt || null}
    )
    returning id, key_prefix
  `;

  return {
    id: rows[0].id,
    key,
    keyPrefix: rows[0].key_prefix,
  };
}

export async function listApiKeys(): Promise<ApiKeyInfo[]> {
  const rows = await sql`
    select id, name, key_prefix, permissions, rate_limit, is_active, last_used_at, created_at, expires_at
    from admin_api_keys
    order by created_at desc
  `;
  return rows as unknown as ApiKeyInfo[];
}

export async function revokeApiKey(id: string): Promise<boolean> {
  const result = await sql`
    update admin_api_keys
    set is_active = false
    where id = ${id}
  `;
  return result.count > 0;
}
