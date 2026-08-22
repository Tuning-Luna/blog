# Components — 组件目录与 DOM 契约

> 所有组件均为 **React 19 函数组件、零业务依赖、只消费 `--md-*` token**；CSS 与 TSX colocated。纯 CSS 项目可只取 `.css` 文件并按本文档的 DOM 契约写结构。TS 惯例：`import type` 用于纯类型导入（`verbatimModuleSyntax`）。
>
> 所有用户可见文案 SHOULD 来自调用方（源项目走 i18n），组件本身不含硬编码文案；图标按钮的 `label`（aria-label）为必填。

---

## Button（`components/Button.tsx` + `Button.css`）

M3 按钮，filled / tonal / text 三变体。传 `href` 渲染 `<a>`，否则 `<button>`；http(s)/mailto 外链自动 `target="_blank" rel="noreferrer noopener"` 并加 ↗ 指示。

**Props**：`variant?: 'filled' | 'tonal' | 'text'`（默认 filled）、`href?`、`children`、其余透传原生 button/anchor 属性。

```tsx
<Button variant="filled" href="https://github.com/me">GitHub</Button>
<Button variant="tonal" onClick={copyEmail}>Copy email</Button>
```

DOM 契约：

```html
<button class="m3-button m3-button--filled">
  <span class="m3-button__label">Label</span>
</button>
<a class="m3-button m3-button--filled" href="…" target="_blank" rel="…">
  <span class="m3-button__label">Label</span><span class="m3-button__icon">↗</span>
</a>
```

样式要点：高 40px、`corner-full`、label-large；hover/press 用 `::after` currentColor 状态层（8%/12%）；filled 静止 level0 → hover level1；text 变体内边距收窄到 `md`；`:active` 轻微 `scale(0.98)`（reduced-motion 下取消）。

## Card（`Card.tsx` + `Card.css`）

玻璃卡片。**Props**：`elevation?: 1 | 2 | 3`（默认 1）+ 原生 div 属性。子内容自由填充。

```tsx
<Card elevation={1} className="spotlight" onMouseMove={handleSpotlight}>
  …
</Card>
```

DOM：`<div class="m3-card m3-card--elev1">…</div>`

样式要点：surface-container-low 玻璃底、`corner-large`、elevN + glass-highlight、hover 抬升一级阴影并 `translateY(-2px) scale(1.02)`。它只是容器，不含排版——参考源项目 ProjectCard 在其上叠 `display: flex; flex-direction: column; gap/ padding`。

## Chip（`Chip.tsx` + `Chip.css`）

M3 assist chip（span，非交互）。**Props**：原生 span 属性（`className`、事件等均透传）。

```tsx
<Chip>TypeScript</Chip>
```

DOM：`<span class="m3-chip">TypeScript</span>`

需要前导图标时直接在 children 里放 `<Icon>`——chip 本身是 inline-flex + `gap`，图标会自动排版（源项目的 TechChip 就是这样给每个技术项配品牌图标）。

样式要点：高 32px、`corner-full`、outline-variant 描边、透明底、on-surface-variant 文字、**mono 字体**（技术语义）。

## IconButton（`IconButton.tsx` + `IconButton.css`）

标准 40px 图标按钮。**Props**：`icon: IconName`、`label: string`（必填，aria-label）+ 原生 button 属性。

```tsx
<IconButton icon="sun" label="Switch theme" onClick={cycle} />
```

DOM：`<button type="button" class="m3-icon-button" aria-label="…"><svg …/></button>`

样式要点：`corner-full`、透明底 + 状态层（currentColor 8%/12%）、on-surface-variant 图标色。需要别的尺寸（源项目播放器用 48px 主按钮 / 36px skip / 32px mute）按同模式新类名缩放，NEVER 改基类。

## Icon（`Icon.tsx`）

内联 SVG 图标集，`viewBox="0 0 24 24"`。**Props**：`name: IconName`、`size?: number`（默认 20）+ SVG 属性。

可用 `IconName`：`github gmail discord telegram spotify external arrowRight sun moon monitor language star fork folder people commit chevronUp play pause alert skipBack skipForward volumeHigh volumeLow volumeMute music`。

三类实现：品牌标（github/gmail/discord/telegram/spotify）与统计/强调图标（star/folder/people/commit）填充式；其余 Lucide 风格 1.75px 描边。`aria-hidden` 固定，可聚焦性关闭。扩展新图标 = 在 `FILLED` / `STROKE` 映射表加 path 字符串（同一名字在 FILLED 表出现则永远渲染填充式——改名比改风格容易出错，NEVER 让一个名字同时有两套）。

## Section（`Section.tsx` + `Section.css`）

区块包裹器：eyebrow（mono 小标）+ 标题（display 字体 headline-medium）+ 可选副标题，内含 `.container`。**Props**：`id`（锚点）、`eyebrow`、`title?`、`subtitle?`、`children`。

```tsx
<Section id="projects" eyebrow="02 · work" title="Projects" subtitle="…">
  {content}
</Section>
```

DOM 契约：

