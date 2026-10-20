import { google, type Auth } from 'googleapis';

const ALL_SCOPES = [
  'https://www.googleapis.com/auth/webmasters',
  'https://www.googleapis.com/auth/indexing',
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/siteverification',
];

let _auth: Auth.JWT | null = null;
let _cachedToken: { token: string; expiresAt: number } | null = null;

async function getAuthClient(): Promise<Auth.JWT | null> {
  if (_auth) return _auth;
  const { getSecret } = await import('./secrets');
  const json = await getSecret('google');
  if (!json) return null;

  const creds = JSON.parse(json);
  _auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ALL_SCOPES,
  });
  return _auth;
}

/**
 * 拿原始 access_token，给 fetch 直接调 Google API 用
 * scope 参数是签名兼容，实际 token 包含 ALL_SCOPES 全部 scope
 */
export async function getGoogleAccessToken(scopes?: string[]): Promise<string> {
  if (_cachedToken && _cachedToken.expiresAt > Date.now() + 60_000) {
    return _cachedToken.token;
  }
  const auth = await getAuthClient();
  if (!auth) throw new Error('google 服务账号未配置');
  const token = await auth.getAccessToken();
  if (!token?.token) throw new Error('google auth 无法获取 access_token');
  // google-auth-library 的 GetAccessTokenResponse.expiresIn 是剩余秒数
  const seconds = (token as any).expiresIn ?? 3600;
  _cachedToken = {
    token: token.token,
    expiresAt: Date.now() + (seconds - 60) * 1000,
  };
  return token.token;
}

export async function getSearchConsoleClient() {
  const auth = await getAuthClient();
  if (!auth) return null;
  return google.webmasters({ version: 'v3', auth });
}

export async function getIndexingClient() {
  const auth = await getAuthClient();
  if (!auth) return null;
  return google.indexing({ version: 'v3', auth });
}

export async function getAnalyticsDataClient() {
  const auth = await getAuthClient();
  if (!auth) return null;
  return google.analyticsdata({ version: 'v1beta', auth });
}

export async function getGa4PropertyId(): Promise<string | null> {
  const { getSecret } = await import('./secrets');
  const raw = await getSecret('ga4');
  if (!raw) return null;
  const cfg = JSON.parse(raw);
  return cfg.propertyId || null;
}

export async function getGa4MeasurementId(): Promise<string | null> {
  const { getSecret } = await import('./secrets');
  const raw = await getSecret('ga4');
  if (!raw) return null;
  const cfg = JSON.parse(raw);
  return cfg.measurementId || null;
}

/**
 * 程序化启用指定 Google API（通过 Service Usage API）
 * 避免用户手动去 Console 点
 * 自己建独立 JWT client（只用 cloud-platform scope），不影响主 client
 */
export async function enableGoogleService(serviceName: string): Promise<{ enabled: boolean; state?: string; error?: string }> {
  const { getSecret } = await import('./secrets');
  const googleJson = await getSecret('google');
  if (!googleJson) return { enabled: false, error: 'google 服务账号未配置' };
  const creds = JSON.parse(googleJson);
  const projectId = creds.project_id;

  // Service Usage API 只需要 cloud-platform scope
  const saClient = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const tokenRes = await saClient.getAccessToken();
  const token = tokenRes.token;
  if (!token) return { enabled: false, error: '无法获取 Service Usage API token' };

  // 1. 先查状态
  const checkUrl = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services/${serviceName}?key=&alt=json`;
  const checkRes = await fetch(checkUrl, { headers: { Authorization: `Bearer ${token}` } });
  const checkData = await checkRes.json().catch(() => ({})) as any;
  if (checkRes.ok && checkData.state === 'ENABLED') return { enabled: true, state: checkData.state };

  // 2. 执行启用
  const enableUrl = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services/${serviceName}:enable`;
  const enableRes = await fetch(enableUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const enableData = await enableRes.json().catch(() => ({})) as any;

  // 3. 轮询等它真的启用
  for (let i = 0; i < 6; i++) {
    await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    const r2 = await fetch(checkUrl, { headers: { Authorization: `Bearer ${token}` } });
    const d2 = await r2.json().catch(() => ({})) as any;
    if (r2.ok && d2.state === 'ENABLED') return { enabled: true, state: d2.state };
    if (r2.ok && d2.state === 'DISABLED') continue;
  }
  const final = await fetch(checkUrl, { headers: { Authorization: `Bearer ${token}` } });
  const finalData = await final.json().catch(() => ({})) as any;
  const errMsg = enableRes.ok ? undefined : String(enableData.error?.message ?? '未知错误');
  return { enabled: final.ok && finalData.state === 'ENABLED', state: finalData.state, error: errMsg };
}
