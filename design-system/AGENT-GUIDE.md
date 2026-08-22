# AGENT-GUIDE — MD3 × Glassmorphism 设计系统使用规范

> 本文档面向 **AI Agent**。如果你（Agent）拿到了 `design-system/` 这个文件夹并被要求"用这套设计系统建页面 / 加组件 / 改样式"，请**先完整阅读本文档**，再动手写代码。本文档中的 MUST / NEVER / SHOULD 是硬性规则，违反它们等于破坏这套设计系统。
>
> 速查类信息（全部 token 值、组件 DOM 契约、接入步骤）在：
> - `docs/tokens-reference.md` — 全量 token 表（颜色 / 字体 / 间距 / 圆角 / 阴影 / 动效 / 玻璃）
> - `docs/components.md` — 每个组件的 Props、DOM 结构、类名、状态
> - `docs/migration-guide.md` — 把本包接入一个新项目的分步操作

---

## 1. 这个文件夹是什么（定位）

本文件夹是从真实项目 **Tuning-Luna.github.io**（React 19 + Vite 个人主页，线上运行于 <https://tuning-luna.github.io/>）中**原样提取**的设计系统资源包，提取日期 2026-08-16。它包含：

- 一套 **Material Design 3 (MD3)** 设计规范的落地实现：颜色、字体、间距、圆角、阴影、动效全部以 CSS 自定义属性（design token）形式存在，命名遵循 MD3 官方 token 体系（`--md-sys-*` / `--md-ref-*`）。
- 一套 **Glassmorphism（毛玻璃）** 视觉语言的完整实现：玻璃 token、玻璃配方、以及"玻璃成立的前提"——固定模糊站点背景层。
- 一组 **可复用的 React 19 组件**（纯展示、零业务依赖）及其 colocated CSS。
- 一个 **从种子色生成全套 MD3 颜色 token 的脚本**（基于 Google 官方 `@material/material-color-utilities`）。
- 主题持久化 hook、动效工具、追光（cursor spotlight）工具。

**本包不是理论规范，而是经过线上验证的实现快照。** 所有数值、阴影、缓动、透明度都来自源项目，提取时未做"美化"。除了下文明确标注的 3 处解耦性改动（§19），文件内容与源项目一致。

一句话理解整套系统的审美：**暗色优先、以一张模糊的照片为底、所有面板是半透明的磨砂玻璃、玻璃下面透出 MD3 主题色的光。**

---

## 2. 文件结构与职责

```
design-system/
├── README.md                  入口文档：概览 + 快速开始
├── AGENT-GUIDE.md             本文档：完整规范、规则、禁止事项
├── docs/
│   ├── tokens-reference.md    全量 token 参考表（查值用）
│   ├── components.md          组件目录：Props / DOM 契约 / 状态 / 示例
│   └── migration-guide.md     新项目接入分步指南
├── theme/                     ★ 核心：所有设计 token 与全局样式
│   ├── tokens.css             静态 MD3 token（类型/形状/阴影/间距/动效/玻璃/滚动条）
│   │                          内部 @import colors.css；组件样式只许消费这里的变量
│   ├── colors.css             ★ 生成物（种子 #18F741）：39 个颜色角色 × light/dark
│   │                          绝不手改；改色走 scripts/gen-theme.mjs
│   ├── base.css               reset、body 排版、链接/选区/焦点、reduced-motion、滚动条
│   ├── site-background.css    .site-bg 固定模糊背景（玻璃的前提）；图片用
│   │                          --site-bg-image 参数化（源项目指向其个人照片）
│   ├── utilities.css          .container / .visually-hidden / .glass-card / .spotlight 通用工具类
│   ├── layout-split.css       源项目的"双侧 sticky 玻璃栏 + 中间滚动"布局（可选参考模式）
│   └── glass.css              可选封装：.m3-glass 一行上玻璃（本包新增，非源项目内容）
├── components/                可复用 React 19 组件（TSX + colocated CSS）
│   ├── Button.tsx/.css        按钮：filled / tonal / text 三变体，自动外链处理
│   ├── Card.tsx/.css          玻璃卡片：elev1/2/3，hover 抬升一级
│   ├── Chip.tsx/.css          assist chip（技术标签、tag）
│   ├── IconButton.tsx/.css    标准 40px 图标按钮
│   ├── Icon.tsx               内联 SVG 图标集（Lucide 风格描边 + 品牌填充图标）
│   ├── Section.tsx/.css       区块包裹器：eyebrow + 标题 + 副标题 + 滚动显现
│   ├── Slider.tsx/.css        原生 range 的 MD3 皮肤（进度填充、交互放大）
│   ├── Stat.tsx/.css          数值统计（mono 数字 + 小标签）
│   └── AppBar.css             顶栏样式（仅 CSS；源 TSX 业务耦合，DOM 契约见 docs）
├── hooks/
│   ├── useTheme.ts            system→light→dark 三态循环 + localStorage 持久化
│   ├── useSpotlight.ts        追光效果的 mousemove handler（写 --spot-x/--spot-y）
│   └── useScrollReveal.ts     Section 滚动显现：观察 .m3-section，进入视口时移除 .pre-reveal
├── utils/
│   └── motion.ts              MD3 缓动的 JS 求值 + 可取消 tween + reduced-motion 探测
└── scripts/
    └── gen-theme.mjs          从种子色生成 theme/colors.css（官方 material-color-utilities）
```

