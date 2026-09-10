---
title: Java 线程池：ThreadPoolExecutor 参数详解
date: 2024-10-21
description: 七个核心参数、拒绝策略，以及为什么不要用 Executors 的快捷方法。
tags:
  - Java
  - 并发
---

线程池是 Java 并发编程里最容易用错也最影响性能的组件。搞懂 `ThreadPoolExecutor` 的七个参数，才能写出可控的并发代码。

<!-- more -->

## 七个核心参数

```java
new ThreadPoolExecutor(
  corePoolSize,      // 核心线程数（即使空闲也保留）
  maximumPoolSize,   // 最大线程数
  keepAliveTime,     // 非核心线程空闲存活时间
  unit,              // 时间单位
  workQueue,         // 任务队列
  threadFactory,     // 线程工厂（命名、daemon 等）
  handler            // 拒绝策略
)
```

## 任务的流转过程

1. 线程数 < corePoolSize → 直接新建线程执行
2. 线程数 ≥ corePoolSize → 任务进队列
3. 队列满 → 新建线程直到 maximumPoolSize
4. 线程数 = maximumPoolSize 且队列满 → 触发拒绝策略

## 拒绝策略

- `AbortPolicy`：抛异常（默认）
- `CallerRunsPolicy`：提交线程自己执行——最常用的兜底
- `DiscardPolicy` / `DiscardOldestPolicy`：静默丢弃

## 为什么别用 Executors.newFixedThreadPool()

`newFixedThreadPool` 的队列是 `LinkedBlockingQueue`，容量无限。任务堆积时线程数不会增长，可能导致内存被任务队列撑爆。生产环境推荐手动创建 `ThreadPoolExecutor`，明确队列上限。

## 小结

线程池调优的核心是**匹配任务特性与队列/线程配置**：IO 密集型线程数可偏多，CPU 密集型接近核数；队列要有界，拒绝策略要能兜底。
