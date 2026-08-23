---
title: 让 AI Agent 真正可控的四个设计原则
date: 2026-07-28
description: 从工程视角总结让 AI Agent 行为可预测、可审计、可回滚的设计要点。
tags:
  - AI
  - Agent
  - 工程实践
categories:
  - 技术
  - AI
---

把大模型从「聊天」变成「干活」，难点不在模型本身，而在周围那一圈工程约束。这里是我认为最值得注意的四条原则。

<!-- more -->

## 原则一：把工具调用当作一等公民

Agent 的能力边界由工具决定。每个工具都应该有清晰的 schema、幂等设计、和显式的副作用声明：

```ts
interface Tool {
  name: string
  description: string
  schema: JSONSchema
  run: (args: unknown) => Promise<ToolResult>
}
```

工具返回结构化结果，而不是自然语言，这样 Agent 才能稳定地做下一步决策。

## 原则二：限制行动半径

- 只给 Agent 必要的最小权限
- 用**只读优先**：先看再动
- 对危险操作（删除、推送、写库）单独确认

```ts
const policy = {
  allow: ['fs.read', 'git.status', 'http.get'],
  requireApproval: ['fs.write', 'git.push'],
  deny: ['rm', 'sql.drop'],
}
```

## 原则三：每一步都可观测

把 Agent 的「思考」和「行动」都记录下来：

- `thought`：模型为什么这么做
- `action`：调用了哪个工具、参数是什么
- `observation`：工具返回了什么

这三行就是一次循环的完整审计轨迹。

## 原则四：可回滚优于可修复

任何有副作用的操作都要能撤销。写文件先备份、改数据库先开事务、部署先打标签。Agent 会犯错，好的系统不是让它不犯错，而是犯错后一分钟内能回到安全状态。

## 小结

模型越强，越需要外面的笼子。工具契约、权限边界、审计日志、回滚能力，这四件事决定了 Agent 是「助手」还是「事故」。
