/**
 * 生成管理员密码哈希（argon2id）
 * 用法：npm run admin:hash -- "你的密码"
 * 将输出写入环境变量 ADMIN_PASSWORD_HASH
 */
import { hash } from '@node-rs/argon2';

async function main() {
  const password = process.argv.slice(2).join(' ').trim();
  if (!password || password.length < 8) {
    console.error('请提供至少 8 位的密码：npm run admin:hash -- "你的密码"');
    process.exit(1);
  }
  const digest = await hash(password, {
    algorithm: 2,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
  console.log('\nADMIN_PASSWORD_HASH=' + digest + '\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