**CSS 引入顺序（消费端）**：

```css
@import 'design-system/theme/tokens.css';        /* 自带 colors.css */
@import 'design-system/theme/base.css';
@import 'design-system/theme/site-background.css'; /* 可选：需要玻璃氛围时 */
@import 'design-system/theme/utilities.css';
@import 'design-system/theme/layout-split.css';    /* 可选：参考布局模式 */
@import 'design-system/theme/glass.css';           /* 可选：一行玻璃工具类 */
```

`site-background.css`、`layout-split.css`、`glass.css` 是可选的；`tokens.css` + `base.css` 是最小集。

---

## 3. 设计原则（源项目的实际原则，非教科书复述）

1. **一切皆 token。** 组件 CSS 中 NEVER 出现硬编码的颜色、字号、圆角、间距、阴影、时长——全部通过 `var(--md-*)` 消费。唯一允许的字面量是纯几何值（如按钮高度 `40px`、滑块 `margin-top: -4px` 这类 M3 规格尺寸）。
2. **颜色是角色，不是值。** 用 `--md-sys-color-primary` 表达"这是主色"，而不是 `#3d6838`。这样换种子色重新生成后全站自动换肤。
3. **暗色优先，三态主题。** 默认 `dark`（不管系统偏好）；用户可循环 system → light → dark。机制见 §5。
4. **玻璃 = MD3 surface 的半透明变体。** 玻璃不是独立于 MD3 的另一套东西：它就是把 surface-container 系列角色用 `color-mix` 打上 `--md-glass-opacity`，再叠加 `backdrop-filter`。详见 §13。
5. **动效克制且成体系。** 只用三个 MD3 缓动 + token 化时长；所有动画 MUST 处理 `prefers-reduced-motion`。
6. **无障碍内建。** `:focus-visible` 全局焦点环、图标按钮强制 `aria-label`、`visually-hidden` 工具类、状态层用 `::after + currentColor` 而非改变背景色。
7. **组件样式 colocated。** 每个 `.tsx` 旁边一个同名 `.css`；类名 `m3-` 前缀 + BEM（`__` 元素 / `--` 修饰符）。
8. **响应式用容器查询（组件在布局列内时）。** 网格断点基于 `.layout__content` 的 `container-type: inline-size`，而非 viewport——源项目的栅格在窄列里也能正确折叠。

---

## 4. Theme 与 Token 的组织方式

### 4.1 Token 分层

| 层 | 前缀 | 文件 | 性质 |
|---|---|---|---|
| 字体族参考 | `--md-ref-typeface*` | tokens.css | 静态 |
| 系统语义 token | `--md-sys-typescale / shape / elevation / spacing / motion-*` | tokens.css | 静态（M3 规格值） |
| 颜色角色 | `--md-sys-color-*` | colors.css | **生成物**，39 角色 × 2 scheme |
| 玻璃扩展 | `--md-glass-*` | tokens.css | 站点级派生 token |
| 滚动条扩展 | `--md-scrollbar-*` | tokens.css | 派生 token（对 `on-surface` 做 color-mix） |
| 站点背景 | `--site-bg-image` | site-background.css | 包内参数化新增 |

