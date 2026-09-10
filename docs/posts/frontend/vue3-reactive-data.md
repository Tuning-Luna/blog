---
title: Vue 3 响应式数据：ref 与 reactive 怎么选
date: 2025-02-10
description: ref/reactive 的机制差异，以及写组件时的选型建议。
tags:
  - Vue
  - 前端
---

`ref` 和 `reactive` 是 Vue 3 里两个最基础的响应式 API。用错的话会在解构、替换、嵌套时踩坑。

<!-- more -->

## 机制差异

- `reactive` 基于 `Proxy`，只能代理对象，深层响应式。
- `ref` 用一个 `{ value }` 包装，可以包任意值（包括原始类型），模板里自动解包。

```ts
const obj = reactive({ count: 0 })
const num = ref(0)

obj.count++   // 直接访问属性
num.value++   // script 里要 .value，模板里自动解包
```

## 解构陷阱

`reactive` 对象的属性解构后会**失去响应性**：

```ts
const { count } = obj  // 解构后 count 是普通值
```

需要保持响应性时用 `toRefs(obj)`。

## 选型建议

- **简单场景**：一律 `ref`，心智负担最小，`toRefs`/解构都安全。
- **对象/集合数据**：`reactive` 更直观，适合状态集中在一个对象的场景。
- **团队约定**：选定一种为主，混合使用容易乱。

## 小结

`ref` 更通用、更安全；`reactive` 在「操作一个对象」时更自然。日常开发默认 `ref`，需要对象操作时用 `reactive` 并注意不要直接解构。
