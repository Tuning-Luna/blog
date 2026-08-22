# CLAUDE.md — TuningLuna Blog

本文件是此仓库的开发规范。任何在本仓库工作的 Agent 必须先阅读本文，再动手。

## 项目简介

TuningLuna 的个人博客。基于 **VitePress** 的纯静态站点：本地写 Markdown 文章 → `git push` → GitHub Actions 自动构建并部署到 GitHub Pages。无后端、无数据库、无 CMS。

视觉体系：**Material Design 3 × Glassmorphism**，全部复用根目录 `design-system/` 设计系统资源包。

## 技术栈

- VitePress 1.6（完全自定义主题，不依赖默认主题）
- Vue 3（`<script setup lang="ts">`）
- TypeScript（vue-tsc typecheck）
- npm（lockfile 已提交，CI 用 `npm ci`）
- GitHub Actions + GitHub Pages（官方 Pages Actions）

## 目录结构

```text
.
├── docs/                      # 站点内容与配置
│   ├── index.md               # 首页（layout: home，正文由 HomeLayout.vue 渲染）
│   ├── about.md               # 关于（只保留联系方式）
│   ├── blog/
│   │   ├── index.md           # 博客列表（<BlogList /> 组件）
│   │   └── posts/             # ★ 文章统一放这里（.md）
│   ├── public/favicon.svg
│   └── .vitepress/
│       ├── config.ts          # 站点配置（SEO head / 字体 / markdown / themeConfig）
│       ├── data/posts.data.ts # ★ 文章数据加载器（createContentLoader）
│       ├── data/profile.ts        # 人工维护的个人资料（联系方式、头像等）
│       └── theme/             # ★ 自定义主题
│           ├── index.ts       # 注册 Layout + 全局组件 + 导入样式
│           ├── Layout.vue     # 按 frontmatter.layout 分发 home/post/doc
│           ├── env.d.ts       # @localSearchIndex 虚拟模块类型声明
│           ├── components/    # M3 组件（Vue 重写）+ BlogList/PostLayout/LocalSearch 等
│           ├── composables/   # useTheme（三态主题）/ useScrollReveal
│           ├── vendor/        # ★ 从 design-system 复制的 CSS（自包含，见 vendor/README.md）
│           ├── styles/        # index.css 按顺序导入 vendor CSS + 站点层叠样式
│           └── utils/format.ts
├── design-system/             # ★ 参考实现（已 gitignore，不随仓库提交）
├── .github/workflows/deploy.yml
└── package.json / tsconfig.json
```

## 核心命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 生产构建 → docs/.vitepress/dist
npm run preview    # 预览生产构建
npm run typecheck  # vue-tsc 类型检查
```

## design-system 使用规则（硬性约束）

> `design-system/` 是**参考实现**，已 gitignore、不随本仓库提交；主题实际消费的是
> `docs/.vitepress/theme/vendor/` 里的 CSS 副本（自包含，可独立构建部署）。
> 完整规则见 `design-system/AGENT-GUIDE.md`（参考上层目录）。**先读它再写任何样式。**
> 需要更新 vendor CSS 时：从 design-system 复制同名文件覆盖（见 vendor/README.md），
> 改动前说明原因、最小范围、改后验证。以下是最易踩的雷：

1. **一切皆 token。** 颜色/字号/圆角/间距/阴影/时长全部写 `var(--md-*)`，NEVER 硬编码 hex/rgba 字面量（唯一例外：`design-system/theme/tokens.css` 内的高光与滚动条 token 定义处）。
2. **颜色是角色不是值。** 用 `--md-sys-color-primary` 表达语义，不关心具体 hex。换种子色后全站自动换肤。
3. **禁手改 `design-system/theme/colors.css`**（生成物）。改品牌色走 `SEED_COLOR=#hex npx tsx design-system/scripts/gen-theme.mjs`。
4. **玻璃标准配方**（四行齐全，`-webkit-` 前缀必须有）：
   ```css
   background-color: color-mix(in srgb, var(--md-sys-color-surface-container-low) calc(var(--md-glass-opacity) * 100%), transparent);
   -webkit-backdrop-filter: blur(var(--md-glass-blur)) saturate(var(--md-glass-saturate));
   backdrop-filter: blur(var(--md-glass-blur)) saturate(var(--md-glass-saturate));
   border: 1px solid var(--md-glass-border);
   ```
   阴影固定追加 `var(--md-glass-highlight)`。NEVER 用 `opacity:`/rgba 做玻璃底；NEVER 玻璃嵌套玻璃；长文阅读容器（正文、代码块）不套玻璃。
5. **主题双通道。** 任何主题感知的新 token/规则都要成对写：
   ```css
   @media (prefers-color-scheme: dark) { :root:not([data-theme='light']) { … } }
   :root[data-theme='dark'] { … }
   ```
   `data-theme` 缺省 = system；NEVER 写 `data-theme="system"`；首帧防闪白靠 config head 的内联脚本。
6. **字体。** Manrope(display)/Inter(body)/Maple Mono(mono)，CDN 加载，NEVER 引入 Google Fonts。
7. **无障碍。** 图标按钮必带 `aria-label`；`:focus-visible` 焦点环全局已有，别删。
8. **动效。** 只消费 MD3 motion token；所有动画必须有 `prefers-reduced-motion` 分支（base.css 有全局折叠，新增动画仍应自补）。
9. **M3 组件**是 Vue 重写的（`theme/vendor/components/*.css` 复用，DOM 结构按设计系统契约）。改组件样式改 CSS；新增组件 `m3-` 前缀 + BEM + 只消费 token。
10. **适配优先。** 需要新样式时先看 design-system / vendor 是否已有；改动前必须说明原因、最小改动、验证不破坏其他页面。