MD3 没有的东西（玻璃、滚动条）以 `--md-glass-*` / `--md-scrollbar-*` 命名并**派生自** MD3 角色，而不是另起炉灶的新颜色。

### 4.2 主题切换机制（三态）

- `<html data-theme>` 属性：**缺省 = system**（跟随 `prefers-color-scheme`），`'light'` / `'dark'` 为手动覆盖。NEVER 写 `data-theme="system"`——system 就是移除属性。
- colors.css / tokens.css / base.css 中每个 dark 覆盖块都成对出现：
  ```css
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) { /* …dark tokens… */ }
  }
  :root[data-theme='dark'] { /* …同一组 dark tokens… */ }
  ```
  新增任何主题感知 token MUST 复制这个双通道模式，两个块的值 MUST 一致。
- `color-scheme` 属性同步设置（base.css），让滚动条/表单控件原生 UI 跟随主题。
- JS 侧：`hooks/useTheme.ts` 提供 `mode / cycle`（cycle 顺序 system → light → dark）；localStorage 读写均有 try/catch 防护（隐私模式）。`applyMode` 同时把计算后的 `--md-sys-color-background` 写进 `<meta name="theme-color">`（浏览器 chrome 色）。
- **首帧不闪白**依赖 index.html 里的内联 pre-paint 脚本（见 `docs/migration-guide.md`）。NEVER 依赖 React 挂载后再设 `data-theme`。
- localStorage 键：源项目为 `tuning-luna-theme`，默认 `dark`。接入新项目时 SHOULD 换成自己的键名（hook 里的 `STORAGE_KEY` 常量 + pre-paint 脚本同步改）。

### 4.3 颜色生成链路

```
种子色 (#18F741)
  → scripts/gen-theme.mjs（@material/material-color-utilities
     DynamicScheme + MaterialDynamicColors，Variant.TONAL_SPOT，contrast 0）
  → theme/colors.css（39 角色 × light/dark，提交进仓库）
  → 运行时零 JS 依赖
```

改品牌色的唯一正确路径：`SEED_COLOR=#xxxxxx npx tsx design-system/scripts/gen-theme.mjs`，然后提交再生的 colors.css。NEVER 手改 colors.css 里任何一行。

---

## 5. Color System

### 5.1 三个"色容器"层级 + 对比色，构成全部用法

| 角色 | 用途（源项目实际用法） |
|---|---|
| `primary` / `on-primary` | 主 CTA（filled button）、链接、播放按钮、焦点环、eyebrow 文字 |
| `primary-container` / `on-primary-container` | 头像光环、选区背景、hero 渐变染色 |
| `secondary-container` / `on-secondary-container` | tonal button、播放器封面占位 |
| `surface-container-low` | **玻璃面板的默认底色**（卡片、侧栏、行） |
| `surface-container` | 顶栏玻璃底色、行 hover 升级色 |
| `surface-container-high(est)` | 顶栏链接 hover、卡片 hover 的不透明替代 |
| `surface-container-highest` | 滑块未填充轨道 |
| `surface` / `on-surface` | 主文字 |
| `on-surface-variant` | 次要文字（副标题、描述、标签） |
| `outline` | 弱化的元信息（归档标记） |
| `outline-variant` | chip 描边、玻璃边框的基色（color-mix 32% 透明） |
| `error` / `on-error` | 播放器错误态按钮 |
| `background` / `on-background` | body 底色/正文（配合 .site-bg 蒙层） |
| `inverse-*`、`surface-dim/bright/tint`、`tertiary*` | 生成齐全但源项目页面未直接使用 |

完整 39 角色 × light/dark 十六进制值见 `docs/tokens-reference.md`。

### 5.2 规则

- 新 UI 的颜色选择 MUST 从上表"用途"列里找同类场景对照，NEVER 自造颜色或调整明度。
- 需要"某角色的半透明版"时用 `color-mix(in srgb, var(--md-sys-color-…) N%, transparent)`，NEVER 写 rgba 字面量（会脱离主题）。
- 对比度：玻璃上的正文用 `on-surface` 系；小字用 `on-surface-variant` 时确保字号 ≥ body-small。

