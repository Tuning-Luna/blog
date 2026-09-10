---
title: VitePress 自定义主题接入现有设计系统
date: 2026-08-10
description: 如何在 VitePress 里做完全自定义主题，并复用一套已有的 Material Design 3 设计系统。
tags:
  - VitePress
  - Vue
  - 前端
categories:
  - 技术
---

VitePress 默认主题功能完整，但如果你需要的是「长得完全不一样」的站点，自定义主题反而更直接。本文记录把一套现成的 MD3 × Glassmorphism 设计系统接入 VitePress 的关键步骤。

<!-- more -->

## 自定义主题的最小结构

VitePress 的主题就是一个对象，只需一个 `Layout` 组件：

```ts
// docs/.vitepress/theme/index.ts
import type { Theme } from 'vitepress'
import Layout from './Layout.vue'

export default { Layout } satisfies Theme
```

`Layout.vue` 里用 `<Content />` 渲染 Markdown：

```vue
<template>
  <main>
    <Content />
  </main>
</template>
```

## 复用已有的 CSS token

如果有一套以 CSS 自定义属性（design token）写好的样式，直接按顺序 import 即可：

```css
@import '../../../design-system/theme/tokens.css';
@import '../../../design-system/theme/base.css';
```

关键点是导入顺序：token → reset → 布局 → 组件，层层覆盖。

## 主题切换的坑

VitePress 内置的外观切换用的是 `<html class="dark">`。如果现有设计系统用的是 `<html data-theme>`，二者会打架。解法是关掉内置外观：

```ts
export default defineConfig({
  appearance: false, // 由设计系统自己的 data-theme 机制接管
})
```

然后在 `head` 里放一段内联脚本，在首帧前应用已保存的主题，避免闪白：

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem('my-theme')
      if (t === 'light' || t === 'dark') {
        document.documentElement.setAttribute('data-theme', t)
      }
    } catch (e) {}
  })()
</script>
```

## 代码高亮的双主题

VitePress 用 Shiki 高亮代码，配置成双主题后，每个 token 会带上 `--shiki-light` 和 `--shiki-dark` 两个变量：

```ts
markdown: {
  theme: { light: 'github-light', dark: 'github-dark' },
}
```

自定义主题里需要自己写切换规则：

```css
:root[data-theme='dark'] .vp-code span {
  color: var(--shiki-dark, inherit);
}
:root[data-theme='light'] .vp-code span {
  color: var(--shiki-light, inherit);
}
```

## 小结

VitePress 的核心（Markdown 渲染、Shiki 高亮、数据加载）与主题是解耦的。只要不依赖默认主题的 CSS，就能完全自定义出一套符合自己设计系统的站点。
