/**
 * GSC onboarding 所需的 DNS TXT 管理
 *
 * 两个实现：
 *   - createPublicDnsManager() —— 只检查 DNS，不加记录（DNS 不在我们控制时用）
 *   - createCloudflareDnsManager({ apiToken, accountId }) —— 通过 Cloudflare API 自动加 TXT 记录
 *
 * yayuhong-web 里 Cloudflare 凭据存在 integration_secrets 表，key='cloudflare'，
 * 字段 { apiToken, accountId, zoneId }。调用方负责读取。
 */

export interface GscDnsManager {
  ensureTxt(
    domain: string,
    token: string,
  ): Promise<{ status: 'present' | 'created' | 'access_required'; provider: string | null }>;
  hasTxt(domain: string, token: string): Promise<boolean>;
}

type ResolveTxt = (hostname: string) => Promise<string[][]>;
type DetectDnsProvider = (hostname: string) => Promise<string | null>;

interface DnsOverHttpsAnswer {
  type?: number;
  data?: string;
}

interface DnsOverHttpsResponse {
  Status?: number;
  Answer?: DnsOverHttpsAnswer[];
}

interface CloudflareZone {
  id: string;
  name: string;
  status: string;
}

interface CloudflareDnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  [key: string]: unknown;
}

interface CloudflareEnvelope<T> {
  success: boolean;
  errors?: Array<{ code?: number; message?: string }>;
  result: T;
}

const DNS_REQUEST_TIMEOUT_MS = 10_000;
const CLOUDFLARE_REQUEST_TIMEOUT_MS = 15_000;

export interface CloudflareDnsManagerOptions {
  apiToken: string;
  accountId: string;
  fetch?: typeof globalThis.fetch;
  resolveTxt?: ResolveTxt;
  detectProvider?: DetectDnsProvider;
}

async function hasExactTxt(resolveTxt: ResolveTxt, domain: string, token: string): Promise<boolean> {
  try {
    const records = await resolveTxt(domain);
    return records.some((parts) => parts.join('') === token);
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error
      ? String(error.code)
      : null;
    if (code === 'ENODATA' || code === 'ENOTFOUND') return false;
    throw error;
  }
}

function decodeDnsOverHttpsTxt(data: string): string[] {
  const quoted = data.match(/"(?:\\.|[^"\\])*"/g);
  if (!quoted?.length) return [data];
  try {
    return quoted.map((part) => JSON.parse(part) as string);
  } catch {
    return [data.replace(/^"|"$/g, '')];
  }
}