---

## 6. Typography

**三个字体族，各司其职**（token：`--md-ref-typeface` / `-display` / `-mono`）：

| Token | 字体 | 用途 |
|---|---|---|
| `--md-ref-typeface` | Inter（正文/UI）| body 默认、按钮、chip 文字 |
| `--md-ref-typeface-display` | Manrope | 大标题：hero 名字、区块标题、分组小标题 |
| `--md-ref-typeface-mono` | Maple Mono NF CN | 技术强调：eyebrow、chip、统计数字、代码感文本 |

三个栈都带完整 CJK 回退（Noto Sans SC → PingFang SC → Microsoft YaHei → system-ui）。**NEVER 引入 Google Fonts**（源项目受众含中国大陆，被墙）。字体加载用 CDN（jsDelivr 的 fontsource + ZeoSeven），snippet 见 `docs/migration-guide.md` §2。

**15 级 M3 type scale**（display-small 到 label-small，含 size/weight/line-height/tracking 四个子 token）——完整表见 tokens-reference。常用映射：

| 场景 | 级别 |
|---|---|
| 区块标题 | headline-medium（窄栏降到 title-large） |
| 大名字/hero | headline-large |
| 卡片标题 | title-medium / title-small |
| 正文/描述 | body-medium / body-large |
| 按钮/导航/标签 | label-large |
| 元信息小字 | label-small / body-small |

规则：组件里 NEVER 写 `font-size: 14px`，写 `var(--md-sys-typescale-label-large-size)`；行高、字重、字距同理成组使用，NEVER 混搭不同级别的子 token。

---

## 7. Spacing

M3 4dp 网格：`--md-sys-spacing-xs..5xl` = 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px。

- 组件内间隙一般 xs–lg；区块纵向节奏 `2xl`（≥720px 时 `3xl`）；hero 顶尾留白 5xl/4xl。
- 间距 NEVER 用字面量（除个别 M3 规格几何值）；padding/gap/margin 全部取 token。

## 8. Shape / Border Radius

`--md-sys-shape-corner-*`：none 0 / extra-small 4 / small 8 / medium 12 / large 16 / extra-large 28 / full 9999。

源项目映射：**chip、按钮、图标按钮、滑块轨道 = full**；**卡片、播放器 = large(16)**；**列表行 = medium(12)**；**侧栏大面板 = extra-large(28)**；**焦点环 = extra-small**。加新组件时按"越大越浮、越小越实"对照选择。

## 9. Elevation / Shadow

M3 六级 `--md-sys-elevation-level0..5`（key光 + 环境光两层阴影，值见 tokens-reference）。

源项目的实际习惯：
- 静止 level1，hover 抬一级（Card：1→2、2→3、3→4；filled button：0→1）。
- 玻璃表面的阴影写法固定为 `box-shadow: var(--md-sys-elevation-levelN), var(--md-glass-highlight);` —— 后者是 1px 内发白高光，让半透明面板"读作玻璃"。
- 顶栏不用阴影，用 `border-bottom: 1px solid var(--md-glass-border)`。
- NEVER 自造阴影值；NEVER 忘记玻璃高光（除非刻意，如顶栏）。

## 10. Motion

Token（tokens.css）：时长 `short1-4` = 100/200/300/400ms、`medium1-2` = 500/700ms、`long1` = 1000ms；缓动三兄弟：

| Token | 曲线 | 语义 |
|---|---|---|
| `easing-standard` | cubic-bezier(0.2, 0, 0, 1) | 常规状态变化（颜色、阴影） |
| `easing-emphasized-decelerate` | cubic-bezier(0.05, 0.7, 0.1, 1) | **进入/到达**（入场、抬升、滑块滑入） |
| `easing-emphasized-accelerate` | cubic-bezier(0.3, 0, 0.8, 0.15) | **离开/退出**（淡出、归零） |

JS 驱动动画用 `utils/motion.ts`：`easingEmphasizedDecelerate/Accelerate`（与上面曲线逐值一致的求值函数）、`tween(from, to, ms, easing, onUpdate, onDone)`（rAF、可取消）、`prefersReducedMotion()`。

