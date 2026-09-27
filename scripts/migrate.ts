/**
 * 数据库迁移脚本
 * 用法：npm run migrate
 * 读取 migrations/*.sql，按文件名排序，跳过 schema_migrations 中已记录的文件，
 * 每个文件在单独事务内执行并写入记录。
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('缺少环境变量 DATABASE_URL');
    process.exit(1);
  }
  const sql = postgres(url, { ssl: 'require', max: 1 });
  const dir = path.resolve(process.cwd(), 'migrations');
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  try {
    await sql`create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )`;
    const applied = new Set(
      (await sql<{ name: string }[]>`select name from schema_migrations`).map((r) => r.name),
    );

    let count = 0;
    for (const file of files) {
      if (applied.has(file)) continue;
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      console.log(`应用迁移 ${file} ...`);
      await sql.begin(async (tx) => {
        await tx.unsafe(content);
        await tx`insert into schema_migrations (name) values (${file}) on conflict do nothing`;
      });
      count++;
    }
    console.log(count === 0 ? '没有新的迁移需要执行。' : `完成，共应用 ${count} 个迁移。`);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error('迁移失败：', err);
  process.exit(1);
});
