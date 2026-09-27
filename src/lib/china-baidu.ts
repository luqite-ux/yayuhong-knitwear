import { sql } from './db';

const BAIDU_PUSH_API = 'http://data.zz.baidu.com/urls';

export interface BaiduPushResult {
  success?: number;
  remain?: number;
  not_same_site?: string[];
  not_valid?: string[];
  error?: string;
  message?: string;
}

/**
 * 获取百度推送 token
 */
async function getBaiduPushToken(): Promise<string | null> {
  const rows = await sql`
    select baidu_push_token from site_profile where id = 1 limit 1
  `;
  return rows[0]?.baidu_push_token || null;
}

/**
 * 百度主动推送 URL
 * 将新发布的文章/产品 URL 推送给百度，加快收录
 */
export async function baiduPushUrls(urls: string[]): Promise<BaiduPushResult> {
  const token = await getBaiduPushToken();
  if (!token) {
    return { error: '未配置百度推送 token' };
  }

  const site = 'xiuyumaoshan.cn';
  const apiUrl = `${BAIDU_PUSH_API}?site=${site}&token=${token}`;

  try {
    const body = urls.join('\n');
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body,
    });
    const data = await res.json() as BaiduPushResult;

    // 记录推送日志
    await sql`
      insert into china_baidu_index_log (url, action, status, response)
      values (${urls.join(',')}, 'push', ${data.success ? 'success' : 'failed'}, ${JSON.stringify(data)}::jsonb)
    `;

    return data;
  } catch (err: any) {
    return { error: err.message || '推送失败' };
  }
}

/**
 * 获取国内站所有需要推送的 URL
 * 包括：首页、产品页、文章页、FAQ页等
 */
export async function getChinaSiteUrls(): Promise<string[]> {
  const baseUrl = 'https://xiuyumaoshan.cn';
  const urls: string[] = [];

  // 静态页面
  urls.push(
    `${baseUrl}/`,
    `${baseUrl}/products`,
    `${baseUrl}/factory`,
    `${baseUrl}/services`,
    `${baseUrl}/articles`,
    `${baseUrl}/faq`,
    `${baseUrl}/contact`,
  );

  // 产品详情页
  const products = await sql`
    select slug from content_products
    where is_active = true
      and sites && array['global', 'china']::text[]
  `;
  for (const p of products) {
    urls.push(`${baseUrl}/products/${p.slug}`);
  }

  // 文章详情页
  const articles = await sql`
    select slug from content_articles
    where status = 'published'
      and sites && array['global', 'china']::text[]
  `;
  for (const a of articles) {
    urls.push(`${baseUrl}/articles/${a.slug}`);
  }

  return urls;
}

/**
 * 批量推送国内站所有 URL 到百度
 * 每次最多推送 2000 条
 */
export async function pushAllChinaUrlsToBaidu(): Promise<BaiduPushResult> {
  const urls = await getChinaSiteUrls();
  // 百度每次最多 2000 条
  const batch = urls.slice(0, 2000);
  return baiduPushUrls(batch);
}

/**
 * 检查百度收录状态（近似）
 * 通过 site: 搜索获取大致收录量
 * 注意：这只是粗略估算，精确数据需要百度资源平台 API
 */
export async function checkBaiduIndexApprox(): Promise<{ indexed: number | null; source: string }> {
  // 实际项目中可以接入百度资源平台的收录查询 API
  // 这里返回 null 表示需要手动配置
  return { indexed: null, source: '需要配置百度资源平台 API' };
}
