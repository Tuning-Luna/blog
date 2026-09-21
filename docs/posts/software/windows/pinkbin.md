---
title: Pinkbin：看清磁盘空间被谁占了
date: 2026-09-21
description: 磁盘扫描与清理工具，按规则模板列出各软件的可清理项，删除默认走回收站且可撤销。
tags: [Windows, 磁盘分析, 开源]
---

「扫盘 · 看懂 · 一条一条删干净。」先用树状列表把整块盘的空间分配摊开（Windows 下直读 NTFS MFT，扫得很快），再针对具体软件按规则模板（scaffold）列出哪些是缓存、哪些能清、哪些绝对不能碰。删除默认走系统回收站，有操作记录可以撤销，且只枚举目录名，不读取文件内容。

还带一个 AI 顾问：可以把不认识的文件夹拖进去问「这是什么、能不能删、删了会丢什么」。

两点提醒：一是**目前官方只维护微信 PC 端和 Conda 两个清理模板**，覆盖面还比较窄；二是直读 NTFS MFT 需要管理员权限，安装包会触发 UAC，首次启动也会被 SmartScreen 拦一下（未签名，属预期行为）。另外项目早期叫 Diskwise，官方截图至今仍显示旧名。

- GitHub：https://github.com/cccyd2003-qwq/pinkbin （1.4K Stars）

![Pinkbin 主界面](/software/windows/pinkbin-1.webp)
