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
│   ├── posts/
│   │   ├── index.md           # 博客列表（layout: blog，正文由 BlogList.vue 渲染）
│   │   ├── <分类>/index.md    # ★ 分类落地页（8 个：5 个一级 + software + windows/android）
│   │   │                      #   声明 presetCategory / presetSubcategory，由 BlogList 渲染
│   │   ├── frontend/          # ★ 文章按分类文件夹存放，文件夹名即分类
│   │   ├── backend/           #   frontend / backend / tools / interview / essay
│   │   ├── tools/             #   software/ 下还有二级 windows / android
│   │   ├── interview/         #   （见「文章分类」一节）
│   │   ├── essay/
│   │   └── software/
│   │       ├── windows/
│   │       └── android/
│   ├── public/favicon.svg
│   ├── public/software/       # 软件推荐文章的截图（WebP，按 windows/ android/ 分）
│   ├── public/JSA-279k.webp   # 站点背景图（全屏纹理）
│   └── .vitepress/
│       ├── config.ts          # 站点配置（SEO / RSS / 字体 / markdown / themeConfig）
│       ├── data/posts-core.ts # ★ 文章解析核心：类型 + 过滤 + 分类推导 + 排序（三处共用）
│       ├── data/posts.data.ts # ★ 客户端数据源（createContentLoader 薄壳）
│       ├── data/feed.ts       # ★ RSS 2.0 生成（buildEnd 调用）
│       ├── data/categories.ts # ★ 分类注册表（两级：展示名 / 展示顺序）
│       ├── data/search-core.ts # ★ 搜索分词核心（构建期与客户端共用的中文分词 + 字段名）
│       ├── data/profile.ts        # 人工维护的个人资料（联系方式、头像等）
│       └── theme/             # ★ 自定义主题
│           ├── index.ts       # 导出 Layout + 导入样式（不做全局组件注册）
│           ├── Layout.vue     # 按 frontmatter.layout 分发 home/blog/post/doc
│           ├── env.d.ts       # @localSearchIndex 虚拟模块类型声明
│           ├── components/    # M3 组件（Vue 重写）+ BlogList/BlogCard/PostLayout/LocalSearch 等
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

- **完全自定义主题**（`theme/index.ts` 只导出 `{ Layout }`），不 `extends` DefaultTheme，**不做全局组件注册** ——
  所有组件在各文件显式 import（依赖可见，也不会把组件拖进「每页都加载」的主题 chunk）。`<Content />` 渲染 Markdown。
- **站点背景**：`docs/public/JSA-279k.webp`（暗色照片，玻璃模糊层）。`Layout.vue` 用 `useData().site.base`
  运行时注入 `--site-bg-image`（GitHub Pages 下 base 正确）；模糊/蒙层由 design-system `.site-bg` 处理。
- **布局分发**（`Layout.vue`）：`frontmatter.layout` 显式指定，或 `posts/*` 自动识别为 `post`，其余为 `doc`。
- **三态主题**：`theme/composables/useTheme.ts` + config head 内联脚本，localStorage 键 `tuningluna-blog-theme`（两处必须一致）。`appearance: false` 已关闭 VitePress 内置切换。
- **TOC 依赖 `markdown.headers: true`**（config 已开，别删）。
- **代码块**：VitePress 构建期输出 `div.language-x > pre.shiki.vp-code`，span 携带 `--shiki-light/--shiki-dark`；明暗切换规则在 `styles/code.css`（双通道）。复制按钮由 VitePress 内核自动接线，无需自己实现。
- **博客数据**：解析规则集中在 `data/posts-core.ts`（`transformPosts`：过滤 `draft` 与所有 `index.md`，
  推导一级/二级分类，按 date 倒序，估算阅读时间），**三个消费方共用一份**，不要另写：
  1. `data/posts.data.ts` —— 列表页/首页的客户端数据源（`createContentLoader` 薄壳）；
  2. `config.ts` 的 `transformPageData` —— 把阅读时长/分类/前后篇注入文章页、最新 N 篇注入首页；
  3. `config.ts` 的 `buildEnd` —— 生成 RSS。
