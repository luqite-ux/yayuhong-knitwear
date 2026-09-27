import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guard';
import { uploadToR2 } from '@/lib/r2';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: '缺少文件' }, { status: 400 });

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ error: '文件过大（最大 10MB）' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const key = `uploads/${new Date().getFullYear()}/${String(Date.now())}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  try {
    const url = await uploadToR2(key, buf, file.type || 'image/jpeg');
    await logAudit('admin', 'upload', key, { size: file.size, type: file.type });
    return NextResponse.json({ url, key });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
