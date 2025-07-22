# vite-plugin-feature-flag

A Vite plugin for managing feature flags in your code.

## Installation

```bash
npm install vite-plugin-feature-flag
# or
yarn add vite-plugin-feature-flag
# or
pnpm add vite-plugin-feature-flag
```

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import featureFlag from 'vite-plugin-feature-flag'

export default defineConfig({
  plugins: [
    featureFlag({
      include: /\.(jsx?|tsx?|less|css)$/,
      rules: [
        {
          rule: true,
          start: '/* feature-flag:start */',
          end: '/* feature-flag:end */',
          fileTypes: ['js', 'jsx', 'ts', 'tsx']
        }
      ]
    })
  ]
})
```

## Options

### include
Type: `string | string[] | RegExp | RegExp[]`
Default: `/\.(jsx?|tsx?|less|css)$/`

Files to include in the transformation.

### exclude
Type: `string | string[] | RegExp | RegExp[]`
Default: `undefined`

Files to exclude from the transformation.

### rules
Type: `Rule[]`

Array of rules for feature flag detection.

#### Rule
```ts
interface Rule {
  rule: boolean;      // Whether this rule is active
  start: string;      // Start marker
  end: string;        // End marker
  fileTypes: string[]; // File types this rule applies to
}
```

## License

MIT