- **数据分包**：`BlogList` 在 `Layout.vue` 里是 `defineAsyncComponent` 懒加载的，且 `PostLayout`/`HomeLayout`
  **不再 import 整份文章索引**（改读注入的 `frontmatter.blogNav` / `frontmatter.latestPosts`）——
  否则那份数据会回到「每页都加载」的主题 chunk 里。当前 `theme.*.js` 约 40 KB 且不含文章数据，
  数据在单独的 `BlogList.*.js`（仅列表页加载）。**加新功能时别把 `posts.data` 再 import 回这两个组件。**
  > `defineAsyncComponent` 在 SSG 下会被等待（已实测产物有完整列表）—— 官方文档没写这一点，改动后请重新验证。

## 已启用的官方 VitePress 能力（config.ts）

- **本地搜索**：`themeConfig.search.provider: 'local'`。自定义主题用 `LocalSearch.vue` 消费
  `@localSearchIndex` 虚拟模块 + `minisearch`（直接依赖）查询；`/` 打开、Esc 关闭、方向键导航。
  构建期与客户端最容易走散的三处（都会**静默**失效：不报错、只是搜不到）：
  1. **分词器** `data/search-core.ts` 的 `tokenizeCJK` —— 索引 JSON 里不含分词器，`config.ts`
     与 `LocalSearch.vue` 必须各传**同一份**。MiniSearch 默认只按空白/标点切，中文整句会变成
     一个 token，「回滚」这类词永远搜不到，故汉字走二元切分；单字查询靠 `prefix: true` 前缀展开。
  2. **`storeFields`**（`SEARCH_STORE_FIELDS`，含 `text`）—— 两处同样要一致，决定结果里能否拿到摘要。
  3. **`MiniSearch.loadJSON(json, …)` 的第一个参数是 JSON 字符串** —— 它在内部自己
     `JSON.parse`，外面再 parse 一次就会抛 `"[object Object]" is not valid JSON`，
     索引建不起来 → 搜索框完全没结果（官方默认主题直接传 `chunk.default`，照抄即可）。
  另外 `config.ts` 的 `_render`（`renderForSearch`）把 frontmatter 的 title/description 补进索引：
  索引器只看**渲染后的 Markdown 正文**，而本站文章标题由 `PostLayout` 渲染、正文不写 `# 标题`，
  不补的话标题根本搜不到（首页 / 列表页 / 分类落地页同理）。
  **改完搜索必须实测**：`npm run build` 后在浏览器里搜中文标题与正文；只跑 typecheck 不够 ——
  上面三类问题一个都不会报错。`npm run preview` 的静态服务在启动时缓存文件列表，
  **重新构建后要重启 preview**，否则浏览器拿到的是 404/旧 chunk。
- **sitemap**：`sitemap: { hostname: SITE.url }`，构建生成 `sitemap.xml`（官方能力）。
- **canonical / Open Graph**：**按页**生成，在 `config.ts` 的 `transformPageData` 里写进 `frontmatter.head`。
  ⚠️ 绝不能把 canonical 放进全局 `head`：VitePress 的 head 合并规则只给 `meta`（按第一个非 `content` 属性）
  和带 `id` 的元素去重，**`link` 不去重** —— 全局加一条就会变成每页两条 canonical。
- **RSS**：`config.ts` 的 `buildEnd` 用 `createContentLoader(...).load()` 生成 `dist/feed.xml`（官方给的用法），
  模板在 `data/feed.ts`；`head` 里有 `rel="alternate"` 自动发现链接。写文件用 `path.join(siteConfig.outDir, …)`，
  `outDir` 已是绝对路径，别硬编码。
- **代码行号**：`markdown.lineNumbers: true`（样式在 `styles/code.css`）。
- **图片懒加载**：`markdown.image.lazyLoading: true`。
- **标题去重**：`titleTemplate: true`（首页标题与站名相同自动去重）。
- **导航**：Home / Blog（About 已删除，其内容即首页的联系区）。

## 文章分类

