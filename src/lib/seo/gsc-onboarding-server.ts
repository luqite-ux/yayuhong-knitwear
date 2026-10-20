/**
 * GSC 自动验证 —— yayuhong-web 适配层
 *
 * 封装：读 secrets → 选 DNS 管理器 → 跑 onboarding → 存状态
 * 这是 huanqiu-admin 里 runTenantGscOnboarding 的移植版本
 */

import { sql } from '../db';
import { getSecret } from '../secrets';
import { google } from 'googleapis';
import { createSiteVerificationClient } from './site-verification';
import { createCloudflareDnsManager, createPublicDnsManager, type GscDnsManager } from './gsc-dns';
import {
  onboardGscDomain,
  type GscOnboardingResult,
  type GscOnboardingState,
} from './gsc-onboarding';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com';

function normalizeDomain(raw: string): string {
  let hostname = raw.toLowerCase().replace(/\.$/, '');
  if (hostname.startsWith('www.')) hostname = hostname.slice(4);
  return hostname;
}

/** 决定用 Cloudflare 还是只读 DNS */
async function resolveDnsManager(): Promise<GscDnsManager> {
  try {
    const raw = await getSecret('cloudflare');
    if (raw) {
      const cfg = JSON.parse(raw);
      const apiToken = cfg.apiToken ?? cfg.api_token;
      const accountId = cfg.accountId ?? cfg.account_id;
      const zoneId = cfg.zoneId ?? cfg.zone_id;
      if (apiToken) {
        // Cloudflare 列 zone 不强制 accountId；有 zoneId 能直接定位 zone
        return createCloudflareDnsManager({ apiToken, accountId, zoneId });
      }
    }
  } catch { /* ignore — fall through to public DNS */ }
  return createPublicDnsManager();
}

/** Search Console 的 add/get 方法（用 googleapis SDK） */
async function listScSites() {
  const webmasters = await getWebmastersClient();
  if (!webmasters) return [] as Array<{ siteUrl: string; permissionLevel: string }>;
  const res = await webmasters.sites.list();
  return (res.data.siteEntry ?? []) as Array<{ siteUrl: string; permissionLevel: string }>;
}

async function addScProperty(propertyUrl: string) {
  const webmasters = await getWebmastersClient();
  if (!webmasters) throw new Error('google JWT 未配置');
  await webmasters.sites.add({ siteUrl: propertyUrl });
}

async function getScProperty(propertyUrl: string) {
  const webmasters = await getWebmastersClient();
  if (!webmasters) return null;
  try {
    const res = await webmasters.sites.get({ siteUrl: propertyUrl });
    return res.data as { siteUrl: string; permissionLevel: string };
  } catch {
    return null;
  }
}

async function getWebmastersClient() {
  const json = await getSecret('google');
  if (!json) return null;
  const creds = JSON.parse(json);
  const client = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters'],
  });
  return google.webmasters({ version: 'v3', auth: client });
}

/** 主入口：给当前站点跑一遍 GSC 自动验证 */
export async function runGscOnboarding(): Promise<GscOnboardingResult> {
  const domain = normalizeDomain(new URL(SITE_URL).hostname);
  const verification = createSiteVerificationClient();
  const dnsManager = await resolveDnsManager();

  // 服务账号自己的邮箱（verifyDomainOwnership 调用者自动成为 owner）
  let saEmail: string | null = null;
  try {
    const googleJson = await getSecret('google');
    if (googleJson) saEmail = JSON.parse(googleJson).client_email;
  } catch { /* ignore */ }

  const result = await onboardGscDomain(domain, {
    listSearchConsoleSites: listScSites,
    listVerifiedResources: () => verification.listVerifiedResources(),
    getDnsTxtVerificationToken: (d) => verification.getDnsTxtVerificationToken(d),
    ensureDnsTxt: (d, t) => dnsManager.ensureTxt(d, t),
    hasPublicDnsTxt: (d, t) => dnsManager.hasTxt(d, t),
    verifyDomainOwnership: (input) => verification.verifyDomainOwnership(input),
    mergeVerifiedOwners: (input) => verification.mergeVerifiedOwners(input),
    addGscProperty: addScProperty,
    getGscProperty: getScProperty,
    // extraOwnerEmail：只有真实 Google 账号才能作为 verified owner 加进 Site Verification
    // ADMIN_EMAIL（如 admin@xiuyuknit.com）通常只是站点邮箱，不是 Google 账号，会被 API 拒绝
    // 有独立 GOOGLE_OWNER_EMAIL 环境变量才用；否则加 null，后续可在 GSC 界面手动加
    extraOwnerEmail: process.env.GOOGLE_OWNER_EMAIL || null,
    async saveState(state: GscOnboardingState) {
      // 同时写旧列 status/txt_name/txt_value/cloudflare_record_id（被 gsc_sync cron 和 gsc 页面依赖），
      // 以及新列（如果 schema 里已经补了的话）。新列缺失不会抛错。
      const legacyStatus =
        state.status === 'verified' ? 'verified' :
        state.status === 'failed' ? 'failed' :
        state.status === 'pending_verification' ? 'pending_verification' : 'pending_dns';
      try {
        await sql`
          insert into seo_gsc_properties (
            property, status, txt_name, txt_value, verified_at, created_at, updated_at
          ) values (
            ${state.propertyUrl}, ${legacyStatus}, 'google-site-verification',
            ${state.verificationToken ?? null},
            ${state.status === 'verified' ? new Date() : null},
            now(), now()
          )
          on conflict (property) do update set
            status = excluded.status,
            txt_name = excluded.txt_name,
            txt_value = excluded.txt_value,
            verified_at = coalesce(excluded.verified_at, seo_gsc_properties.verified_at),
            updated_at = now()
        `;
      } catch (err) {
        console.error('[gsc-onboarding] saveState legacy 列失败:', err);
      }
      // 新列（需要 ALTER TABLE 先补；否则静默跳过）
      try {
        await sql`
          insert into seo_gsc_properties (
            property, property_type, verification_token, onboarding_status,
            dns_provider, verified_at, last_onboarding_attempt_at, onboarding_error,
            permission_level, permission_error, permission_checked_at
          ) values (
            ${state.propertyUrl}, 'domain', ${state.verificationToken ?? null}, ${state.status},
            ${state.dnsProvider ?? null}, ${state.status === 'verified' ? new Date() : null},
            now(), ${state.error ?? null},
            ${state.permissionLevel ?? null}, ${state.permissionError ?? null},
            ${state.permissionLevel !== undefined ? new Date() : null}
          )
          on conflict (property) do update set
            verification_token = excluded.verification_token,
            onboarding_status = excluded.onboarding_status,
            dns_provider = excluded.dns_provider,
            verified_at = coalesce(excluded.verified_at, seo_gsc_properties.verified_at),
            last_onboarding_attempt_at = excluded.last_onboarding_attempt_at,
            onboarding_error = excluded.onboarding_error,
            permission_level = excluded.permission_level,
            permission_error = excluded.permission_error,
            permission_checked_at = excluded.permission_checked_at
        `;
      } catch (err) {
        console.error('[gsc-onboarding] saveState 新列失败（schema 未补）:', err);
      }
    },
  });

  return result;
}
