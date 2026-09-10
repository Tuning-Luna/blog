---
title: Vue 3 Composition API 的取舍：何时用、何时别用
date: 2026-05-20
description: Composition API 不是银弹。本文梳理它解决什么问题，以及在什么场景下 Option API 仍然更合适。
tags:
  - Vue
  - 前端
---

Composition API 出来快五年了，社区对它已经从「新特性」变成「默认选项」。但「默认」不等于「总是更好」。这篇文章聊聊真正的取舍。

<!-- more -->

## 它解决的核心问题

Option API 把同一份逻辑拆散在 `data`、`computed`、`methods`、`watch` 四个选项里。组件一旦复杂，同一个功能的代码就被拆得七零八落。

Composition API 让代码按**功能**组织，而不是按**选项类型**组织：

```ts
// 一个功能：用户名加载 + 校验
const username = ref('')
const { data, error, loading } = useLoadUsername(username)
const isValid = computed(() => /^[a-z0-9_]{3,20}$/.test(username.value))
```

## 真正的杀手锏：组合函数

逻辑跨组件复用，是 Composition API 相比 mixin 的飞跃：

```ts
// useTheme.ts
export function useTheme() {
  const mode = ref<ThemeMode>('dark')
  const cycle = () => {
    mode.value = mode.value === 'system' ? 'light' : mode.value === 'light' ? 'dark' : 'system'
  }
  return { mode, cycle }
}
```

mixin 的命名冲突、隐式依赖、来源不明的问题，在组合函数里都不存在了。

## 什么时候继续用 Option API

- **小型、一次性组件**：一个 `data` + 几个 `methods` 就能讲清楚，没必要 `setup`
- **需要响应式解构的兼容旧习惯**：少数开发者对 `ref` 的 `.value` 反感
- **模板很重的展示组件**：逻辑就是「根据 props 算几个字段」

判断标准很简单：**这段逻辑会不会被复用？会不会随需求增长？** 两个都否，Option API 更短。

## 小结

Composition API 的收益在大组件和跨组件逻辑复用上。小组件里硬套 `setup` 反而增加噪音。原则是：工具服务于结构，而不是反过来。
