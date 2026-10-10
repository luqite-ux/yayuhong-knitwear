import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { uploadToR2 } from '@/lib/r2';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * 上传产品封面图到 R2 并更新数据库
 * POST body: multipart/form-data
 *   - slug: 产品 slug
 *   - file: 图片文件
 * 认证: MIGRATION_TOKEN 环境变量 + Authorization: Bearer <token>
 */
async function checkAuth(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('authorization');
  const migrationToken = process.env.MIGRATION_TOKEN;
  if (authHeader?.startsWith('Bearer ') && migrationToken) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (token === migrationToken) return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  const ok = await checkAuth(req);
  if (!ok) return NextResponse.json({ error: '未授权' }, { status: 401 });

  try {
    const formData = await req.formData();
    const slug = formData.get('slug') as string;
    const file = formData.get('file') as File;

    if (!slug || !file) {
      return NextResponse.json({ ok: false, error: '缺少 slug 或 file' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 上传到 R2
    const key = `products/${slug}.jpg`;
    const url = await uploadToR2(key, buffer, file.type || 'image/jpeg');

    // 更新数据库
    const result = await sql`
      update content_products
      set cover_url = ${url}, updated_at = now()
      where slug = ${slug}
      returning slug, cover_url
    `;

    if (result.length === 0) {
      return NextResponse.json({ ok: false, error: '产品不存在' }, { status: 404 });
    }

    await logAudit('api', 'upload_cover', 'product', { slug, url });

    return NextResponse.json({ ok: true, slug, cover_url: url });
  } catch (err: any) {
    console.error('Upload cover failed:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
