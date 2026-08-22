# Token Reference — 全量设计 token 参考

> 来源：`theme/tokens.css`（静态规格）与 `theme/colors.css`（生成色板，种子 `#18F741` · Variant TONAL_SPOT · contrast 0）。本文档只是查询副本；**真值永远是那两个 CSS 文件**。消费方式一律 `var(--md-…)`。

---

## 1. Color System（`--md-sys-color-*`，39 角色 × 2 scheme）

暗色应用条件（双通道，缺一不可）：
```css
@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) { … } }
:root[data-theme='dark'] { … }
```

### 基础色

| 角色 | Light | Dark | 源项目用途 |
|---|---|---|---|
| `primary` | `#3d6838` | `#a2d398` | 主按钮、链接、焦点环、eyebrow |
| `on-primary` | `#ffffff` | `#0d380e` | 主按钮文字 |
| `primary-container` | `#bdf0b3` | `#255023` | 头像光环、选区背景 |
| `on-primary-container` | `#255023` | `#bdf0b3` | 选区文字、hero 渐变 |
| `secondary` | `#53634e` | `#baccb3` | （保留） |
| `on-secondary` | `#ffffff` | `#263423` | （保留） |
| `secondary-container` | `#d6e8ce` | `#3c4b38` | tonal 按钮、封面占位 |
| `on-secondary-container` | `#3c4b38` | `#d6e8ce` | tonal 按钮文字 |
| `tertiary` | `#38656a` | `#a0cfd3` | 生成齐全，页面未直接使用 |
| `on-tertiary` | `#ffffff` | `#00363b` | — |
| `tertiary-container` | `#bcebf0` | `#1e4d52` | — |
| `on-tertiary-container` | `#1e4d52` | `#bcebf0` | — |
| `error` | `#ba1a1a` | `#ffb4ab` | 播放器错误按钮 |
| `on-error` | `#ffffff` | `#690005` | 错误按钮文字 |
| `error-container` | `#ffdad6` | `#93000a` | — |
| `on-error-container` | `#93000a` | `#ffdad6` | — |

### Surface 体系

| 角色 | Light | Dark | 源项目用途 |
|---|---|---|---|
| `background` | `#f7fbf1` | `#10140f` | body 底色、`.site-bg` 蒙层基色、theme-color meta |
| `on-background` | `#191d17` | `#e0e4da` | body 正文 |
| `surface` | `#f7fbf1` | `#10140f` | — |
| `on-surface` | `#191d17` | `#e0e4da` | 主文字 |
| `surface-variant` | `#dee4d8` | `#42493f` | — |
| `on-surface-variant` | `#42493f` | `#c2c8bc` | 次要文字（描述、标签、icon 默认色） |
| `surface-container-lowest` | `#ffffff` | `#0b0f0a` | — |
| `surface-container-low` | `#f2f5eb` | `#191d17` | **玻璃面板默认底色** |
| `surface-container` | `#ecefe6` | `#1d211b` | 顶栏玻璃底色、行 hover |
| `surface-container-high` | `#e6e9e0` | `#272b25` | 顶栏链接 hover、卡片 hover |
| `surface-container-highest` | `#e0e4da` | `#323630` | 滑块未填充轨道 |
| `surface-dim` | `#d8dbd2` | `#10140f` | — |
| `surface-bright` | `#f7fbf1` | `#363a34` | — |
| `surface-tint` | `#3d6838` | `#a2d398` | — |

### Outline 与 Inverse

| 角色 | Light | Dark | 源项目用途 |
|---|---|---|---|
| `outline` | `#73796f` | `#8c9388` | 弱元信息（归档标记） |
| `outline-variant` | `#c2c8bc` | `#42493f` | chip 描边；玻璃边框的基色 |
| `inverse-surface` | `#2d322b` | `#e0e4da` | — |
| `inverse-on-surface` | `#eff2e8` | `#2d322b` | — |
| `inverse-primary` | `#a2d398` | `#3d6838` | — |
| `shadow` / `scrim` | `#000000` | `#000000` | — |

---

## 2. Typography

### 字体族（`--md-ref-typeface*`）

| Token | 栈 | 用途 |
|---|---|---|
| `--md-ref-typeface` | `'Inter', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', system-ui, -apple-system, 'Segoe UI', sans-serif` | 正文 / UI |
| `--md-ref-typeface-display` | `'Manrope', 'Inter', …（同上回退）` | 大标题 |
| `--md-ref-typeface-mono` | `'Maple Mono NF CN', ui-monospace, 'Cascadia Code', 'SFMono-Regular', 'Consolas', 'Liberation Mono', monospace` | eyebrow / chip / 统计数字 |

字体文件经 CDN 加载（禁 Google Fonts）：jsDelivr `@fontsource/manrope@5.3.0/latin.css`、`@fontsource/inter@5.3.0/latin.css`，ZeoSeven `fontsapi.zeoseven.com/442/main/result.css`（Maple Mono NF CN）。CJK 走系统回退，不下字体包。

### Type scale（`--md-sys-typescale-<level>-<property>`，property ∈ size / weight / line-height / tracking）

| 级别 | size | weight | line-height | tracking |
|---|---|---|---|---|
| display-small | 36px | 400 | 44px | 0 |
| headline-large | 32px | 400 | 40px | 0 |
| headline-medium | 28px | 400 | 36px | 0 |
| headline-small | 24px | 400 | 32px | 0 |
| title-large | 22px | 400 | 28px | 0 |
| title-medium | 16px | 500 | 24px | 0.15px |
| title-small | 14px | 500 | 20px | 0.1px |
| body-large | 16px | 400 | 24px | 0.5px |
| body-medium | 14px | 400 | 20px | 0.25px |
| body-small | 12px | 400 | 16px | 0.4px |
| label-large | 14px | 500 | 20px | 0.1px |
| label-medium | 12px | 500 | 16px | 0.5px |
| label-small | 11px | 500 | 16px | 0.5px |

