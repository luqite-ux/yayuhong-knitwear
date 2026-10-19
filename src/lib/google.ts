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
