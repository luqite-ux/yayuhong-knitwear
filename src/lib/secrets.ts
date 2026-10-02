import { sql } from './db';
import { encryptToBytes, decryptFromBytes } from './crypto';

export type SecretStatus = 'pending' | 'connected' | 'failed' | 'skipped';

export interface SecretRow {
  key: string;
  masked: string | null;
  status: SecretStatus;
  lastTestedAt: Date | null;
  lastError: string | null;
}

export async function getSecret(key: string): Promise<string | null> {
  const rows = await sql<{ ciphertext: Buffer; iv: Buffer; tag: Buffer }[]>`
    select ciphertext, iv, tag from integration_secrets where key = ${key}
  `;
  if (rows.length === 0) return null;
  return decryptFromBytes(rows[0].ciphertext, rows[0].iv, rows[0].tag);
}

export async function getSecretMeta(key: string): Promise<Record<string, unknown> | null> {
  const rows = await sql<{ meta: Record<string, unknown> | null }[]>`
    select meta from integration_secrets where key = ${key}
  `;
  return rows.length > 0 ? rows[0].meta : null;
}

export async function setSecret(
  key: string,
  plaintext: string,
  masked: string,
  meta: Record<string, unknown> = {},
): Promise<void> {
  const enc = encryptToBytes(plaintext);
  await sql`
    insert into integration_secrets (key, ciphertext, iv, tag, masked, meta, status)
    values (${key}, ${enc.ciphertext}, ${enc.iv}, ${enc.tag}, ${masked}, ${JSON.stringify(meta)}::jsonb, 'pending')
    on conflict (key) do update
    set ciphertext = excluded.ciphertext,
        iv = excluded.iv,
        tag = excluded.tag,
        masked = excluded.masked,
        meta = excluded.meta,
        updated_at = now()
  `;
}

export async function updateSecretStatus(
  key: string,
  status: SecretStatus,
  lastError?: string | null,
): Promise<void> {
  await sql`
    update integration_secrets
    set status = ${status},
        last_tested_at = now(),
        last_error = ${lastError ?? null},
        updated_at = now()
    where key = ${key}
  `;
}

export async function listSecrets(): Promise<SecretRow[]> {
  return sql<SecretRow[]>`
    select key, masked, status, last_tested_at, last_error
    from integration_secrets
    order by key
  `;
}

/**
 * 掩码敏感字符串，只显示前 4 和后 4 位
 */
export function maskSecret(value: string): string {
  if (value.length <= 8) return '****';
  return value.slice(0, 4) + '****' + value.slice(-4);
}