```html
<section id="projects" class="m3-section">
  <div class="container">
    <header class="m3-section__header">
      <span class="m3-section__eyebrow">…</span>
      <h2 class="m3-section__title">…</h2>
      <p class="m3-section__subtitle">…</p>
    </header>
    …children…
  </div>
</section>
```

**滚动显现（scroll-reveal）**：CSS 侧已内建——`.m3-section.pre-reveal` 隐藏并在移除该类时以 medium2/decelerate 淡入上移 40px。JS 侧直接用包里的 `hooks/useScrollReveal.ts`（源项目同款，从其 App.tsx 提取为 hook）：

```tsx
import { useScrollReveal } from './hooks/useScrollReveal'

export default function App() {
  useScrollReveal()
  // …
}
```

## Slider（`Slider.tsx` + `Slider.css`）

原生 `<input type="range">` 的 MD3 皮肤。**Props**：`label`（必填，aria-label）、`value`、`max`、`step?`、`disabled?`、`valueText?`（如 "70%"）、`onChange(value)`、`wheelStep?`（滚轮步进并阻止页面滚动）、`ref?`（React 19 ref-as-prop）。

```tsx
<Slider label="Volume" value={v} max={100} wheelStep={5}
  valueText={`${v}%`} onChange={setV} />
```

样式要点：20px 命中区、4px 轨道；Chromium 用 `--range-progress` 渐变画已填充段，Firefox 用 `::-moz-range-progress`；thumb 12px 主色圆点，hover/focus ×1.2、active ×1.4；焦点环 `corner-full`。进度变量由组件内联 style 提供，NEVER 手写。

## Stat（`Stat.tsx` + `Stat.css`）

数值统计对。**Props**：`value: number | string`、`label: string`、`icon?: IconName`（可选前导填充图标，渲染在数值上方、primary 色 20px）。

```tsx
<Stat value={42} label="Repos" />
<Stat icon="folder" value={42} label="Repos" />
```

DOM：`<div class="m3-stat"><svg class="m3-stat__icon" …/><span class="m3-stat__value">42</span><span class="m3-stat__label">Repos</span></div>`

样式要点：value 用 mono + headline-small + `tabular-nums`；label 用 body-small + on-surface-variant；icon 用 primary 色（M3 统计卡惯例：图标取主色做视觉锚点）。

## AppBar（仅 `AppBar.css`，DOM 契约）

源项目 TSX 业务耦合（导航表、i18n、头像数据），故只提取样式。契约：

```html
<header class="appbar">
  <div class="container appbar__inner">
    <a class="appbar__brand" href="#top"><img class="appbar__avatar" …/> <span class="appbar__name">…</span></a>
    <nav class="appbar__nav" aria-label="Primary">
      <a class="appbar__link" href="#section">…</a>…
    </nav>
    <div class="appbar__actions">…toggles…</div>
  </div>
</header>
```

样式要点：sticky top、z-index 100、**surface-container 玻璃底**（唯一用该角色的玻璃面）+ border-bottom 玻璃描边（无阴影）；≥680px 三段 flex（brand | 居中 nav | actions），<680px nav 掉到第二行横向滚动（隐藏滚动条）。内层 min-height 64px。

## 主题切换按钮（组合模式，源项目 ThemeToggle 的去耦合版）

```tsx
import { useTheme } from '../hooks/useTheme'
import { IconButton } from './IconButton'
import type { IconName } from './Icon'

export function ThemeToggle() {
  const { mode, cycle } = useTheme()
  const icon: IconName = mode === 'dark' ? 'moon' : mode === 'light' ? 'sun' : 'monitor'
  return <IconButton icon={icon} label={`Theme: ${mode}`} onClick={cycle} />
}
```

`useTheme`（`hooks/useTheme.ts`）：`mode`（system/light/dark）、`cycle`（system → light → dark 循环）。行为：写 `<html data-theme>`（system = 移除属性）、持久化 localStorage（源键名 `tuning-luna-theme`，接入时改 `STORAGE_KEY`；读写均有 try/catch，隐私模式安全）、把计算后的 `--md-sys-color-background` 同步进 `<meta name="theme-color">`、监听系统主题变化。默认 **dark**。

## 追光 spotlight（`utilities.css` + `hooks/useSpotlight.ts`）

```tsx
<div className="spotlight" onMouseMove={handleSpotlight}>…</div>
```

`.spotlight` 提供 `position: relative` + `::before` 径向渐变光晕（240px、primary 12%→4%→透明），handler 把光标坐标写进 `--spot-x/--spot-y`。子元素被自动提到光晕之上（`.spotlight > *`）。**约束**：NEVER 用于 sticky/fixed 元素（relative 会顶掉定位）——那种情况复制 layout-split.css 里 rails 的 `::before` 做法。

## 站点背景（`site-background.css`）

```tsx
<div className="site-bg" aria-hidden="true" />
```

一个元素即可（fixed 全屏，z-index 0；内容层用 `.layout` 或自己的 `position: relative; z-index: 1`）。MUST 在 `:root` 设 `--site-bg-image: url(…)`（默认 `none` 时玻璃没有可模糊的内容）。
