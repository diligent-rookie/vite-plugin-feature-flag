import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

function normalizeVersion(input: string): string {
  const v = input.trim();
  return v.startsWith('v') ? v.slice(1) : v;
}

function updateJsonVersion(filePath: string, version: string) {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const json = JSON.parse(readFileSync(filePath, 'utf8'));
  json.version = version;
  writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
}

function main() {
  const raw = process.argv[2] || process.env.VERSION;
  if (!raw) {
    console.error('Expected version argument. Usage: tsx scripts/sync-version.ts <version>');
    process.exit(1);
  }

  const normalized = normalizeVersion(raw);

  const rootPkg = join(process.cwd(), 'package.json');
  const pkgPkg = join(process.cwd(), 'packages', 'feature-flag-plugin', 'package.json');

  updateJsonVersion(rootPkg, normalized);
  updateJsonVersion(pkgPkg, normalized);

  console.log(`Synchronized version to ${normalized} for root and packages/feature-flag-plugin`);
}

main();


