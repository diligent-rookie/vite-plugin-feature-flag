export const DEFAULT_RULES = [
  {
    rule: true,
    start: '// @delete-start',
    end: '// @delete-end',
    fileTypes: ['jsx', 'tsx', 'js', 'ts', 'css', 'less'],
  },
  {
    rule: true,
    start: '{/* @delete-start */}',
    end: '{/* @delete-end */}',
    fileTypes: ['jsx', 'tsx'],
  }
]
