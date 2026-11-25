/**
 * 产品图片外链本地化迁移脚本
 *
 * 作用：把数据库里仍指向 Amazon / SHEIN 等外部域名的产品/文章图片，
 *      下载到本地 public/products/local/，并把库中的 URL 改写为本地路径。
 *
 * 覆盖字段：
 *   - content_products.cover_url
 *   - content_products.gallery_urls (text[])
 *   - content_articles.cover_url
 *
 * 幂等：已下载的文件会跳过；已是本地路径（以 / 开头）的字段不动。
 *
 * 运行（在 yayuhong-web 目录下）：
 *   npx tsx scripts/localize-images.ts            # 真正执行
 *   npx tsx scripts/localize-images.ts --dry-run  # 只打印将处理的清单，不写库、不下载
 *
 * 前置：.env.local 里的 DATABASE_URL 必须是真实可用的连接串。
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from 'dotenv';
import postgres from 'postgres';

// 加载 .env.local（dotenv 默认读 .env，需手动指定）
config({ path: path.resolve(process.cwd(), '.env.local') });

const DRY_RUN = process.argv.includes('--dry-run');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || DATABASE_URL.includes('[SENSITIVE]') || DATABASE_URL.length < 20) {
  console.error('❌ 缺少真实的 DATABASE_URL。请先在 .env.local 填入生产库连接串（或 vercel env pull .env.local）。');
  process.exit(1);
}

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const OUT_DIR = path.join(PUBLIC_DIR, 'products', 'local');
const URL_PREFIX = '/products/local';

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

function isExternal(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  const u = url.trim();
  if (!u) return false;
  if (u.startsWith('data:')) return false;
  // 本地路径（以 / 开头）或同站绝对地址 → 不算外链
  if (u.startsWith('/')) return false;
  return /^https?:\/\//i.test(u);
}

function extFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\.([a-zA-Z0-9]+)$/);
    if (m) return m[1].toLowerCase();
  } catch {
    /* ignore */
  }
  return '';
}

function extFromContentType(ct: string | null): string {
  if (!ct) return 'jpg';
  if (ct.includes('jpeg') || ct.includes('jpg')) return 'jpg';
  if (ct.includes('png')) return 'png';
  if (ct.includes('webp')) return 'webp';
  if (ct.includes('avif')) return 'avif';
  if (ct.includes('gif')) return 'gif';
  return 'jpg';
}

async function downloadImage(url: string, destPath: string): Promise<{ ok: boolean; ext: string; err?: string }> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': BROWSER_UA, Referer: 'https://www.amazon.com/' },
      redirect: 'follow',
    });
    if (!res.ok) {
      return { ok: false, ext: '', err: `HTTP ${res.status}` };
    }
    const ct = res.headers.get('content-type');
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 200) {
      return { ok: false, ext: '', err: `响应体过小 (${buffer.length} bytes)，疑似无效图片` };
    }
    fs.writeFileSync(destPath, buffer);
    return { ok: true, ext: extFromContentType(ct) };
  } catch (e: any) {
    return { ok: false, ext: '', err: e?.message || String(e) };
  }
}

type Row = { id: string; slug?: string | null; cover_url?: string | null; gallery_urls?: string[] | null };