export function createDnsOverHttpsTxtResolver(
  fetchImpl: typeof globalThis.fetch = globalThis.fetch,
): ResolveTxt {
  return async (hostname) => {
    const url = new URL('https://dns.google/resolve');
    url.searchParams.set('name', hostname);
    url.searchParams.set('type', 'TXT');
    const response = await fetchImpl(url.toString(), {
      headers: { Accept: 'application/dns-json' },
      signal: AbortSignal.timeout(DNS_REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`DNS-over-HTTPS ${response.status}`);
    const payload = (await response.json()) as DnsOverHttpsResponse;
    if (payload.Status !== 0 && payload.Status !== 3) {
      throw new Error(`DNS-over-HTTPS status ${payload.Status ?? 'unknown'}`);
    }
    return (payload.Answer ?? [])
      .filter((answer) => answer.type === 16 && typeof answer.data === 'string')
      .map((answer) => decodeDnsOverHttpsTxt(answer.data as string));
  };
}

export function createDnsOverHttpsProviderDetector(
  fetchImpl: typeof globalThis.fetch = globalThis.fetch,
): DetectDnsProvider {
  return async (hostname) => {
    const url = new URL('https://dns.google/resolve');
    url.searchParams.set('name', hostname);
    url.searchParams.set('type', 'NS');
    const response = await fetchImpl(url.toString(), {
      headers: { Accept: 'application/dns-json' },
      signal: AbortSignal.timeout(DNS_REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as DnsOverHttpsResponse;
    const nameservers = (payload.Answer ?? [])
      .filter((answer) => answer.type === 2 && typeof answer.data === 'string')
      .map((answer) => (answer.data as string).toLowerCase().replace(/\.$/, ''));
    if (nameservers.some((v) => v.endsWith('.ns.cloudflare.com'))) return 'cloudflare';
    if (nameservers.some((v) => v.endsWith('.hichina.com'))) return 'aliyun';
    if (nameservers.some((v) => v.endsWith('.dnspod.net'))) return 'dnspod';
    if (nameservers.some((v) => v.endsWith('.xincache.com'))) return 'xinnet';
    return nameservers.length ? 'other' : null;
  };
}

/** 只读 DNS 管理器——只检查 TXT 记录是否存在，不写 DNS */
export function createPublicDnsManager(
  resolveTxt: ResolveTxt = createDnsOverHttpsTxtResolver(),
): GscDnsManager {
  return {
    async ensureTxt(domain, token) {
      if (await hasExactTxt(resolveTxt, domain, token)) {
        return { status: 'present', provider: 'public_dns' };
      }
      return { status: 'access_required', provider: null };
    },
    hasTxt(domain, token) {
      return hasExactTxt(resolveTxt, domain, token);
    },
  };
}

/** Cloudflare DNS 管理器——通过 Cloudflare API 自动加 TXT 记录 */
export function createCloudflareDnsManager(options: CloudflareDnsManagerOptions): GscDnsManager {
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const resolveTxt = options.resolveTxt ?? createDnsOverHttpsTxtResolver(fetchImpl);
  const detectProvider = options.detectProvider ?? createDnsOverHttpsProviderDetector(fetchImpl);

  async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${options.apiToken}`);
    if (init?.body) headers.set('Content-Type', 'application/json');
    const res = await fetchImpl(url, {
      ...init,
      headers,
      signal: init?.signal ?? AbortSignal.timeout(CLOUDFLARE_REQUEST_TIMEOUT_MS),
    });
    const text = await res.text();
    let json: CloudflareEnvelope<T> | null = null;
    try {
      json = JSON.parse(text) as CloudflareEnvelope<T>;
    } catch {
      throw new Error(`Cloudflare API ${res.status}: invalid JSON`);
    }
    if (!res.ok || !json.success) {
      const msg = json.errors?.map((e) => e.message).filter(Boolean).join('; ');
      throw new Error(`Cloudflare API ${res.status}: ${(msg || 'failed').slice(0, 300)}`);
    }
    return json.result;
  }

  async function findZone(domain: string): Promise<CloudflareZone | null> {
    const labels = domain.toLowerCase().split('.').filter(Boolean);
    for (let i = 0; i <= labels.length - 2; i++) {
      const candidate = labels.slice(i).join('.');
      const url = new URL('https://api.cloudflare.com/client/v4/zones');
      url.searchParams.set('name', candidate);
      url.searchParams.set('account.id', options.accountId);
      const zones = await request<CloudflareZone[]>(url.toString());
      const zone = zones.find((z) => z.name.toLowerCase() === candidate);
      if (zone) return zone;
    }
    return null;
  }

  return {
    async ensureTxt(domain, token) {
      const zone = await findZone(domain);
      if (!zone) {
        return { status: 'access_required', provider: await detectProvider(domain) };
      }
      const recordsUrl = new URL(
        `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(zone.id)}/dns_records`,
      );
      recordsUrl.searchParams.set('per_page', '5000');
      const records = await request<CloudflareDnsRecord[]>(recordsUrl.toString());
      const exists = records.some(
        (r) => r.type === 'TXT' && r.name.toLowerCase() === domain.toLowerCase() && r.content === token,
      );
      if (exists) return { status: 'present', provider: 'cloudflare' };
      try {
        await request<CloudflareDnsRecord>(recordsUrl.origin + recordsUrl.pathname, {
          method: 'POST',
          body: JSON.stringify({ type: 'TXT', name: domain, content: token, ttl: 1, proxied: false }),
        });
        return { status: 'created', provider: 'cloudflare' };
      } catch (err) {
        // 可能另一个进程刚刚加了同一条，确认一下
        const current = await request<CloudflareDnsRecord[]>(recordsUrl.toString());
        if (current.some((r) => r.type === 'TXT' && r.name.toLowerCase() === domain.toLowerCase() && r.content === token)) {
          return { status: 'present', provider: 'cloudflare' };
        }
        throw err;
      }
    },
    hasTxt(domain, token) {
      return hasExactTxt(resolveTxt, domain, token);
    },
  };
}
