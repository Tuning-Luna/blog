---
title: Git Rebase 原理
date: 2026-08-22
description: 深入理解 Git Rebase 的工作原理、适用场景与风险，以及和 Merge 的取舍。
tags:
  - Git
  - 编程
categories:
  - 技术
featured: true
---

`git rebase` 是 Git 里最容易被误解的命令之一。很多人只记住「不要对公共分支 rebase」，却说不清它到底做了什么。这篇文章从提交图的角度讲清楚 rebase 的本质。

<!-- more -->

## Rebase 在做什么

Merge 和 Rebase 的目标相同：把另一个分支的提交整合进当前分支。区别在于提交历史怎么组织。

Merge 会生成一个新的合并提交，保留两条分支的拓扑：

```text
      A---B---C  feature
     /         \
D---E---F---G---H  main
```

Rebase 则把当前分支的提交「摘下来，放到目标分支顶端」，重放一遍：

```text
D---E---F---------A'---B'---C'  main(feature)
```

注意 `A'`、`B'`、`C'` 是全新的提交对象——它们的父提交变了，哈希自然也不同。

## 为什么哈希会变

Git 提交的哈希由内容（含父提交哈希、作者、时间戳、消息）计算得出。rebase 重写父提交后，每个被移动的提交都要重新计算哈希。

这意味着 `git rebase` 是**历史重写操作**，这是它所有风险的根源。

## 交互式 rebase

`git rebase -i` 让你在重放前编辑提交列表：

```sh
git rebase -i HEAD~3
```

最常用的操作：

| 命令 | 含义 |
|---|---|
| `pick` | 保留提交 |
| `squash` | 合并到上一个提交 |
| `reword` | 修改提交信息 |
| `edit` | 停下来修改内容 |
| `drop` | 删除提交 |

## 适用场景

- **整理本地提交**：提交历史乱、多条 WIP，发布前用 `squash` 收拢。
- **同步最新主线**：feature 分支落后于 main 时，`git rebase main` 能让提交串在最前，避免大量 merge commit。

## 风险与原则

黄金法则是：**只 rebase 你自己的、还没推送到远程的分支**。一旦提交被推送并可能被别人基于它继续工作，rebase 就会制造混乱——别人基于旧哈希的提交会丢失关联。

如果已经推送过，考虑用 `git pull --rebase` 配合 `--force-with-lease` 谨慎推送，而不是 `--force`。

## 小结

一句话总结：rebase 是「换父提交」的历史重写；merge 是「记录交汇」的拓扑合并。两者各有用途，选哪个取决于你是否在意一条线性的提交历史。
