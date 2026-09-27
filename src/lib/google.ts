import { google, type Auth } from 'googleapis';

async function getAuthClient(): Promise<Auth.JWT | null> {
  const { getSecret } = await import('./secrets');
  const json = await getSecret('google');
  if (!json) return null;

  const creds = JSON.parse(json);
  const client = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: [
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/indexing',
      'https://www.googleapis.com/auth/analytics.readonly',
    ],
  });
  return client;
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
