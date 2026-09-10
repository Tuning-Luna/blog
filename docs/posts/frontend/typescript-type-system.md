---
title: TypeScript 类型体操之外的实用类型技巧
date: 2026-03-11
description: 不写花哨的类型体操，也能靠几个实用技巧把代码的类型安全提升一个档次。
tags:
  - TypeScript
  - 编程
---

类型系统最值钱的能力不是写出复杂的泛型，而是**把错误挡在编译期**。这里有几个日常项目里就能用的技巧。

<!-- more -->

## 用 discriminated union 取代 flag

与其用一个布尔标志加一堆 if 判断，不如用「可辨识联合」让每种状态的结构自洽：

```ts
type Result<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }

function render(r: Result<Post>) {
  if (r.status === 'loading') return '...'
  if (r.status === 'error') return r.message
  return r.data.title // 这里 TS 知道 data 一定存在
}
```

穷尽检查（`never`）还能保证将来加状态时编译器提醒你补分支：

```ts
function assertNever(x: never): never {
  throw new Error('unexpected: ' + x)
}
```

## 用 satisfies 保留字面量类型

`satisfies` 既检查类型，又不丢失窄化信息：

```ts
const colors = {
  primary: '#3d6838',
  accent: '#38656a',
} satisfies Record<string, `#${string}`>

// colors.primary 仍是 '#3d6838'（字面量），而不是 string
```

## 显式标注 throw / 错误类型

把错误当作值处理，而不是只靠 try/catch：

```ts
type Safe<T> = { ok: true; value: T } | { ok: false; error: Error }

async function safe<T>(fn: () => Promise<T>): Promise<Safe<T>> {
  try {
    return { ok: true, value: await fn() }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error(String(error)) }
  }
}
```

调用方必须处理两种结果，漏掉 `error` 分支会编译报错。

## 小结

类型系统的收益来自约束，不来自复杂度。discriminated union、`satisfies`、`safe` 包装——三个小技巧，都是让编译器替你把关，而不是把类型写给你自己看。