**Reduced-motion 策略**：base.css 有全局折叠（所有动画/过渡压到 0.01ms）；组件级还要补各自分支（源项目每个有动画的 CSS 都有 `@media (prefers-reduced-motion: reduce)` 块）。JS 动画在调用 tween 前用 `prefersReducedMotion()` 守卫。**例外**：音频淡入淡出保留（防爆音，不是视觉动效）——这是源项目的明确定位。

---

## 11. Component Styling 体系

### 11.1 命名与结构

- 可复用组件类名一律 `m3-` 前缀：`m3-button`、`m3-card`、`m3-chip`、`m3-icon-button`、`m3-section`、`m3-slider`、`m3-stat`。BEM：`m3-button__label`、`m3-card--elev2`、`m3-button--filled`。
- 页面级/业务组件用普通前缀（源项目如 `.appbar`、`.contact__card`），但样式值仍全部来自 token。
- CSS 文件与组件同目录同名 colocated。

### 11.2 状态层（state layer）模式

按钮/图标按钮的 hover/press 不改背景色，而是叠加 `::after { background: currentColor }`：
```css
.m3-icon-button::after { content: ''; position: absolute; inset: 0;
  background: currentColor; opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard); }
.m3-icon-button:hover::after, .m3-icon-button:focus-visible::after { opacity: 0.08; }
.m3-icon-button:active::after { opacity: 0.12; }
```
M3 规范值：hover/focus 8%、active 12%。文字用 `z-index: 1` 或结构保持在覆盖层之上（`__label` 元素）。

### 11.3 组件目录速览

Button（filled/tonal/text，href 时渲染 `<a>` 且外链自动 `target=_blank` + ↗ 指示）、Card（玻璃 + elev1-3 + hover 抬升和微放大）、Chip（assist chip，mono 字体，前导图标直接放 children 里）、IconButton（40px，`icon` + `label` 必填）、Icon（24 viewBox 内联 SVG，描边 1.75px，品牌与统计/强调图标填充）、Section（eyebrow/title/subtitle + 滚动显现，观察者见 hooks/useScrollReveal）、Slider（进度渐变 `--range-progress`、thumb hover×1.2 active×1.4、wheelStep）、Stat（mono tabular-nums，可选前导填充图标）。DOM/Props 细节与每个组件的使用示例 → `docs/components.md`。

**组件文案**：源项目所有用户可见文本走 i18n（react-i18next）。本包组件本身不含文案，但接入时 SHOULD 保持"组件不硬编码文案"的纪律。

---

## 12. Glassmorphism 实现原理

### 12.1 Token（tokens.css）

```css
--md-glass-blur: 20px;          /* backdrop blur 半径 */
--md-glass-saturate: 150%;      /* 让玻璃下的颜色更鲜艳 */
--md-glass-opacity-light: 0.6;  /* surface 混入比例（主题感知） */
--md-glass-opacity-dark: 0.6;
--md-glass-opacity: var(--md-glass-opacity-light);  /* dark 下切换 */
--md-glass-border: color-mix(in srgb, var(--md-sys-color-outline-variant) 32%, transparent);
--md-glass-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.1);  /* 顶部1px高光 */
```

### 12.2 标准配方（canonical recipe）

源项目所有玻璃面板共用这四行（按需换 surface 角色）：

```css
.glass-surface {
  /* 1. 半透明的 M3 surface 角色（不是 rgba 字面量！主题感知 + 随种子色再生效） */
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-surface-container-low) calc(var(--md-glass-opacity) * 100%),
    transparent
  );
  /* 2. 磨砂：blur + saturate。两行 MUST 成对，缺 -webkit- 前缀 Safari 失效 */
  -webkit-backdrop-filter: blur(var(--md-glass-blur)) saturate(var(--md-glass-saturate));
  backdrop-filter: blur(var(--md-glass-blur)) saturate(var(--md-glass-saturate));
  /* 3. 极淡描边勾出玻璃轮廓 */
  border: 1px solid var(--md-glass-border);
  /* 4. 圆角与阴影按组件选择（阴影记得加高光） */
  border-radius: var(--md-sys-shape-corner-large);
  box-shadow: var(--md-sys-elevation-level1), var(--md-glass-highlight);
}
```

