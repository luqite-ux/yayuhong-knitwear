import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

function getEndpoint(): string {
  const accountId = process.env.R2_ACCOUNT_ID;
  if (!accountId) throw new Error('缺少环境变量 R2_ACCOUNT_ID');
  return `https://${accountId}.r2.cloudflarestorage.com`;
}

let client: S3Client | null = null;

function getClient(): S3Client {
  if (client) return client;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error('缺少 R2_ACCESS_KEY_ID 或 R2_SECRET_ACCESS_KEY');
  }
  client = new S3Client({
    region: 'auto',
    endpoint: getEndpoint(),
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

function getPublicBase(): string {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) throw new Error('缺少环境变量 R2_PUBLIC_BASE_URL');
  return base.replace(/\/$/, '');
}

function getBucket(): string {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error('缺少环境变量 R2_BUCKET');
  return bucket;
}

export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  const s3 = getClient();
  await s3.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return `${getPublicBase()}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const s3 = getClient();
  await s3.send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: key,
    }),
  );
}

export function r2Url(key: string): string {
  return `${getPublicBase()}/${key}`;
}