---

## 3. Spacing（`--md-sys-spacing-*`，4dp 网格）

| Token | 值 | 典型用途 |
|---|---|---|
| `xs` | 4px | 最小间隙、滚动条宽 |
| `sm` | 8px | 组件内行间 |
| `md` | 12px | 按钮内边距（text 变体）、行内边距 |
| `lg` | 16px | 卡片内边距、chip 内边距、玻璃面板 padding |
| `xl` | 24px | 按钮 padding-inline、布局 gap、container padding |
| `2xl` | 32px | 区块 padding-block（<720px）、卡片网格 gap |
| `3xl` | 48px | 区块 padding-block（≥720px） |
| `4xl` | 64px | 页脚上边距、sticky top 基数 |
| `5xl` | 96px | hero 顶部留白 |

## 4. Shape（`--md-sys-shape-corner-*`）

| Token | 值 | 典型用途 |
|---|---|---|
| `none` | 0px | — |
| `extra-small` | 4px | 焦点环圆角 |
| `small` | 8px | 播放器封面、滚动条 thumb |
| `medium` | 12px | 列表行 |
| `large` | 16px | 卡片、播放器、联系卡 |
| `extra-large` | 28px | 侧栏大面板 |
| `full` | 9999px | 按钮、chip、图标按钮、滑块、头像 |

## 5. Elevation（`--md-sys-elevation-level*`，M3 双层阴影）

| Token | 值 |
|---|---|
| `level0` | `0 0 0 0 transparent` |
| `level1` | `0 1px 2px rgb(0 0 0 / 30%), 0 1px 3px 1px rgb(0 0 0 / 15%)` |
| `level2` | `0 1px 2px rgb(0 0 0 / 30%), 0 2px 6px 2px rgb(0 0 0 / 15%)` |
| `level3` | `0 1px 3px rgb(0 0 0 / 30%), 0 4px 8px 3px rgb(0 0 0 / 15%)` |
| `level4` | `0 2px 3px rgb(0 0 0 / 30%), 0 6px 10px 4px rgb(0 0 0 / 15%)` |
| `level5` | `0 4px 4px rgb(0 0 0 / 30%), 0 8px 12px 6px rgb(0 0 0 / 15%)` |

约定：卡片静止 N、hover N+1；filled 按钮静止 0、hover 1；玻璃阴影固定追加 `var(--md-glass-highlight)`。

## 6. Motion（`--md-sys-motion-*`）

### 时长

| Token | 值 |
|---|---|
| duration-short1 / 2 / 3 / 4 | 100 / 200 / 300 / 400 ms |
| duration-medium1 / 2 | 500 / 700 ms |
| duration-long1 | 1000 ms |

### 缓动

| Token | 值 | 语义 |
|---|---|---|
| `easing-standard` | `cubic-bezier(0.2, 0, 0, 1)` | 状态变化 |
| `easing-emphasized-decelerate` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | 进入 |
| `easing-emphasized-accelerate` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | 离开 |

JS 侧等价物：`utils/motion.ts` 的 `easingEmphasizedDecelerate` / `easingEmphasizedAccelerate`（数值一致，可直接在 rAF 中求值）。

## 7. Glassmorphism（`--md-glass-*`）

| Token | 值 | 说明 |
|---|---|---|
| `--md-glass-blur` | `20px` | backdrop blur 半径 |
| `--md-glass-saturate` | `150%` | backdrop 提饱和 |
| `--md-glass-opacity-light` | `0.6` | light 下 surface 混入比 |
| `--md-glass-opacity-dark` | `0.6` | dark 下 surface 混入比 |
| `--md-glass-opacity` | 上两者的主题切换值 | 配方中唯一该引用的 opacity |
| `--md-glass-border` | `color-mix(in srgb, var(--md-sys-color-outline-variant) 32%, transparent)` | 玻璃描边 |
| `--md-glass-highlight` | `inset 0 1px 0 rgba(255, 255, 255, 0.1)` | 顶部 1px 高光 |

（`--md-glass-opacity` 的 dark 切换也在 tokens.css 的双通道块里完成。）

## 8. Scrollbar（`--md-scrollbar-*`，派生自 `on-surface`）

| Token | Light | Dark | 对应 Flutter 状态 |
|---|---|---|---|
| `--md-scrollbar-thumb` | on-surface 10% | on-surface 30% | idle |
| `--md-scrollbar-thumb-hover` | 50% | 65% | hover |
| `--md-scrollbar-thumb-active` | 60% | 75% | dragged（CSS :active） |

几何：4px 宽 thumb，`corner-small` 圆角，透明轨道。Firefox 走 `scrollbar-width: thin` + `scrollbar-color`（`@supports` 分治，见 base.css）。

## 9. 站点背景（本包参数化新增）

| Token | 默认 | 说明 |
|---|---|---|
| `--site-bg-image` | `none` | `.site-bg::before` 的背景图。源项目：`url('../assets/JSA-279k.png')`。选暗色、有纹理的图 |

蒙层（`.site-bg::after`）：`color-mix(in srgb, var(--md-sys-color-background) 68%, transparent)`（light）/ 60%（dark），随主题自动切换。