关键理解：
- **opacity 通过 `color-mix` 打在 surface token 上**，而不是给整个元素设 `opacity`（那会连文字一起变透明）。
- **玻璃的可见性来自背后有东西**。`site-background.css` 的 `.site-bg`（fixed、blur(10px)、scale(1.05) 的全屏图 + 68%/60% 主题色蒙层）就是提供"可被模糊的颜色"的那一层；没有它玻璃只是半透明灰。
- 顶栏变体：把 surface 角色换成 `surface-container`（稍深，滚动内容从其下穿过时更稳）。
- **源项目已把最常用的卡片配方收敛为 `utilities.css` 的 `.glass-card`**（surface-container-low 玻璃底 + 玻璃描边 + corner-large；不含阴影/内边距——那些按组件自选）。源项目内多个卡片共用底色配方时 SHOULD 用它而不是复制粘贴四行。

### 12.3 源项目玻璃使用清单（保真记录）

| 表面 | 选择器（源项目） | surface 角色 | 圆角 | 阴影 |
|---|---|---|---|---|
| 顶栏 | `.appbar` | surface-container | — | 无（border-bottom 玻璃描边） |
| 侧栏大面板 | `.layout__hero` / `.layout__widgets` | surface-container-low | extra-large | elev1 + highlight |
| 通用卡片 | `.m3-card` | surface-container-low | large | elevN + highlight，hover +1 |
| 播放器 | `.mini-player` | surface-container-low | large | elev1 + highlight |
| 联系卡片 | `.contact__card` | surface-container-low | large | hover 时 elev2 + highlight 且底色换不透明 surface-container-high |
| 列表行 | `.projects__row` | surface-container-low | medium | 无；hover 角色升到 surface-container |

---

## 13. 玻璃的适用与禁用场景

### SHOULD 使用玻璃

1. **固定/粘性 chrome**：顶栏、sticky 侧栏——内容从其下方滚过时玻璃价值最大。
2. **悬浮于丰富背景之上的内容卡片**：卡片、播放器、联系卡——背后是彩色照片，模糊后成为主题化的氛围。
3. **小面积列表行**：轻量描边 + 低模糊成本。
4. 满足前提：**玻璃后面确实有内容/图像**；文本量中等且用 on-surface 系颜色。

### NEVER / SHOULD NOT 使用玻璃

1. **玻璃嵌套玻璃**（glass-on-glass）。backdrop-filter 叠加会重复模糊、成本翻倍、视觉浑浊。源项目有现成处理：侧栏内的播放器被显式拍平（layout-split.css 中 `.layout__widgets .mini-player` 置 `background: none; backdrop-filter: none;`）——嵌套时 ALWAYS 拍平内层。
2. **大面积长文阅读容器**：可读性与滚动性能都会受损；正文区用透明或纯 surface。
3. **背后是纯色/空无一物时**：玻璃不可见，白白消耗合成层。
4. **打印样式**：backdrop-filter 不参与打印。
5. **低性能预算的页面**（大量同屏玻璃、低端移动设备）：每个玻璃表面都是常驻 GPU 合成开销；限制同屏玻璃元素数量。
6. **对比度关键的小字**：玻璃底天然降对比，小正文确保用 on-surface 而非更弱的变体。

### MD3 与 Glass 的组合公式

玻璃不是 MD3 之外的特效，而是 MD3 surface 体系的一种材质变体：

> **玻璃面板 = surface-container 系角色 × --md-glass-opacity（材质） + M3 shape token（形状） + M3 elevation + glass-highlight（浮起感） + on-surface 系角色（内容）**

因此换种子色、切 light/dark 时玻璃自动跟随；hover 升级也沿着 MD3 阶梯（surface-container-low → surface-container / high，或 elev1 → elev2）。SHOULD 保持这种"材质变体"的组合方式，NEVER 给玻璃发明独立色板。

---

## 14. 在新页面 / 新组件中复用（标准流程）

### 14.1 新建一个玻璃卡片组件（React 示例）

```tsx
// PhotoCard.tsx — 与组件同目录的 colocated CSS
import type { ReactNode } from 'react'
import './PhotoCard.css'

export function PhotoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="photo-card">
      <h3 className="photo-card__title">{title}</h3>
      {children}
    </div>
  )
}
```

