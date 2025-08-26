import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ICONS } from './constant'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packagesDir = join(__dirname, '..', 'packages');

const apps = readdirSync(packagesDir).filter((name) => {
  const fullPath = join(packagesDir, name);
  return statSync(fullPath).isDirectory();
});

for (const app of apps) {
  const appPath = join(packagesDir, app);
  console.log(`${ICONS.LOADING} Building ${app}...`);
  try {
    execSync('pnpm run build', {
      cwd: appPath,
      stdio: 'inherit',
    });
    console.log(`${ICONS.SUCCESS} Built ${app} successfully.`);
  } catch (err) {
    console.error(`${ICONS.ERROR} Failed to build ${app}:`, err);
    process.exit(1);
  }
}
