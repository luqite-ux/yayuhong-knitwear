import { isIP } from 'node:net';
import type { VerificationSite, VerifiedWebResource } from './site-verification';
import { canReadGscProperty } from './gsc-property-state';

export type GscOnboardingStatus =
  | 'excluded'
  | 'pending_token'
  | 'pending_dns'
  | 'pending_verification'
  | 'verified'
  | 'dns_access_required'
  | 'failed';

export interface GscOnboardingState {
  domain: string;
  propertyUrl: string;
  status: GscOnboardingStatus;
  verificationToken?: string;
  dnsProvider?: string | null;
  permissionLevel?: string | null;
  permissionError?: string | null;
  error?: string | null;
}

export interface GscOnboardingResult {
  status: GscOnboardingStatus;
  domain: string | null;
  propertyUrl: string | null;
  verificationToken?: string;
  dnsProvider?: string | null;
  permissionLevel?: string | null;
  permissionError?: string | null;
  error?: string | null;
}

export interface GscOnboardingDependencies {
  listSearchConsoleSites: () => Promise<Array<{ siteUrl: string; permissionLevel: string }>>;
  listVerifiedResources: () => Promise<VerifiedWebResource[]>;
  getDnsTxtVerificationToken: (domain: string) => Promise<string>;
  ensureDnsTxt: (domain: string, token: string) => Promise<{ status: 'present' | 'created' | 'access_required'; provider: string | null }>;
  hasPublicDnsTxt: (domain: string, token: string) => Promise<boolean>;
  verifyDomainOwnership: (input: { domain: string; owners: string[] }) => Promise<VerifiedWebResource>;
  mergeVerifiedOwners: (input: {
    resourceId: string;
    site: VerificationSite;
    existingOwners: string[];
    requiredOwners: string[];
  }) => Promise<VerifiedWebResource>;
  addGscProperty: (propertyUrl: string) => Promise<void>;
  getGscProperty: (propertyUrl: string) => Promise<{ siteUrl: string; permissionLevel: string } | null>;
  saveState: (state: GscOnboardingState) => Promise<void>;
  /** 额外要加进 verified owners 的邮箱（通常是域名管理员邮箱） */
  extraOwnerEmail?: string | null;
}

const NON_PRODUCTION_SUFFIXES = ['.internal', '.vercel.app'];

export function normalizeGscRootDomain(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    const parsed = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `http://${value}`);
    let hostname = parsed.hostname.toLowerCase().replace(/\.$/, '');
    if (hostname.startsWith('www.')) hostname = hostname.slice(4);
    if (!hostname.includes('.') || isIP(hostname) !== 0) return null;
    if (NON_PRODUCTION_SUFFIXES.some((s) => hostname.endsWith(s))) return null;
    return hostname;
  } catch {
    return null;
  }
}

function isPendingGoogleDnsPropagation(msg: string): boolean {
  return /verification token could not be found/i.test(msg);
}

/**
 * 主流程：把一个域名全自动接入 GSC
 *
 * 核心逻辑：
 *   1. 先查 Search Console 里有没有、Site Verification 里有没有
 *   2. 如果 Site Verification 里已经有（之前通过 DNS TXT 验证过），直接 merge owners + add GSC property
 *   3. 如果完全没有：
 *      a. getDnsTxtVerificationToken → Google 生成 token
 *      b. ensureDnsTxt → 把 token 写进 DNS（Cloudflare API 自动加，或返回 access_required 让用户手动加）
 *      c. 等 DNS 传播
 *      d. verifyDomainOwnership → Google 去查 DNS，完成所有权验证
 *         → 调用者（service account）自动成为 verified owner！
 *      e. mergeVerifiedOwners → 加 extraOwnerEmail 作为额外 owner
 *      f. addGscProperty → 把 sc-domain:xxx 加进 Search Console
 *      g. getGscProperty 回读，确认权限可读
 */