async function main() {
  const sql = postgres(DATABASE_URL!, { ssl: 'require', max: 2, connect_timeout: 15 });

  try {
    // 连通性检查
    const [{ now }] = await sql`select now()`;
    console.log('✅ 已连接生产库，当前时间：', new Date(now as any).toISOString());

    if (!DRY_RUN) fs.mkdirSync(OUT_DIR, { recursive: true });

    // 1) 收集所有外链
    const products = (await sql<Row[]>`
      select id, slug, cover_url, gallery_urls from content_products
    `) as Row[];
    const articles = (await sql<Row[]>`
      select id, slug, cover_url from content_articles
    `) as Row[];

    const urlSet = new Set<string>();
    for (const r of [...products, ...articles]) {
      if (isExternal(r.cover_url)) urlSet.add(r.cover_url.trim());
      if (Array.isArray(r.gallery_urls)) {
        for (const g of r.gallery_urls) if (isExternal(g)) urlSet.add(g.trim());
      }
    }

    const urls = Array.from(urlSet);
    console.log(`\n📦 发现 ${products.length} 个产品、${articles.length} 篇文章；其中外链图片去重后共 ${urls.length} 张。`);

    if (urls.length === 0) {
      console.log('🎉 没有任何外链图片，无需处理。');
      return;
    }

    // 抽样打印前 10 条外链，便于确认
    console.log('外链样例（前 10 条）：');
    urls.slice(0, 10).forEach((u, i) => console.log(`  ${i + 1}. ${u}`));

    // 2) 下载（幂等：已存在则跳过）
    const urlToLocal = new Map<string, string>();
    const manifest: Record<string, { url: string; file: string }> = {};
    const manifestPath = path.join(OUT_DIR, '_manifest.json');
    if (fs.existsSync(manifestPath)) {
      try {
        const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        for (const [k, v] of Object.entries(m)) manifest[k] = v as any;
      } catch {
        /* ignore */
      }
    }

    let downloaded = 0;
    let skippedExisting = 0;
    const failed: { url: string; err: string }[] = [];

    for (const url of urls) {
      const hash = crypto.createHash('sha1').update(url).digest('hex');
      // 先按 URL 扩展名猜测；下载后若实际类型不同会重命名
      let ext = extFromUrl(url) || 'jpg';
      const baseName = `${hash}.${ext}`;
      const destPath = path.join(OUT_DIR, baseName);

      if (fs.existsSync(destPath)) {
        skippedExisting++;
        urlToLocal.set(url, `${URL_PREFIX}/${baseName}`);
        manifest[hash] = { url, file: baseName };
        continue;
      }

      if (DRY_RUN) {
        urlToLocal.set(url, `${URL_PREFIX}/${baseName}`);
        continue;
      }

      const res = await downloadImage(url, destPath);
      if (!res.ok) {
        failed.push({ url, err: res.err! });
        continue;
      }
      // 若 URL 无扩展名或扩展名与实际不符，按实际类型重命名
      if (res.ext && res.ext !== ext) {
        const finalName = `${hash}.${res.ext}`;
        const finalPath = path.join(OUT_DIR, finalName);
        fs.renameSync(destPath, finalPath);
        ext = res.ext;
      }
      const name = `${hash}.${ext}`;
      urlToLocal.set(url, `${URL_PREFIX}/${name}`);
      manifest[hash] = { url, file: name };
      downloaded++;
      if (downloaded % 20 === 0) console.log(`  …已下载 ${downloaded}/${urls.length}`);
    }

    if (!DRY_RUN) fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    // 3) 写回数据库
    let productsCoverUpdated = 0;
    let productsGalleryUpdated = 0;
    let articlesCoverUpdated = 0;

    const begin = async () => {
      /* no-op; 逐条更新即可，量小 */
    };
    await begin();

    for (const p of products) {
      let newCover = p.cover_url;
      let changed = false;
      if (isExternal(p.cover_url)) {
        const local = urlToLocal.get(p.cover_url!.trim());
        if (local) {
          newCover = local;
          changed = true;
        }
      }
      let newGallery = p.gallery_urls;
      let galleryChanged = false;
      if (Array.isArray(p.gallery_urls) && p.gallery_urls.length) {
        const mapped = p.gallery_urls.map((g) => {
          if (isExternal(g)) {
            const local = urlToLocal.get(g.trim());
            if (local) {
              galleryChanged = true;
              return local;
            }
          }
          return g;
        });
        if (galleryChanged) newGallery = mapped;
      }
      if (changed || galleryChanged) {
        if (DRY_RUN) {
          if (changed) productsCoverUpdated++;
          if (galleryChanged) productsGalleryUpdated++;
          continue;
        }
        await sql`
          update content_products
          set cover_url = ${(newCover ?? p.cover_url ?? '') as string},
              gallery_urls = ${newGallery as any},
              updated_at = now()
          where id = ${p.id}
        `;
        if (changed) productsCoverUpdated++;
        if (galleryChanged) productsGalleryUpdated++;
      }
    }

    for (const a of articles) {
      if (isExternal(a.cover_url)) {
        const local = urlToLocal.get(a.cover_url!.trim());
        if (local) {
          if (DRY_RUN) {
            articlesCoverUpdated++;
            continue;
          }
          await sql`update content_articles set cover_url = ${local}, updated_at = now() where id = ${a.id}`;
          articlesCoverUpdated++;
        }
      }
    }

    // 4) 汇总
    console.log('\n========== 处理汇总 ==========');
    console.log(`模式：${DRY_RUN ? 'DRY-RUN（未写库/未下载）' : '已执行'}`);
    console.log(`外链图片去重总数：${urls.length}`);
    console.log(`  新下载：${downloaded}　已存在跳过：${skippedExisting}　下载失败：${failed.length}`);
    console.log(`产品封面 cover_url 改写：${productsCoverUpdated}`);
    console.log(`产品图集 gallery_urls 改写：${productsGalleryUpdated}`);
    console.log(`文章封面 cover_url 改写：${articlesCoverUpdated}`);
    console.log(`本地图片目录：${OUT_DIR}`);
    console.log(`清单文件：${manifestPath}`);
    if (failed.length) {
      console.log('\n⚠️ 下载失败明细（这些 URL 在库中保留原值，未被替换）：');
      failed.slice(0, 20).forEach((f) => console.log(`  - ${f.url}\n      ${f.err}`));
      if (failed.length > 20) console.log(`  …还有 ${failed.length - 20} 条，见上方日志。`);
    }
    if (!DRY_RUN && (downloaded > 0 || productsCoverUpdated || productsGalleryUpdated || articlesCoverUpdated)) {
      console.log('\n👉 下一步：把 public/products/local/ 下新增的图片提交并部署，前端即可自动加载本地图。');
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error('执行出错：', e);
  process.exit(1);
});