```css
/* PhotoCard.css — 每个值都来自 token；玻璃用标准配方 */
.photo-card {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-md);
  padding: var(--md-sys-spacing-xl);
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-surface-container-low) calc(var(--md-glass-opacity) * 100%),
    transparent
  );
  -webkit-backdrop-filter: blur(var(--md-glass-blur)) saturate(var(--md-glass-saturate));
  backdrop-filter: blur(var(--md-glass-blur)) saturate(var(--md-glass-saturate));
  border: 1px solid var(--md-glass-border);
  border-radius: var(--md-sys-shape-corner-large);
  box-shadow: var(--md-sys-elevation-level1), var(--md-glass-highlight);
  transition:
    box-shadow var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard),
    transform var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-decelerate);
}

.photo-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--md-sys-elevation-level2), var(--md-glass-highlight);
}

.photo-card__title {
  font-family: var(--md-ref-typeface-display);
  font-size: var(--md-sys-typescale-title-large-size);
  line-height: var(--md-sys-typescale-title-large-line-height);
  color: var(--md-sys-color-on-surface);
}
```

（或直接 `import 'design-system/theme/glass.css'` 后用 `<div className="m3-glass">` + 自定圆角/阴影——简单场景足够。）

### 14.2 checklist（写任何新样式前过一遍）

1. 颜色/字号/圆角/间距/阴影/时长是否全部 `var(--md-*)`？
2. 主题感知的 token 是否 light/dark 双通道？
3. 有 hover/active？状态层模式（§11.2）或 MD3 阶梯升级，而不是自造色。
4. 有动画？`prefers-reduced-motion` 分支写了吗？
5. 玻璃？标准配方四行齐全（含 `-webkit-`）？没有嵌套在另一个玻璃里？
6. 可聚焦？全局 `:focus-visible` 已覆盖，自定义控件补焦点样式（参照 Slider）。
7. 图标按钮带 `aria-label` 了吗？纯图标 MUST 有。
8. 文字没有硬编码进可复用组件吧？
9. 响应式在布局列内？用 `@container` 而不是 `@media`（列宽 ≠ 视口宽）。
10. 想加新颜色？→ 改种子色重新生成，而不是手调 hex。

---

## 15. 常见错误与禁止事项（NEVER 清单）

1. NEVER 在组件 CSS 硬编码颜色、字号、圆角、间距、阴影、时长字面值。
2. NEVER 手改 `theme/colors.css`（生成物）；改色 = `SEED_COLOR` + gen-theme.mjs。
3. NEVER 引入 Google Fonts 或本地打包 CJK 字体；用文档中的 jsDelivr / ZeoSeven CDN 链接。
4. NEVER 嵌套玻璃（见 §13）；侧栏内卡片拍平内层玻璃。
5. NEVER 只写 `backdrop-filter` 不写 `-webkit-backdrop-filter`。
6. NEVER 用 `opacity:` 或 rgba 字面量做玻璃底色；用 color-mix + surface 角色 + `--md-glass-opacity`。
7. NEVER 让 `data-theme` 在首帧之后才生效（闪白）；MUST 用 index.html 内联 pre-paint 脚本。
8. NEVER 写 `data-theme="system"`；system = 移除属性。
9. NEVER 在 `position: sticky/fixed` 元素上做 transform 动画（Chromium 会破坏 sticky）。动画放在子元素上（源项目 hero 入场即如此）。
10. NEVER 同时全局设置 `scrollbar-color` 和 `::-webkit-scrollbar` 样式（前者会整体覆盖后者，宽度/圆角丢失）。base.css 的两个 `@supports` 分治方案 MUST 原样保留。
11. NEVER 给 `.spotlight` 加在 sticky 元素上（`.spotlight` 自带 `position: relative` 会顶掉 sticky）；sticky 元素复制其 `::before` 做法（layout-split.css 有现成示例）。
12. NEVER 新增只有单主题值的 token。
13. NEVER 忘记动画的 reduced-motion 分支（音频淡入淡出除外）。
14. NEVER 绕过 token 体系直接引用另一个组件的类做样式基础（用组合，如 ProjectCard 组合 Card + spotlight）。
15. NEVER 在滚动容器列内用 viewport 媒体查询做栅格断点；用容器查询。

