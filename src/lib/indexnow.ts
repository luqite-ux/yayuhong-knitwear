import crypto from 'node:crypto';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com').replace(/\/$/, '');

/**
 * IndexNow key：优先用环境变量，未配置时用站点信息派生稳定 key（同一站点始终一致）
 */
export function getIndexNowKey(): string {
  const envKey = process.env.INDEXNOW_KEY;
  if (envKey && /^[a-zA-Z0-9-]{8,128}$/.test(envKey)) return envKey;
  return crypto.createHash('sha256').update(`indexnow:${SITE_URL}`).digest('hex').slice(0, 32);
}

/** 让搜索引擎校验收 key 文件的位置（由 /api/indexnow/key 提供） */
export function getIndexNowKeyLocation(): string {
  return `${SITE_URL}/api/indexnow/key`;
}

/**
 * 推送 URL 到 IndexNow（Bing / Yandex 等参与方），单次最多 500 条
 */
export async function submitIndexNow(
  urls: string[],
): Promise<{ ok: boolean; submitted: number; status?: number; error?: string }> {
  const list = Array.from(new Set(urls))
    .filter((u) => u.startsWith(`${SITE_URL}/`))
    .slice(0, 500);
  if (list.length === 0) return { ok: true, submitted: 0 };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(SITE_URL).hostname,
        key: getIndexNowKey(),
        keyLocation: getIndexNowKeyLocation(),
        urlList: list,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return {
        ok: false,
        submitted: 0,
        status: res.status,
        error: `HTTP ${res.status}: ${body.slice(0, 200)}`,
      };
    }
    return { ok: true, submitted: list.length, status: res.status };
  } catch (err: any) {
    return { ok: false, submitted: 0, error: err?.message || String(err) };
  }
}
