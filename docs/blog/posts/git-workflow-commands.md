---
title: Git 日常命令清单：从提交到回滚
date: 2025-09-17
description: 高频 Git 命令速查：暂存、回滚、改历史、协作。
tags:
  - Git
categories:
  - Git
---

平时不用查手册的 Git 命令清单，按场景分类，附上最常用的选项。

<!-- more -->

## 提交与暂存

```sh
git add -p file          # 交互式分块暂存
git commit --amend       # 修改最近一次提交信息
git stash                # 暂存工作区
git stash pop            # 恢复暂存
```

## 回滚

```sh
git restore file         # 丢弃工作区改动
git restore --staged f   # 取消暂存
git reset --soft HEAD~1  # 撤销提交但保留改动
git reset --hard HEAD~1  # 彻底撤销提交与改动
git revert <hash>        # 安全回滚已推送的提交
```

## 修改历史

```sh
git rebase -i HEAD~3     # 交互式整理最近 3 条提交
git reflog               # 找回「丢失」的提交
```

## 协作

```sh
git fetch && git log HEAD..origin/main   # 查看远端领先的提交
git pull --rebase        # 以 rebase 方式拉取
git push --force-with-lease   # 安全强制推送
```

## 小结

记住两个原则：**未推送的提交可以随便改（reset/rebase），已推送的提交用 revert 回滚**。`reflog` 是找回误操作的最后防线。