**分类的唯一事实来源是文件夹**：文章放在哪个分类文件夹里，就属于哪个分类。
frontmatter 里**没有** `categories` 字段（已移除），只有 `tags` 作为细粒度多对多标签。
分类**最多两级**，二级就是一级文件夹下的子文件夹：

| 一级文件夹 | 展示名 | 二级文件夹 |
| --- | --- | --- |
| `frontend/` | 前端 | — |
| `backend/` | 后端 | — |
| `tools/` | 工具 | — |
| `interview/` | 笔试面试 | — |
| `essay/` | 杂谈 | — |
| `software/` | 软件推荐 | `windows/`、`android/` |

- 展示名与展示顺序写在 `docs/.vitepress/data/categories.ts` 的 `CATEGORIES` 里，
  **一级数组顺序即筛选面板的排列顺序**；二级写在对应一级的 `children` 里。
- **新增一级分类** = 建文件夹 + 在 `CATEGORIES` 登记一条；
  **新增二级分类** = 在一级文件夹下建子文件夹 + 在该一级的 `children` 里登记一条。
  漏登记不会导致构建失败：`categoryOf()` / `subcategoryOf()` 会回退成 slug 本身作展示名，补上即可。
- **文件夹名用 ASCII**（如 `frontend`、`windows`，不要用「前端」），否则 URL 里会出现百分号编码，
  分类也会因为 url 被编码而匹配不上。
- 筛选面板只列出**真正有文章**的类别与其二级，没有文章的二级不会出现。
- 三级及更深的子文件夹只归到二级为止（`software/windows/xx/yy.md` 仍算 `software/windows`），
  多出来的目录仅作整理用。

### 列表页的查询参数

`/posts/?cat=<一级>&sub=<二级>&tag=<标签>&page=<页码>` —— 可分享，刷新后能恢复：

- `cat` 一级分类；**单独出现时表示「该一级下的全部」**（含其所有二级）。
- `sub` 二级分类，必须与 `cat` 搭配。
- 查询参数是**列表页内的就地筛选**；右侧筛选面板用它。筛选时写的是**当前 pathname**，
  所以在落地页上筛选不会跳回 `/posts/`。

### 分类落地页

每个分类都有一个真实地址：`docs/posts/<分类>/index.md`（二级就是 `<分类>/<二级>/index.md`），
共 8 个 —— `/posts/frontend/`、`/posts/software/`、`/posts/software/windows/` 等。
它们会被 sitemap 收录、可被搜索引擎抓取，也是卡片与文章页分类芯片的跳转目标。

- frontmatter 用 `layout: blog` + `presetCategory`（+ `presetSubcategory`）。
- `BlogList.vue` 把预设值作为筛选 ref 的**初始值**，因此 **SSR 输出的就是该分类的文章** ——
  这是落地页对 SEO 有意义的唯一前提（纯客户端筛选的话，静态 HTML 仍是一份完整列表）。
- `parseQuery()` 只在参数**存在**时覆盖，否则空查询串会把预设值清掉。
- 这些 `index.md` 由 `posts-core.ts` 的 `isIndexPage()` 排除出文章列表。
  ⚠️ VitePress 给 `index.md` 的 url 是**目录形式**（`/posts/frontend/`），所以判据是
  **「以 `/` 结尾」或「以 `/index` 结尾」**；只判断 `=== '/posts'` 会漏掉所有落地页。

### 列表页布局

`posts/index.md` 用 `layout: blog`，由 `Layout.vue` 直接渲染 `<BlogList />`，
**不经过 `.doc-layout > .container > .vp-doc`**（那条分支会把整页锁死在 760px 并让 Markdown 排版渗进组件）。
页面本体是「内容列 + ≥1200px 才出现的右侧粘性分类栏」，窄屏退回内容列顶部的折叠面板
（与文章页 `.post-toc` / `.post-toc-mobile` 同一套做法）；文章卡片用
`grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr))` 自适应列数。

