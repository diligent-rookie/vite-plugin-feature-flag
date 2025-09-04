import { execSync } from 'child_process';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const newVersion = args[0];

if (!newVersion) {
  console.error('Usage: pnpm run version <version>');
  console.error('Example: pnpm run version 1.2.3-alpha.1');
  process.exit(1);
}

const packageJsonPath = join(__dirname, '../packages/feature-flag-plugin/', 'package.json');

if (!existsSync(packageJsonPath)) {
  console.error('package.json not found.');
  process.exit(1);
}

const currentPackage = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

// 检查是否是合法版本格式（简化校验）
const versionRegex = /^(\d+\.\d+\.\d+(-[a-z]+(\.\d+)?)?)$|^(\d+\.\d+\.\d+)$|^([a-z]+\.\d+)$/;
if (!versionRegex.test(newVersion)) {
  console.error(`Invalid version format: ${newVersion}`);
  process.exit(1);
}

// 使用 npm version 命令（会自动 commit 和 tag）
try {
  execSync(`npm version ${newVersion} --no-git-tag-version`, { stdio: 'inherit' });
  currentPackage.version = newVersion;

  // 手动写入 package.json（避免 npm version 的默认行为）
  writeFileSync(packageJsonPath, JSON.stringify(currentPackage, null, 2) + '\n', 'utf8');
  console.log(`Version updated to ${newVersion}`);

  // 可选：生成 changelog
  execSync('node scripts/generate-changelog.js', { stdio: 'inherit' });

  // 提交更改（可选）
  execSync(`git add package.json CHANGELOG.md`, { stdio: 'inherit' });
  execSync(`git commit -m "chore: release v${newVersion}"`, { stdio: 'inherit' });
  execSync(`git tag v${newVersion}`, { stdio: 'inherit' });

  console.log(`✅ Version ${newVersion} prepared. Run 'git push && git push --tags' to publish.`);
} catch (err) {
  console.error('Failed to update version:', (err as Error).message);
  process.exit(1);
}
