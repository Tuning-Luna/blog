---
title: Glassmorphism 的实现原理与正确用法
date: 2026-04-02
description: 毛玻璃效果的核心不是 backdrop-filter 本身，而是背后「有东西可模糊」。附一份可复用配方。
tags:
  - CSS
  - 设计
categories:
  - 前端
---

毛玻璃（Glassmorphism）这几年很流行，但大量实现犯了同一个错误：把 `backdrop-filter` 加在一个纯色背景上——结果玻璃什么都模糊不到，只是个半透明灰块。

<!-- more -->

## 玻璃成立的前提

`backdrop-filter` 模糊的是元素**背后**的内容。要让玻璃「看得见」，背后必须有丰富的色彩或图像。这也是为什么玻璃效果几乎总是搭配一张固定的全屏背景图。

```css
.site-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  /* 一张暗色、有纹理的图，放大一点避免边缘露白 */
  background-image: var(--site-bg-image);
  background-size: cover;
  filter: blur(10px);
  transform: scale(1.05);
}
```

内容层浮在它上面，玻璃面板才有东西可模糊。

## 一份可复用的玻璃配方

玻璃面板的四件套：

```css
.glass-surface {
  /* 1. 半透明的表面色（不是 rgba 字面量！用 color-mix + 主题 token） */
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-surface-container-low) calc(var(--md-glass-opacity) * 100%),
    transparent
  );
  /* 2. 磨砂：blur + saturate。两个前缀都要，否则 Safari 失效 */
  -webkit-backdrop-filter: blur(var(--md-glass-blur)) saturate(var(--md-glass-saturate));
  backdrop-filter: blur(var(--md-glass-blur)) saturate(var(--md-glass-saturate));
  /* 3. 极淡描边勾出轮廓 */
  border: 1px solid var(--md-glass-border);
  /* 4. 顶部 1px 高光，让半透明面板「读作玻璃」 */
  box-shadow: var(--md-sys-elevation-level1), var(--md-glass-highlight);
}
```

## 禁用场景

- **长文阅读容器**：模糊会损害可读性和滚动性能
- **玻璃嵌套玻璃**：`backdrop-filter` 叠加会重复模糊、视觉浑浊
- **背后是纯色**：玻璃不可见，白白消耗 GPU 合成层

## 小结

玻璃不是特效，而是「MD3 surface 的一种材质变体」：半透明表面 + 磨砂 + 描边 + 高光。先有值得模糊的背景，再谈玻璃。
