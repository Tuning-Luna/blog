# vendor/ — 从 design-system 复制的 CSS（自包含实现）

本目录是 **MD3 × Glassmorphism 设计系统**中本博客实际用到的 CSS 的**复制副本**，让博客仓库自包含、不依赖外层 `design-system/` 目录（该目录为参考，不随本仓库提交）。

来源：`design-system/`（2026-08-16 从 Tuning-Luna.github.io 提取的资源包），复制日期 2026-08-22。

## 包含

- `tokens.css`（含 `@import './colors.css'`）、`colors.css`、`base.css`、`site-background.css`、`utilities.css`
- `components/`：Button / Card / Chip / IconButton / Section / Stat / AppBar

## 同步方法

若上层 `design-system/` 更新，按需重新复制同名文件覆盖即可：

```sh
cp design-system/theme/tokens.css docs/.vitepress/theme/vendor/
cp design-system/components/Button.css docs/.vitepress/theme/vendor/components/
```

## 约束（与 design-system 一致）

- 颜色/字号/圆角/间距/阴影/时长一律 `var(--md-*)`，NEVER 手改 `colors.css`（生成物）。
- 玻璃用标准配方（color-mix + backdrop-filter + glass-highlight），主题双通道（data-theme + prefers-color-scheme）。
- 完整规则见 `docs/.vitepress/theme/vendor/../../../../../design-system/AGENT-GUIDE.md`（未随仓库提交，参考上层目录）。
