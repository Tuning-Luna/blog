---
title: Git 分支策略：Git Flow、GitHub Flow 与 Trunk Based
date: 2024-06-08
description: 三种主流分支策略的取舍，以及小团队怎么选。
tags:
  - Git
  - 工程实践
categories:
  - Git
---

分支策略决定了团队如何协作、如何发布。没有银弹，只有适合当前团队规模的方案。

<!-- more -->

## Git Flow：适合发布节奏明确的传统项目

- `main`：稳定可发布
- `develop`：日常集成
- `feature/*`：功能开发，合回 develop
- `release/*`：发布前收尾
- `hotfix/*`：线上紧急修复，直接合 main 和 develop

优点是发布边界清晰；缺点是分支多、流程重，小团队维护成本高。

## GitHub Flow：适合持续部署的互联网产品

极简：只有 `main` 一条长期分支，所有改动都开 `feature` 分支，PR 合回 `main` 即发布。

```text
main ──────●──●──────●──
feature ●──●──●
```

规则只有几条：任何改动都开分支、通过 PR 讨论、合并后立即部署、合并前 CI 必须过。

## Trunk Based：适合追求极致交付速度的团队

所有人都直接在主干（或很短的短命分支）上提交，靠特性开关控制发布内容。适合高频率部署的大型团队，但对测试与自动化要求很高。

## 小结

选型的判断标准：**你的发布频率和团队规模**。一周发一次、多人协作 → Git Flow；每天发多次、几个人 → GitHub Flow。别为了「规范」而引入与规模不匹配的复杂度。
