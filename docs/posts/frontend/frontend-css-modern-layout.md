---
title: 现代 CSS 布局：Flexbox 与 Grid 的配合
date: 2026-04-25
description: 什么时候用 Flexbox、什么时候用 Grid，以及容器查询的引入。
tags:
  - CSS
  - 前端
---

Flexbox 和 Grid 不是「二选一」，而是各有主场的两种布局工具。搞清分工，能少写很多 hack。

<!-- more -->

## 选型：一维用 Flex，二维用 Grid

- **Flexbox**：一维布局——一行或一列内对齐、均分、伸缩。适合导航、按钮组、卡片内部。
- **Grid**：二维布局——同时控制行和列。适合整个页面骨架、卡片网格、栅格系统。

```css
/* 一行内两端对齐 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 二维卡片网格 */
.posts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}
```

## 内容溢出与伸缩

Flex 容器里防止子项把容器撑破，使用最小宽度约束：

```css
.flex-child {
  flex: 1;
  min-width: 0;  /* 允许收缩，防止内容溢出 */
}
```

## 容器查询：让组件感知自身宽度

`@container` 让组件根据**父容器宽度**（而不是视口）自适应，适合可复用组件：

```css
.card {
  container-type: inline-size;
}
@container (min-width: 400px) {
  .card__media { float: right; }
}
```

## 小结

规则很简单：**一行 → Flex；行和列 → Grid；组件内部自适应 → 容器查询**。先想清楚维度，再选工具，布局代码会干净很多。