## 主题架构要点

- **完全自定义主题**（`theme/index.ts` 导出 `{ Layout, enhanceApp }`），不 `extends` DefaultTheme。`<Content />` 渲染 Markdown。
- **站点背景**：`docs/public/JSA-279k.png`（暗色照片，玻璃模糊层）。`Layout.vue` 用 `useData().site.base`
  运行时注入 `--site-bg-image`（GitHub Pages 下 base 正确）；模糊/蒙层由 design-system `.site-bg` 处理。
- **布局分发**（`Layout.vue`）：`frontmatter.layout` 显式指定，或 `blog/posts/*` 自动识别为 `post`，其余为 `doc`。
- **三态主题**：`theme/composables/useTheme.ts` + config head 内联脚本，localStorage 键 `tuningluna-blog-theme`（两处必须一致）。`appearance: false` 已关闭 VitePress 内置切换。
- **TOC 依赖 `markdown.headers: true`**（config 已开，别删）。
- **代码块**：VitePress 构建期输出 `div.language-x > pre.shiki.vp-code`，span 携带 `--shiki-light/--shiki-dark`；明暗切换规则在 `styles/code.css`（双通道）。复制按钮由 VitePress 内核自动接线，无需自己实现。
- **博客数据**：`data/posts.data.ts` 聚合 `docs/blog/posts/*.md`（过滤 `draft`，按 date 倒序，估算阅读时间）。`BlogList.vue` 使用 `createContentLoader` 数据，纯静态、无运行时请求。

## 已启用的官方 VitePress 能力（config.ts）

- **本地搜索**：`themeConfig.search.provider: 'local'`。自定义主题用 `LocalSearch.vue` 消费
  `@localSearchIndex` 虚拟模块 + `minisearch`（直接依赖）查询；`/` 打开、Esc 关闭、方向键导航。
  `storeFields` 扩展了 `text` 以支持摘要（默认只存 title/titles）。
- **sitemap**：`sitemap: { hostname: SITE.url }`，构建生成 `sitemap.xml`（官方能力）。
- **代码行号**：`markdown.lineNumbers: true`（样式在 `styles/code.css`）。
- **图片懒加载**：`markdown.image.lazyLoading: true`。
- **标题去重**：`titleTemplate: true`（首页标题与站名相同自动去重）。
- **导航**：Home / Blog（About 已删除，其内容即首页的联系区）。

## 如何创建新文章

1. 在 `docs/blog/posts/` 新建 `.md` 文件（文件名即 URL slug，如 `git-rebase.md` → `/blog/posts/git-rebase`）。
2. 写 Frontmatter：
   ```yaml
   ---
   title: 文章标题
   date: 2026-08-22
   description: 一句话摘要（博客卡片/文章页副标题）
   tags: [Git, 编程]
   categories: [技术]
   featured: false   # true 时作为精选卡展示在博客首页顶部
   draft: false      # true 时不进入博客列表（但页面仍会构建）
   ---
   ```
3. **正文不要写顶部的 `# 标题`**（文章页 h1 由 `PostLayout` 从 frontmatter.title 渲染，写了会重复）。
4. 正文以介绍段开头；需要「摘要截断」时用 `<!-- more -->`（`page.excerpt` 会取它之前的内容）。
5. 本地 `npm run dev` 预览 → 满意后 `git push` 即可自动部署。

## 部署（GitHub Pages）

- workflow：`.github/workflows/deploy.yml`（push main → `npm ci` → build → deploy-pages；手动 workflow_dispatch）。
- `BASE_URL` 由 CI 注入 `/<repo>/`；config.ts 对用户页（`<user>.github.io`）自动归一化为 `/`。
- 首次启用：仓库 Settings → Pages → Source 选 **GitHub Actions**，之后每次 push main 自动部署。
- 本地模拟 CI 构建（Windows Bash 需禁 MSYS 路径转换）：
  `MSYS_NO_PATHCONV=1 BASE_URL=/<repo>/ npm run build`

## 个人资料与联系方式

- 主页/关于页展示的姓名、简介、技术栈、联系方式来自**真实来源**（个人主页仓库
  `Tuning-Luna.github.io` 的 `profile.ts` / `i18n/zh.ts` / `tech.ts`）。
- 修改联系方式与头像改 `docs/.vitepress/data/profile.ts`（人工维护）。
- 联系方式 section 组件：`ContactSection.vue`（GitHub/Gmail/Discord/Telegram/Spotify/Bilibili），
  用于首页与 About 页。

## 工作纪律

- 改代码前先理解现有结构与 design-system 约定；验证再相信。
- 每完成一个阶段跑 `npm run build` + `npm run typecheck`；能测就测。
- 不引入不必要依赖：VitePress / Vue / TS / design-system 能解决的不装库。
- 个人资料（简介/项目/社交/技能）不要编造，用「TODO 占位」标注，由仓库主人补充。
- 不破坏 `theme/vendor/`（design-system 的副本）：改动前说明原因，最小范围，改后验证。
