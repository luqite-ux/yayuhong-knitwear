import crypto from 'node:crypto';

const ALGO = 'aes-256-gcm';

function getKey(): Buffer {
  const raw = process.env.CONFIG_ENCRYPTION_KEY;
  if (!raw) throw new Error('缺少环境变量 CONFIG_ENCRYPTION_KEY');
  let key: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    key = Buffer.from(raw, 'hex');
  } else {
    key = Buffer.from(raw, 'base64');
  }
  if (key.length !== 32) {
    throw new Error('CONFIG_ENCRYPTION_KEY 必须是 32 字节（base64 编码或 64 位 hex）');
  }
  return key;
}

export interface Encrypted {
  ciphertext: Buffer;
  iv: Buffer;
  tag: Buffer;
}

export function encrypt(plaintext: string): Encrypted {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext, iv, tag };
}

export function decrypt(enc: Encrypted): string {
  const decipher = crypto.createDecipheriv(ALGO, getKey(), enc.iv);
  decipher.setAuthTag(enc.tag);
  return Buffer.concat([decipher.update(enc.ciphertext), decipher.final()]).toString('utf8');
}

export function encryptToBytes(plaintext: string): { ciphertext: Buffer; iv: Buffer; tag: Buffer } {
  return encrypt(plaintext);
}

export function decryptFromBytes(ciphertext: Buffer, iv: Buffer, tag: Buffer): string {
  return decrypt({ ciphertext, iv, tag });
}
