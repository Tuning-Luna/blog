# MD3 × Glassmorphism 设计系统资源包

从 [Tuning-Luna.github.io](https://tuning-luna.github.io/)（React 19 + Vite 线上项目）**原样提取**的设计系统资源包：Material Design 3 token 体系 + Glassmorphism 玻璃材质 + 可复用组件 + 主题生成脚本 + 面向 AI Agent 的完整文档。提取日期 2026-08-16，除 3 处标注的解耦改动外与源项目逐字一致（见 `AGENT-GUIDE.md` §17）。

## 这包里有什么

| 目录 | 内容 |
|---|---|
| `theme/` | 全部设计 token（`tokens.css` 静态规格 + `colors.css` 生成色板）与全局样式（reset / 站点背景 / 工具类 / 布局模式 / 可选玻璃工具类） |
| `components/` | 8 个零业务依赖的 React 19 组件（Button / Card / Chip / IconButton / Icon / Section / Slider / Stat）+ AppBar 样式 |
| `hooks/` | `useTheme`（三态主题持久化）、`useSpotlight`（追光）、`useScrollReveal`（Section 滚动显现） |
| `utils/` | `motion.ts`（MD3 缓动 JS 求值 + tween） |
| `scripts/` | `gen-theme.mjs`（种子色 → 全套 MD3 颜色 token） |
| `docs/` | token 全量参考、组件 DOM 契约、新项目接入指南 |

## 文档导航

- **AI Agent 必读**：[`AGENT-GUIDE.md`](./AGENT-GUIDE.md) —— 设计原则、玻璃配方与适用/禁用场景、复用流程、NEVER 清单、扩展原则。
- 查 token 值：[`docs/tokens-reference.md`](./docs/tokens-reference.md)
- 查组件用法 / DOM：[`docs/components.md`](./docs/components.md)
- 接入新项目：[`docs/migration-guide.md`](./docs/migration-guide.md)

## 快速开始（最小接入）

```css
/* 入口 CSS（按此顺序） */
@import 'design-system/theme/tokens.css';  /* 自带 @import colors.css */
@import 'design-system/theme/base.css';
@import 'design-system/theme/site-background.css'; /* 需要玻璃氛围时 */
@import 'design-system/theme/utilities.css';
/* 组件 CSS 按需引入 */
```

HTML 侧两件事（细节见 migration-guide）：

```html
<!-- 1. 字体（无 Google Fonts，中国大陆可达） -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/manrope@5.3.0/latin.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/inter@5.3.0/latin.css" />
<link rel="stylesheet" href="https://fontsapi.zeoseven.com/442/main/result.css" />

<!-- 2. 首帧前应用主题（默认暗色，避免闪白） -->
<script>
  (function () {
    try {
      var theme = localStorage.getItem('my-site-theme')
      if (theme !== 'light' && theme !== 'dark' && theme !== 'system') theme = 'dark'
      if (theme !== 'system') document.documentElement.setAttribute('data-theme', theme)
    } catch (err) { /* ignore */ }
  })()
</script>
```

玻璃面板的核心配方（完整说明在 AGENT-GUIDE §12）：

```css
background-color: color-mix(in srgb,
  var(--md-sys-color-surface-container-low) calc(var(--md-glass-opacity) * 100%), transparent);
-webkit-backdrop-filter: blur(var(--md-glass-blur)) saturate(var(--md-glass-saturate));
backdrop-filter: blur(var(--md-glass-blur)) saturate(var(--md-glass-saturate));
border: 1px solid var(--md-glass-border);
box-shadow: var(--md-sys-elevation-level1), var(--md-glass-highlight);
```

## 重新生成色板

```sh
npm i -D @material/material-color-utilities tsx
npx tsx design-system/scripts/gen-theme.mjs                      # 默认种子 #18F741
SEED_COLOR=#006A6A npx tsx design-system/scripts/gen-theme.mjs   # 换品牌色
```

> 注意：`@material/material-color-utilities@0.4.0` 的内部 ESM 导入无扩展名，纯 `node` 无法加载本脚本，必须经 `tsx` 执行（源项目的 `npm run theme:gen` 同样走 tsx）。

## 约束速记

- 组件样式只消费 `--md-*` token，不写硬编码值；`colors.css` 是生成物，永不手改。
- 玻璃不嵌套玻璃；`backdrop-filter` 必须带 `-webkit-` 前缀。
- 默认暗色、三态主题（system / light / dark），`data-theme` 缺省即 system。
- 动画必须处理 `prefers-reduced-motion`。
- 完整规则见 `AGENT-GUIDE.md` §15 的 NEVER 清单。
