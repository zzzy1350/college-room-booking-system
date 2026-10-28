import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const username = process.env.ADMIN_SETUP_USERNAME?.trim();
const password = process.env.ADMIN_SETUP_PASSWORD;

if (!username || !password || password.length < 8) {
  console.error('请先设置 ADMIN_SETUP_USERNAME 和至少 8 位的 ADMIN_SETUP_PASSWORD。');
  process.exit(1);
}

const target = resolve('.dev.vars');
let publicOrigin = 'http://127.0.0.1:5173';

try {
  const current = readFileSync(target, 'utf8');
  const savedOrigin = current.match(/^PUBLIC_ORIGIN=(.*)$/m)?.[1]?.trim();
  if (savedOrigin) publicOrigin = savedOrigin;
} catch {
  // The file is created on first setup.
}

const salt = randomBytes(18).toString('hex');
const hash = pbkdf2Sync(password, salt, 100_000, 32, 'sha256').toString('hex');
const sessionSecret = randomBytes(32).toString('hex');

writeFileSync(
  target,
  [
    `ADMIN_USERNAME=${username}`,
    `ADMIN_PASSWORD_HASH=${hash}`,
    `ADMIN_PASSWORD_SALT=${salt}`,
    `SESSION_SECRET=${sessionSecret}`,
    `PUBLIC_ORIGIN=${publicOrigin}`,
    '',
  ].join('\n'),
  { encoding: 'utf8', mode: 0o600 },
);

console.log(`管理员配置已写入 .dev.vars（账号：${username}）。密码和会话密钥未打印。`);
