/* eslint-env node */
module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer', // 分析 commit 类型
    '@semantic-release/release-notes-generator', // 生成 release notes（即 CHANGELOG 内容）
    '@semantic-release/changelog', // 更新 CHANGELOG.md
    '@semantic-release/npm', // 发布到 npm
    '@semantic-release/github', // 创建 GitHub Release
    '@semantic-release/git', // 提交 CHANGELOG 和 package.json 更新
  ],
};
