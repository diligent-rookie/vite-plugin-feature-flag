import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface Commit {
  hash: string;
  message: string;
  type: string;
  scope?: string;
}

interface ChangelogEntry {
  version: string;
  date: string;
  changes: Record<string, Commit[]>;
}

const CONVENTIONAL_TYPES = [
  'feat',
  'fix',
  'chore',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'revert'
] as const;

const TYPE_MAPPINGS: Record<string, string> = {
  'feat': 'Added',
  'fix': 'Fixed',
  'chore': 'Changed',
  'refactor': 'Changed',
  'perf': 'Changed',
  'style': 'Changed',
  'docs': 'Documentation',
  'test': 'Tests',
  'build': 'Build',
  'ci': 'CI',
  'revert': 'Reverted'
};

function executeCommand(command: string): string {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error(`Command failed: ${command}`, error);
    return '';
  }
}

function getLatestTag(): string | null {
  return executeCommand('git describe --tags --abbrev=0 2>/dev/null') || null;
}

function getCommits(fromTag?: string): Commit[] {
  let command = 'git log --no-merges --pretty=format:"%H %s"';
  if (fromTag) {
    command += ` ${fromTag}..HEAD`;
  }
  
  const output = executeCommand(command);
  if (!output) return [];
  
  return output.split('\n')
    .filter(line => line.trim())
    .map(line => {
      const [hash, ...messageParts] = line.split(' ');
      const message = messageParts.join(' ');
      const conventionalMatch = message.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.*)$/);
      
      if (conventionalMatch) {
        const [, type, scope, commitMessage] = conventionalMatch;
        return {
          hash: hash.substring(0, 7),
          message: commitMessage,
          type,
          scope: scope || undefined
        };
      }
      
      return {
        hash: hash.substring(0, 7),
        message,
        type: 'other'
      };
    });
}

function categorizeCommits(commits: Commit[]): Record<string, Commit[]> {
  const categorized: Record<string, Commit[]> = {};
  
  for (const commit of commits) {
    // @ts-expect-error expectation
    const type = CONVENTIONAL_TYPES.includes(commit.type) ? commit.type : 'other';
    if (!categorized[type]) {
      categorized[type] = [];
    }
    categorized[type].push(commit);
  }
  
  return categorized;
}

function calculateNextVersion(latestTag: string | null, commits: Commit[]): string {
  if (!latestTag) return 'v1.0.0';
  
  const version = latestTag.startsWith('v') ? latestTag.substring(1) : latestTag;
  const parts = version.split('.').map(Number);
  if (parts.length < 3) {
    throw new Error(`Invalid version format: ${latestTag}`);
  }
  const [major, minor, patch] = parts;
  
  const hasFeatures = commits.some(commit => commit.type === 'feat');
  const hasFixes = commits.some(commit => commit.type === 'fix');
  const hasBreaking = commits.some(commit => commit.message.includes('!:'));

  if (hasBreaking) {
    return `v${major + 1}.0.0`;
  } else if (hasFeatures) {
    return `v${major}.${minor + 1}.0`;
  } else if (hasFixes) {
    return `v${major}.${minor}.${patch + 1}`;
  }
  
  return `v${major}.${minor}.${patch}`;
}

function generateChangelogEntry(version: string, commits: Commit[]): ChangelogEntry {
  return {
    version,
    date: new Date().toISOString().split('T')[0],
    changes: categorizeCommits(commits)
  };
}

function formatChangelogEntry(entry: ChangelogEntry): string {
  let content = `## [${entry.version}] - ${entry.date}\n\n`;
  
  for (const [type, commits] of Object.entries(entry.changes)) {
    if (commits.length === 0) continue;
    
    const title = TYPE_MAPPINGS[type] || 'Other';
    content += `### ${title}\n\n`;
    
    for (const commit of commits) {
      if (commit.scope) {
        content += `- **${commit.scope}**: ${commit.message} (${commit.hash})\n`;
      } else {
        content += `- ${commit.message} (${commit.hash})\n`;
      }
    }
    content += '\n';
  }
  
  return content;
}

function readChangelog(filePath: string): string {
  if (existsSync(filePath)) {
    return readFileSync(filePath, 'utf8');
  }
  return '';
}

function writeChangelog(filePath: string, content: string): void {
  writeFileSync(filePath, content);
  console.log(`✅ Updated changelog at ${filePath}`);
}

function generateLinks(version: string, previousTag?: string): string {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) {
    console.warn('⚠️  GITHUB_REPOSITORY environment variable not set');
    return '';
  }

  if (previousTag) {
    return `[${version}]: https://github.com/${repo}/compare/${previousTag}...${version}`;
  } else {
    return `[${version}]: https://github.com/${repo}/releases/tag/${version}`;
  }
}

function updateChangelogFile(filePath: string, newEntry: string, version: string, previousTag?: string) {
  let content = readChangelog(filePath);
  
  // 如果是新文件，添加标题
  if (!content || content.trim() === '') {
    content = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n`;
  }
  
  // 添加版本比较链接
  let links = '';
  const lines = content.split('\n');
  const lastLineIndex = lines.length - 1;
  while (lastLineIndex >= 0 && lines[lastLineIndex] === '') {
    lines.pop();
  }
  
  // 检查是否已存在链接部分
  const lastLine = lines[lines.length - 1];
  if (lastLine && lastLine.startsWith('[')) {
    links = lines.pop() || '';
  }
  
  content = lines.join('\n');
  
  // 在第二行后插入新的 changelog 条目（跳过标题）
  const insertIndex = content.indexOf('\n', content.indexOf('\n') + 1) + 1;
  content = content.slice(0, insertIndex) + newEntry + '\n' + content.slice(insertIndex);
  
  // 添加或更新链接
  const newLink = generateLinks(version, previousTag);
  if (newLink) {
    if (links) {
      links = newLink + '\n' + links;
    } else {
      links = '\n' + newLink;
    }
  }
  
  content += links + '\n';
  
  writeChangelog(filePath, content);
}

function main() {
  const changelogPath = join(process.cwd(), 'CHANGELOG.md');
  
  const latestTag = getLatestTag();
  if(!latestTag){
    console.log('ℹ️  No previous tag found');
    return;
  }
  const commits = getCommits(latestTag);
  
  if (commits.length === 0) {
    console.log('ℹ️  No commits found since last release');
    return;
  }
  
  const nextVersion = calculateNextVersion(latestTag, commits);
  const changelogEntry = generateChangelogEntry(nextVersion, commits);
  const formattedEntry = formatChangelogEntry(changelogEntry);
  
  updateChangelogFile(changelogPath, formattedEntry, nextVersion, latestTag);
  
  // 输出供 GitHub Actions 使用的环境变量
  console.log(`::set-output name=version::${nextVersion}`);
  console.log(`::set-output name=changelog::${JSON.stringify(formattedEntry)}`);
  console.log(`::set-output name=tag::${nextVersion}`);
  
  // 同时设置环境变量（适用于较新版本的 GitHub Actions）
  console.log(`VERSION=${nextVersion}`);
  console.log(`CHANGELOG_ENTRY=${JSON.stringify(formattedEntry)}`);
  console.log(`TAG=${nextVersion}`);
}

main();