> ⚠️ 分类是从文章 `url` 的路径段推导的（`posts.data.ts` 的 `pathOf`）——
> 因为 `createContentLoader` 只给 `url`，页面数据里没有文件路径（`src` 是 Markdown 原文，不是路径）。
> 这在**没有 `rewrites`** 时等价于文件夹名。**一旦 config.ts 引入 `rewrites`，url 会与文件路径脱钩，
> 一级与二级分类都会静默失效（全部文章变成未分类）**，届时要改成从别处取路径。

## 如何创建新文章

> **面向作者的完整写作说明在 `WRITING.md`**（frontmatter 各字段、图片存放与引用、标签约定、
> 常见错误速查）。本节只保留**改代码时必须知道的硬性约束**，避免两处各写一份格式说明而漂移。

1. 文章放 `docs/posts/<一级>/[<二级>/]<文件名>.md`，文件名即 URL slug（ASCII、kebab-case）。
   线上完整 URL 为 `/blog/posts/<路径>/<文件名>`（`/blog` 是部署 base 前缀）。
2. frontmatter 只写 `title` / `date` / `description` / `tags` / `draft`。
   **不要再加 `categories`** —— 分类已改由文件夹决定，该字段从全仓移除，写了也无效。
   （`featured` 字段仍在类型里，但**没有任何组件消费它**，首页「最新」是按日期取 6 篇。）
3. **正文不要写顶部的 `# 标题`**（文章页 h1 由 `PostLayout` 从 frontmatter.title 渲染，写了会重复）。
4. 图片放 `docs/public/<与文章相同的路径>/`，正文用 **Markdown 图片语法**
   （`![alt](/路径/文件名-1.webp)`）引用 —— 只有 Markdown 语法会被自动加上部署 base；
   原始 `<img src="/...">` 不在 VitePress 的 base 改写覆盖范围内。
5. 文件名不要叫 `index.md`（会被当成目录落地页排除在列表外）。
6. 本地 `npm run dev` 预览 → 满意后 `git push` 即可自动部署。

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

## 提交规范

**一个提交只做一件事。** 按层次拆开 —— 数据层 / 主题组件 / 内容 / 资源 / 文档 各自成一个 commit，
不要把互不相关的改动堆在一起。

- **改完就提交，别攒。** 攒到最后各改动会互相依赖，想按层拆也拆不动了：
  拆出来的中间提交根本编译不过。已经踩过的两个例子 ——
  「数据层去掉 `excerpt` 字段」必须和「组件不再引用 `post.excerpt`」同一个提交；
  「移除全局组件注册」必须和「给 PostLayout 补上 `import M3Button`」同一个提交。
- **前缀**用 Conventional Commits：`feat` / `fix` / `refactor` / `perf` / `docs` / `style` / `chore`，
  可带 scope，如 `refactor(data):`、`docs(posts):`、`perf(assets):`。
- **正文用中文写「为什么」**，而不是复述「改了什么」。取舍、验证结果、踩过的坑都写进去 ——
  过一段时间后 `git log` 是唯一还在现场的记录。
- **按提交粒度验证**：涉及代码的至少跑 `npm run typecheck`；涉及构建产物 / SEO / 资源的要跑
  `npm run build` 并检查产物（canonical 条数、feed 条目数、产物体积这类都可直接 grep 验证）。
- **不要提交** `docs/.vitepress/dist/`、`docs/.vitepress/cache/`（已在 `.gitignore`）。
- **默认只提交、不推送。** push 到 `main` 会触发 GitHub Actions 部署，何时发布由仓库主人决定。
- 由 Agent 提交时，消息末尾加：`Co-Authored-By: Claude Code <noreply@anthropic.com>`

## 工作纪律

- 改代码前先理解现有结构与 design-system 约定；验证再相信。
- 每完成一个阶段跑 `npm run build` + `npm run typecheck`；能测就测。
- 不引入不必要依赖：VitePress / Vue / TS / design-system 能解决的不装库。
- 个人资料（简介/项目/社交/技能）不要编造，用「TODO 占位」标注，由仓库主人补充。
- 不破坏 `theme/vendor/`（design-system 的副本）：改动前说明原因，最小范围，改后验证。
