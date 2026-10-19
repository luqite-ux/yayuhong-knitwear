import { getGoogleAccessToken } from '../google';

/**
 * Google Site Verification API 客户端
 *
 * 用途：**自动验证域名所有权并把服务账号设为 GSC verified owner**
 * 这是 huanqiu-admin 项目的核心秘诀——不需要手动进 GSC 界面加用户。
 *
 * 流程：
 *   1. getDnsTxtVerificationToken(domain) → 拿到 google-site-verification=xxx
 *   2. 把 TXT 记录写进 DNS（用 gsc-dns.ts 的 Cloudflare 集成）
 *   3. verifyDomainOwnership({ domain }) → 告诉 Google 去查 DNS，完成验证
 *      → 注意：调用者（service account）自动成为 owners 之一！
 *   4. mergeVerifiedOwners({ ..., requiredOwners: [admin@domain] }) → 合并额外 owner
 *
 * 环境要求：SERVICE ACCOUNT 的 JWT 必须含 scope: siteverification
 */

const SITE_VERIFICATION_BASE = 'https://www.googleapis.com/siteVerification/v1';
const SITE_VERIFICATION_SCOPE = 'https://www.googleapis.com/auth/siteverification';
const GOOGLE_REQUEST_TIMEOUT_MS = 15_000;

export interface VerificationSite {
  type: 'INET_DOMAIN';
  identifier: string;
}

export interface VerifiedWebResource {
  id: string;
  site: VerificationSite;
  owners: string[];
}

export interface SiteVerificationDependencies {
  fetch: typeof globalThis.fetch;
  getAccessToken: (scopes: string[]) => Promise<string>;
}

export interface SiteVerificationClient {
  getDnsTxtVerificationToken(domain: string): Promise<string>;
  listVerifiedResources(): Promise<VerifiedWebResource[]>;
  verifyDomainOwnership(input: { domain: string; owners: string[] }): Promise<VerifiedWebResource>;
  mergeVerifiedOwners(input: {
    resourceId: string;
    site: VerificationSite;
    existingOwners: string[];
    requiredOwners: string[];
  }): Promise<VerifiedWebResource>;
}

async function readJson<T>(res: Response, operation: string): Promise<T> {
  if (!res.ok) {
    throw new Error(`${operation} ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

function normalizeWebResourceId(resourceId: string): string {
  try {
    return encodeURIComponent(decodeURIComponent(resourceId));
  } catch {
    throw new Error('Site Verification 返回无效 resource ID');
  }
}

export function createSiteVerificationClient(
  overrides: Partial<SiteVerificationDependencies> = {},
): SiteVerificationClient {
  const fetchImpl = overrides.fetch ?? globalThis.fetch;
  const getAccessToken = overrides.getAccessToken ?? ((scopes: string[]) => getGoogleAccessToken(scopes));

  async function authorizedHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken([SITE_VERIFICATION_SCOPE]);
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  return {
    async getDnsTxtVerificationToken(domain) {
      const res = await fetchImpl(`${SITE_VERIFICATION_BASE}/token`, {
        method: 'POST',
        headers: await authorizedHeaders(),
        signal: AbortSignal.timeout(GOOGLE_REQUEST_TIMEOUT_MS),
        body: JSON.stringify({
          site: { type: 'INET_DOMAIN', identifier: domain },
          verificationMethod: 'DNS_TXT',
        }),
      });
      const json = await readJson<{ token?: unknown }>(res, 'Site Verification getToken');
      if (typeof json.token !== 'string' || !json.token.startsWith('google-site-verification=')) {
        throw new Error('Site Verification getToken 返回无效 DNS_TXT token');
      }
      return json.token;
    },

    async listVerifiedResources() {
      const res = await fetchImpl(`${SITE_VERIFICATION_BASE}/webResource`, {
        headers: await authorizedHeaders(),
        signal: AbortSignal.timeout(GOOGLE_REQUEST_TIMEOUT_MS),
      });
      const json = await readJson<{ items?: VerifiedWebResource[] }>(res, 'Site Verification list');
      return Array.isArray(json.items) ? json.items : [];
    },

    async verifyDomainOwnership({ domain, owners }) {
      const res = await fetchImpl(
        `${SITE_VERIFICATION_BASE}/webResource?verificationMethod=DNS_TXT`,
        {
          method: 'POST',
          headers: await authorizedHeaders(),
          signal: AbortSignal.timeout(GOOGLE_REQUEST_TIMEOUT_MS),
          body: JSON.stringify({
            site: { type: 'INET_DOMAIN', identifier: domain },
            owners: Array.from(new Set(owners)),
          }),
        },
      );
      return readJson<VerifiedWebResource>(res, 'Site Verification insert');
    },

    async mergeVerifiedOwners({ resourceId, site, existingOwners, requiredOwners }) {
      const owners = Array.from(new Set([...existingOwners, ...requiredOwners]));
      const resource: VerifiedWebResource = { id: resourceId, site, owners };
      if (owners.length === new Set(existingOwners).size) return resource;

      const res = await fetchImpl(
        `${SITE_VERIFICATION_BASE}/webResource/${normalizeWebResourceId(resourceId)}`,
        {
          method: 'PUT',
          headers: await authorizedHeaders(),
          signal: AbortSignal.timeout(GOOGLE_REQUEST_TIMEOUT_MS),
          body: JSON.stringify(resource),
        },
      );
      return readJson<VerifiedWebResource>(res, 'Site Verification update');
    },
  };
}