---

## 16. 修改与扩展原则

- **Token 优先**：新需求先在 `docs/tokens-reference.md` 找现成 token；确需新增 → 加到 tokens.css 合适分组（带注释说明语义），主题感知的加双通道，并在 tokens-reference.md 登记。
- **新组件**：`m3-` 前缀 + BEM + colocated CSS + 只消费 token + 状态层模式 + reduced-motion；props 设计参照现有组件（`className` 透传、`import type`、无业务 import）。
- **改种子色**：跑脚本 → 提交再生成的 colors.css → 手动核对玻璃/滚动条派生 token 无需改（它们派生自角色，自动跟随）。
- **改玻璃质感**：只动 `--md-glass-*` 四个值（blur/saturate/opacity-light/dark），全站玻璃同步变化；NEVER 逐组件调。
- **升级 MD3 角色**：如果未来 MaterialDynamicColors 增加角色，在 gen-theme.mjs 的 `ROLES` 数组显式登记（保持"缺角色就报错"的设计）。
- **删除/废弃 token**：先全仓 grep 确认无消费再删。
- **行为一致性优先**：对"源项目怎么做"有疑问时，以本包文件与源项目现状为准，不以 MD3 官方文档的未落地描述为准。

## 17. 已知耦合点与提取改动记录（保真声明）

本包对源项目做了 **3 处** 解耦性改动，其余文件逐字一致：

1. `theme/global.css` 拆为 `base.css` / `site-background.css` / `utilities.css` / `layout-split.css` 四个文件（纯拆分，规则与值未动）。
2. `.site-bg::before` 的背景图从硬编码个人照片路径改为 `var(--site-bg-image)`（默认 `none`；源项目值为 `url('../assets/JSA-279k.png')`）。
3. `scripts/gen-theme.mjs` 输出路径改为本包的 `../theme/colors.css`。

未提取（源项目业务耦合，按需参照源仓库）：AppBar.tsx（导航+i18n+profile）、ThemeToggle.tsx（组合示例见 docs/components.md）、LanguageToggle、Footer、MiniPlayer、ProjectCard、各 section 组件、i18n 体系。

源项目已知的历史耦合（记录，未修复，不建议复制）：layout-split.css 中 `.layout__hero .hero*` 规则依赖 Hero section 的类名；layout 的 widgets 压缩规则提到 `.mini-player`；`.m3-button__icon` 选择器在源文件中重复声明两次（无害）。

**同步记录**：

- 2026-08-17 — 源项目重构后同步：Chip 移除 `withCode` prop 与 `.m3-chip__code`（前导图标改为 children 里直接放 `<Icon>`）；Icon 新增 `folder` / `people` / `commit` 填充图标、`star` 从描边改填充、`code` 移除；Stat 新增可选 `icon` prop（primary 色前导填充图标）；utilities.css 新增 `.glass-card`（源项目把 global.css 拆为 base/layout/utilities 三层后的产物）；hooks 新增 `useScrollReveal.ts`（源项目从 App.tsx 提取的同名 hook）。组件文件与源项目逐字一致。
- 2026-08-16 — 初次提取（见 §18）。

---

## 18. 版本与来源

- 提取自：Tuning-Luna.github.io `main`，2026-08-16（提取起点 commit 1115404；提取期间源仓库前进至 73b92a2，包内文件已逐一与最终状态比对同步——期间 MiniPlayer/ProjectCard 被源项目移入 `sections/`，与"业务组件不提取"的判断一致）。最近一次同步：2026-08-17（对应源项目 commit 5e5323c，见 §17 同步记录）。
- 种子色 `#18F741`，Variant: TONAL_SPOT，contrast level 0。
- 依赖：运行时零依赖（纯 CSS + 可选 React 19 组件）；生成脚本需要 devDependency `@material/material-color-utilities` + `tsx`（该包 0.4.0 的内部 ESM 导入无扩展名，纯 `node` 无法加载，必须 tsx 执行）、Node ≥ 18。
- 浏览器目标：现代 evergreen（用到 `color-mix`、`@container`、`:not([attr])`、`color-scheme`）。
