# Migration Guide — 接入新项目分步指南

> 目标：在一个新的 React 19 + Vite 项目里完整复现本设计系统（含暗色默认、玻璃氛围）。非 React 项目照做 §1–§4、§7（CSS 是框架无关的；组件可按 `docs/components.md` 的 DOM 契约用任何模板实现）。

## 0. 依赖

- 运行时：**零依赖**（纯 CSS + 原生 DOM API）。
- 组件（可选）：React ≥ 19（Slider 用到 ref-as-prop；React 18 需改回 `forwardRef`）。
- 色板再生成（可选 devDependency）：`@material/material-color-utilities` + `tsx` + Node ≥ 18。（该包 0.4.0 的内部 ESM 导入无扩展名，纯 `node` 无法加载，必须 tsx 执行。）

```sh
npm i -D @material/material-color-utilities tsx
```

## 1. 复制文件

把 `design-system/` 整个目录拷进新仓库（位置随意，下文以根目录为例）。最小集合 = `theme/tokens.css` + `theme/base.css`；要玻璃氛围就带上 `site-background.css` + `utilities.css`；要源项目同款布局再加 `layout-split.css`；想省事可用 `glass.css`。

## 2. index.html

```html
<head>
  …
  <!-- 字体：Manrope(display) + Inter(body) + Maple Mono NF CN(mono)。
       禁 Google Fonts（中国大陆不可达）；三家 CDN 均 font-display: swap。 -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/manrope@5.3.0/latin.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/inter@5.3.0/latin.css" />
  <link rel="stylesheet" href="https://fontsapi.zeoseven.com/442/main/result.css" />

  <!-- 浏览器 chrome 颜色；useTheme 会在切换时用计算后的 background token 更新它 -->
  <meta name="theme-color" content="#10140f" />

  <!-- 首帧前应用已保存主题（默认 dark），防止闪白。MUST 内联在 <head>。 -->
  <script>
    (function () {
      try {
        var theme = localStorage.getItem('my-site-theme')
        if (theme !== 'light' && theme !== 'dark' && theme !== 'system') theme = 'dark'
        if (theme !== 'system') document.documentElement.setAttribute('data-theme', theme)
      } catch (err) { /* ignore storage errors */ }
    })()
  </script>
</head>
<body>
  <!-- 玻璃氛围的底：放在应用最外层、内容之前 -->
  <div class="site-bg" aria-hidden="true"></div>
  <div id="root"></div>
</body>
```

要点：
- localStorage 键 `my-site-theme` 与 §5 的 `STORAGE_KEY` **必须一致**（源项目用 `tuning-luna-theme`，换键时两处同步改）。
- `#10140f` 是当前种子色的 dark background——换种子后重新生成时同步更新此初值。

## 3. 入口 CSS（顺序固定）

```css
/* src/index.css */
@import '../design-system/theme/tokens.css';          /* 自带 @import colors.css */
@import '../design-system/theme/base.css';
@import '../design-system/theme/site-background.css';
@import '../design-system/theme/utilities.css';
/* 可选 */
@import '../design-system/theme/layout-split.css';
@import '../design-system/theme/glass.css';
```

在 `:root`（或独立小文件）配置站点背景图：

```css
:root {
  --site-bg-image: url('/assets/site-bg.png'); /* 暗色、有纹理的图最佳 */
}
```

## 4. 页面骨架

```tsx
import '../index.css'

export default function Page() {
  return (
    <>
      <div className="site-bg" aria-hidden="true" />
      <div className="layout">            {/* 或自己的容器，但 MUST position: relative; z-index: 1 */}
        <div className="layout__content">
          <main>…</main>
        </div>
      </div>
    </>
  )
}
```

不用 split 布局时，自己的内容层 MUST 至少 `position: relative; z-index: 1` 以浮在 `.site-bg`（z-index 0）之上；顶栏若是 sticky 玻璃，z-index 取 100。

## 5. 主题切换

```sh
cp design-system/hooks/useTheme.ts src/hooks/
```

把 `STORAGE_KEY` 改成 `'my-site-theme'`（与 §2 内联脚本一致）。挂一个切换按钮（完整代码见 `docs/components.md` §ThemeToggle）：

```tsx
import { useTheme } from './hooks/useTheme'
import { IconButton } from '../design-system/components/IconButton'

function ThemeToggle() {
  const { mode, cycle } = useTheme()
  return <IconButton icon={mode === 'dark' ? 'moon' : mode === 'light' ? 'sun' : 'monitor'}
    label="Toggle theme" onClick={cycle} />
}
```

直接从 `design-system/components/` import 也可以；更常见的做法是把用到的组件复制进 `src/components/`（保持 colocated CSS 一起复制）。

## 6. （可选）滚动显现

Section.css 已内建 `.pre-reveal` 机制。把包里的 `hooks/useScrollReveal.ts` 复制进项目并在根组件调用 `useScrollReveal()` 即可（零参数，自动观察所有 `.m3-section`）。

## 7. 非 React / 无构建项目

- CSS 五个文件按 §3 顺序 `<link>` 引入（tokens.css 里的 `@import './colors.css'` 同目录有效；跨目录时改为分别引入两个文件）。
- 组件按 `docs/components.md` 各自的 DOM 契约手写结构；状态层、hover 抬升等行为都在 CSS 里，结构对了效果即对。
- `useTheme` 的逻辑等价于：读写 localStorage → `document.documentElement.setAttribute('data-theme', mode)`（system 时 removeAttribute）→ 更新 `meta[name=theme-color]`。

## 8. 换品牌色

```sh
# POSIX
SEED_COLOR=#006A6A npx tsx design-system/scripts/gen-theme.mjs
# Windows cmd
set SEED_COLOR=#006A6A && npx tsx design-system\scripts\gen-theme.mjs
# PowerShell
$env:SEED_COLOR='#006A6A'; npx tsx design-system/scripts/gen-theme.mjs
```

提交再生的 `theme/colors.css`。玻璃、滚动条、边框等派生 token 自动跟随（它们引用角色而非字面值）。同步更新 index.html 的 theme-color 初值为新 dark `background`。

## 9. 验收清单

- [ ] 三种主题（system/light/dark）下颜色、玻璃、滚动条全部正确切换，无闪白。
- [ ] `prefers-reduced-motion` 下动画消失但布局不破。
- [ ] 键盘 Tab 可见焦点环（primary 色 2px）。
- [ ] 玻璃面板背后有图像/内容可模糊；无玻璃嵌套。
- [ ] 组件 CSS 里 grep 不到 `#[0-9a-f]{3,8}`（hex）与 rgba 字面量（`glass-highlight` 与滚动条 token 的定义处除外——它们在 tokens.css 中）。
- [ ] Safari 下玻璃生效（`-webkit-backdrop-filter`）。
- [ ] 360px 宽窄屏不溢出。
