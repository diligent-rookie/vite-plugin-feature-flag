# vite-plugin-feature-flag

一个用于 Vite 项目的功能开关（Feature Flag）插件，帮助开发者在构建时或运行时控制功能的启用和禁用。

## 适用场景

- AB Test: 短期内上线一部分含有 ab 逻辑的代码，后续业务实验结果出来以后，可能决定是下线还是采用部分代码，可以结合构建工具删除指定注释插件使用；
- Feature Flag: 比如内测版体验功能，短期内只在内网或者指定条件下使用，等到一定时间内决定是采用还是下线，可以结合构建工具删除指定注释插件使用；

## 特性

- 🚀 轻量级 Vite 插件实现
- ⚙️ 支持构建时和运行时功能开关控制
- 📦 易于配置和使用
- 🔄 支持 TypeScript
- 🧪 包含测试用例

## 安装

```bash
npm install vite-plugin-feature-flag -D
# 或
yarn add vite-plugin-feature-flag -D
# 或
pnpm add vite-plugin-feature-flag -D
```

## 使用

### 配置

```javascript
import { defineConfig } from 'vite';
import featureFlagPlugin from 'vite-plugin-feature-flag';
export default defineConfig({
  plugins: [featureFlagPlugin()],
});
```

### 代码中使用

```jsx
import './App.css';

const App = () => {
  // @delete-start
  console.log('这段 log 不显示');
  // @delete-end
  console.log('这段 log 显示');
  return (
    <div>
      {/* @delete-start */}
      <h1>这段文本不显示</h1>
      {/* @delete-end */}
    </div>
  );
};

export default App;
```

## 配置项

| 属性    | 类型                           | 描述                         |
| ------- | ------------------------------ | ---------------------------- |
| enforce | `'pre' \| 'post'`              | 指定插件执行的顺序阶段       |
| include | `string \| string[] \| RegExp` | 指定需要处理的文件或目录路径 |
| exclude | `string \| string[] \| RegExp` | 指定需要排除的文件或目录路径 |
| rules   | `Rule[]`                       | 功能开关规则数组             |

### Rule

| 属性      | 类型       | 描述               |
| --------- | ---------- | ------------------ |
| rule      | `boolean`  | 该规则是否启用     |
| start     | `string`   | 启用的开始标记     |
| end       | `string`   | 启用的结束标记     |
| fileTypes | `string[]` | 启用的文件类型集合 |
