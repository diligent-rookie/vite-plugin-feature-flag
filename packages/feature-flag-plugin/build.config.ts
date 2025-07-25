import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  externals: ['vite', 'rollup'],
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
  outDir: 'dist',
});