export async function onboardGscDomain(
  domain: string,
  deps: GscOnboardingDependencies,
): Promise<GscOnboardingResult> {
  const normalized = normalizeGscRootDomain(domain);
  if (!normalized) {
    return { status: 'excluded', domain: null, propertyUrl: null, error: 'invalid_or_non_production_domain' };
  }

  const propertyUrl = `sc-domain:${normalized}`;
  let verificationToken: string | undefined;
  let dnsProvider: string | null = null;
  let permissionReadbackFailed = false;

  const save = async (
    status: GscOnboardingStatus,
    error: string | null = null,
    permissionLevel?: string | null,
    permissionError?: string | null,
  ) => {
    try {
      await deps.saveState({
        domain: normalized,
        propertyUrl,
        status,
        verificationToken,
        dnsProvider,
        permissionLevel,
        permissionError,
        error,
      });
    } catch { /* saveState 失败不阻断主流程 */ }
  };

  try {
    await save('pending_token');
    const [sites, resources] = await Promise.all([
      deps.listSearchConsoleSites(),
      deps.listVerifiedResources(),
    ]);
    const existingSite = sites.find((s) => s.siteUrl === propertyUrl && canReadGscProperty(s.permissionLevel));
    const existingResource = resources.find(
      (r) =>
        r.site.type === 'INET_DOMAIN' &&
        normalizeGscRootDomain(r.site.identifier) === normalized,
    );

    // === 路径 A：域名已经在 Site Verification 里验证过 ===
    // （说明之前某个时间点 DNS TXT 加过、Google 验证过、SA 已经是 owner 了）
    if (existingResource) {
      // 确保 extraOwnerEmail 也在 owners 里
      if (deps.extraOwnerEmail) {
        await deps.mergeVerifiedOwners({
          resourceId: existingResource.id,
          site: existingResource.site,
          existingOwners: existingResource.owners,
          requiredOwners: [deps.extraOwnerEmail],
        });
      }
      if (!existingSite) await deps.addGscProperty(propertyUrl);
      const readback = await deps.getGscProperty(propertyUrl);
      await save('verified', null, readback?.permissionLevel ?? null);
      return {
        status: 'verified',
        domain: normalized,
        propertyUrl,
        permissionLevel: readback?.permissionLevel ?? null,
      };
    }

    // === 路径 B：全新域名，走 DNS TXT 自动验证 ===
    verificationToken = await deps.getDnsTxtVerificationToken(normalized);
    await save('pending_dns');
    const dnsResult = await deps.ensureDnsTxt(normalized, verificationToken);
    dnsProvider = dnsResult.provider;
    if (dnsResult.status === 'access_required') {
      // DNS 不在我们控制（没用 Cloudflare API token），只能让用户手动加
      await save('dns_access_required');
      return {
        status: 'dns_access_required',
        domain: normalized,
        propertyUrl,
        verificationToken,
        dnsProvider,
        error: `需要手动在 ${dnsProvider || 'DNS 服务商'} 加 TXT 记录`,
      };
    }
    // status === 'present' | 'created'，继续

    await save('pending_verification');
    if (!(await deps.hasPublicDnsTxt(normalized, verificationToken))) {
      // DNS 已写但还没全球传播，等下一轮 cron 再试
      return {
        status: 'pending_verification',
        domain: normalized,
        propertyUrl,
        verificationToken,
        dnsProvider,
      };
    }

    // DNS 已传播 → 让 Google 去验证
    const verifiedResource = await deps.verifyDomainOwnership({ domain: normalized, owners: [] });
    if (deps.extraOwnerEmail) {
      await deps.mergeVerifiedOwners({
        resourceId: verifiedResource.id,
        site: verifiedResource.site,
        existingOwners: verifiedResource.owners,
        requiredOwners: [deps.extraOwnerEmail],
      });
    }
    if (!existingSite) await deps.addGscProperty(propertyUrl);
    const readback = await deps.getGscProperty(propertyUrl);
    if (!readback || !canReadGscProperty(readback.permissionLevel)) {
      permissionReadbackFailed = true;
      throw new Error('Search Console property 回读失败或权限不足');
    }
    await save('verified', null, readback.permissionLevel);
    return {
      status: 'verified',
      domain: normalized,
      propertyUrl,
      verificationToken,
      dnsProvider,
      permissionLevel: readback.permissionLevel,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (verificationToken && isPendingGoogleDnsPropagation(msg)) {
      await save('pending_verification');
      return {
        status: 'pending_verification',
        domain: normalized,
        propertyUrl,
        verificationToken,
        dnsProvider,
        error: null,
      };
    }
    await save('failed', msg, undefined, permissionReadbackFailed ? msg : undefined);
    return {
      status: 'failed',
      domain: normalized,
      propertyUrl,
      verificationToken,
      dnsProvider,
      permissionError: permissionReadbackFailed ? msg : undefined,
      error: msg,
    };
  }
}
