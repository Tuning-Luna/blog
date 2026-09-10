---
title: CSS color-mix：让主题色自动派生的现代方法
date: 2026-06-15
description: color-mix() 可以基于一个品牌色自动生成全套表面色，告别手写 rgba 半透明色板。
tags:
  - CSS
  - 前端
  - 设计系统
---

设计系统里最常见的需求是「某种颜色的半透明版」。过去我们写 `rgba(61, 104, 56, 0.6)`，但一旦换主题色就要重算一遍。`color-mix()` 把这个过程变成了声明式的。

<!-- more -->

## 基本语法

```css
.button {
  background-color: color-mix(
    in srgb,
    var(--brand) 60%,
    transparent
  );
}
```

意思是「品牌色取 60%，透明取 40%，在 srgb 色彩空间混合」。结果永远跟随 `--brand`，换品牌色后全站自动更新。

## 搭配设计 token

更好的做法是把「主题感知」写进 token 层：

```css
:root {
  --md-glass-opacity-light: 0.6;
  --md-glass-opacity-dark: 0.65;
  --md-glass-opacity: var(--md-glass-opacity-light);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --md-glass-opacity: var(--md-glass-opacity-dark);
  }
}
```

组件里只消费最终值，不关心明暗：

```css
.glass-surface {
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-surface-container-low) calc(var(--md-glass-opacity) * 100%),
    transparent
  );
}
```

## 为什么比 rgba 好

- **可读**：`color-mix` 表达的是「颜色的关系」，不是一串数字
- **可换肤**：换种子色重新生成，半透明派生色自动跟随
- **主题感知**：同一份 CSS 在明暗主题下得到不同的混合结果

## 注意事项

- 需要现代浏览器（近三年版本都支持）
- 性能开销可忽略，可以放心用在 hover 态
- 老项目兼容性要求高时再考虑编译期方案

## 小结

`color-mix()` 把「从基础色派生变化色」这件设计系统里的高频操作，从手写变成了声明。它和 CSS 自定义属性配合，是构建可维护主题体系的基础设施。
