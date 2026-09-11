# 博客写作说明

面向**作者**的写作参考：文件放哪、frontmatter 怎么写、图片怎么放、标签怎么加。
面向 **Agent** 的仓库规范见 `CLAUDE.md`（那份讲的是系统怎么实现，这份讲的是你该怎么写）。

---

## 30 秒速查

````md
---
title: 文章标题
date: 2026-09-10
description: 一句话摘要，会显示在列表卡片和文章页上
tags: [Git, 编程]
---

正文第一段就直接开始写，**不要**写 `# 标题`（h1 由 frontmatter 的 title 渲染）。

## 小节标题从二级开始

![截图说明](/tools/git-rebase-1.webp)
````

存成 `docs/posts/<分类>/<文件名>.md`，图片放 `docs/public/<同一路径>/`，`npm run dev` 预览，`git push` 发布。

---

## 1. 文件放哪 → URL 怎么变

**文件名就是 URL 的最后一段，文件夹就是分类。**

| 磁盘路径 | 线上 URL | 分类 |
| --- | --- | --- |
| `docs/posts/tools/git-rebase.md` | `/posts/tools/git-rebase` | 一级：工具 |
| `docs/posts/software/windows/bitwarden.md` | `/posts/software/windows/bitwarden` | 一级：软件推荐 → 二级：Windows |

完整地址会带上部署 base 前缀：`https://tuning-luna.github.io/blog/posts/tools/git-rebase`。

**命名规则**

- 文件名用 **ASCII 小写 + 连字符**：`git-rebase.md`、`hibit-uninstaller.md`。
  中文或大写文件名会让 URL 出现百分号编码，很难看也不好分享。
- 文件名**不要叫 `index`**：`index.md` 会被当作目录落地页排除在文章列表外。
  同理 `docs/posts/index.md` 是博客列表页本身，不要改动它。
- 改名 = 改 URL = 旧链接失效。已经发出去的文章尽量别改文件名。

---

## 2. Frontmatter

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | ✅ | 文章标题。列表卡片和文章页 h1 都用它 |
| `date` | ✅ | `YYYY-MM-DD`，不加引号。列表按它倒序排列 |
| `description` | 建议 | 一句话摘要。列表卡片正文、文章页副标题都用它。不写的话卡片上是空的 |
| `tags` | 建议 | 细粒度标签，见第 5 节 |
| `draft` | 可选 | `true` 时不出现在列表里（但页面**仍会被构建**，见第 7 节） |

```yaml
---
title: Git Rebase 原理
date: 2026-08-22
description: 深入理解 Git Rebase 的工作原理、适用场景与风险，以及它和 merge 的本质区别。
tags: [Git, 编程]
---
```

### ⚠️ 三个坑

1. **不要写 `categories` 字段。** 分类已经改为由文件夹决定，`categories` 已从全仓库移除。
   写了不会报错，但也不会有任何效果——只会让下一个改代码的人困惑。
2. **不要写 `featured` 字段。** 这个字段已经删掉了，首页「最新文章」就是按日期取最新 6 篇。
   同样地，写了也不生效。（`<!-- more -->` 摘要截断也没有接——摘要字段已移除。）
3. **`title` / `description` 里不要出现半角冒号后跟空格**（如 `Git: 入门`）。
   YAML 会直接解析失败、构建报错。用中文全角冒号「：」代替（看现有文章的写法）。
   另外 `#`、值以 `[` 或 `{` 开头等也有 YAML 语义，拿不准就用引号包起来。

---

## 3. 正文

- **不要写顶部的 `# 标题`。** 文章页的 h1 由 `PostLayout` 从 `frontmatter.title` 渲染，写了会重复出现两次。
- **小节标题从 `##` 开始**（`#` 留给文章标题）。
- 正文**直接以介绍段开头**，不要先摆一堆链接。
- 标题会被自动生成右侧「本页目录」（≥1200px 显示），所以标题层级别跳级（`##` → `###`）。
- 代码块、表格、VitePress 的 `::: tip` 容器等都可以正常用。
  代码块带行号（已全局开启），复制按钮由 VitePress 自动接线。

---

## 4. 图片

### 存哪

放在 `docs/public/` 下，**路径镜像文章所在目录**：

| 文章 | 图片 |
| --- | --- |
| `docs/posts/tools/git-rebase.md` | `docs/public/tools/git-rebase-1.webp` |
| `docs/posts/software/windows/bitwarden.md` | `docs/public/software/windows/bitwarden-1.webp` |

规则一句话：`docs/posts/<路径>/<文件名>.md` → `docs/public/<路径>/<文件名>-N.webp`（N 从 1 开始）。

**`docs/public/` 下的文件会原样复制到站点根目录**，不作任何处理、也不改名。
文章引用的图片和被引用的路径必须对得上，否则线上 404。

### 怎么引用

用 **Markdown 图片语法 + 绝对路径**：

```md
![Bitwarden 主界面](/software/windows/bitwarden-1.webp)
```

- 路径以 `/` 开头，**不要**写 `./` 或 `../`。
- `alt` 文字别省，无障碍和图片加载失败时都有用。
- **不要用原始 HTML 的 `<img src="/...">`。** VitePress 会给 Markdown 图片语法自动加上部署 base
  （`/blog/`，已实测构建产物是 `/blog/software/...`）；原始 `<img>` 不在官方文档覆盖范围内，
  写绝对路径有线上 404 的风险。有需要加 `width` 之类属性时，优先用 Markdown 语法 + 外层的 `<div>` 包一层。

### 格式与体积

**用 WebP。** 截图先转 WebP 再放进来，别直接丢 PNG：`docs/public/` 下的文件是**原样复制**进产物的，
构建不做任何优化，体积全由访客承担。软件推荐那批截图从 PNG 转成 WebP 后，
27 张从 8.2MB 降到约 1.9MB。

```bash
# 机器上没有 ImageMagick / cwebp / sharp，用 ffmpeg（保持原始像素尺寸）
ffmpeg -y -i in.png -c:v libwebp -quality 80 -compression_level 6 out.webp
```

`-quality 80` 是实测过的平衡点：文字类截图（窗口 UI、文件列表）在 q80 下肉眼无差别；
如果图里彩色小字特别密，可以提到 85。**转完自己看一眼文字有没有糊**——
有损 WebP 强制 4:2:0 色度二次采样，最容易伤到的就是彩色小字。

图片已开启全局懒加载，但那只是延迟加载，不减体积。

---

## 5. 标签

### 怎么写

frontmatter 里的数组，两种写法都行（仓库里都有）：

```yaml
tags: [Git, 编程]        # 内联，短的时候推荐
```

```yaml
tags:                    # 块状，标签多或名字长时更易读
  - Spring Boot
  - Java
```

### 标签 vs 分类

- **分类**由文件夹决定，**一篇只能属于一个**，是"文章住哪"。
- **标签**写在 frontmatter 里，**一篇可以有多个**，是"文章提到什么"。
- 两者独立：一篇文章既在「工具」分类下，也可以打上 `Git`、`开源` 等标签。

### 规则

- **标签是自由文本，没有注册表**，写什么都能用，不需要登记。
- 但**请复用已有标签**，别造近义词。`前端`、`Frontend`、`front-end` 在系统里是三个不同的标签，
  点进去只会看到各自那一小撮文章。
- 标签出现在**列表卡片底部**和**文章页头部**；点列表卡片上的标签会按该标签筛选列表（URL 加 `?tag=`）。

### 当前在用的标签（供复用，非强制）

**两篇以上在用的**：

```
Windows 20 · 开源 7 · Android 7 · Java 6
效率 5 · 前端 5 · Vue 3 · Spring Boot 3 · Git 3 · CSS 3
阅读器 2 · 编程 2 · 系统维护 2 · 截图 2 · 工程实践 2
```

其余多为**一次性标签**（`TypeScript`、`VitePress`、`REST`、`并发`、`剪贴板`、
`投屏`、`PDF`、`Office`、`Spotify`、`Bilibili`、`AI` 等）。写新文章时优先从上面这批里挑。

用这条命令随时看当前全量标签及使用次数：

```bash
cd docs/posts && find . -name '*.md' | xargs awk '
  /^tags: *\[/ { line=$0; sub(/^tags: *\[/,"",line); sub(/\] *$/,"",line);
                 n=split(line,a,","); for(i=1;i<=n;i++){gsub(/^ +| +$/,"",a[i]); if(a[i]!="") print a[i]}; next }
  /^tags: *$/ { intags=1; next }
  intags && /^ *- / { t=$0; sub(/^ *- */,"",t); sub(/ *$/,"",t); print t; next }
  { intags=0 }
' | sort | uniq -c | sort -rn
```

### 平台标签约定

软件推荐类的文章**约定用 `Windows` / `Android` 标注平台**；两端都支持的写两个标签，
这样即使文章按二级文件夹分好了，也能靠标签把跨平台工具捞出来。

---

## 6. 分类

分类**最多两级**，一级就是 `docs/posts/` 下的文件夹，二级是它下面的子文件夹：

| 一级 | 展示名 | 二级 |
| --- | --- | --- |
| `frontend/` | 前端 | — |
| `backend/` | 后端 | — |
| `tools/` | 工具 | — |
| `interview/` | 笔试面试 | — |
| `essay/` | 杂谈 | — |
| `software/` | 软件推荐 | `windows/`、`android/` |

- 展示名和排列顺序写在 `docs/.vitepress/data/categories.ts`。
- **新建分类** = 建文件夹 + 在 `categories.ts` 里登记一条。
  漏登记不会让构建挂掉，只是筛选面板里会显示英文文件夹名，补上即可。
- 文件夹名**必须 ASCII**（`frontend` 而不是「前端」），否则 URL 会出现百分号编码，
  分类也会因为 URL 被编码而匹配不上。
- 筛选面板在文章列表右侧（窄屏是列表上方的折叠面板），只列出**真正有文章**的分类。
- 三级及更深的子文件夹只归到二级为止（`software/windows/xx/yy.md` 仍算 `software/windows`）。

---

## 7. 草稿与发布

### 草稿

```yaml
draft: true
```

`draft: true` 的文章**不出现在列表里**，也不参与分页、归档、上下篇。

> ⚠️ 但它**照样会被构建成页面**。知道 URL 的人仍然能访问到。
> 真正不想公开的内容，就不要 push 上来。

### 本地预览与发布

```bash
npm run dev        # 本地预览（改完即时热更新）
npm run typecheck  # 类型检查
npm run build      # 生产构建（发布前跑一次，能提前发现 YAML / 图片路径问题）
```

满意后 `git push` 到 `main`，GitHub Actions 会自动构建并部署到 GitHub Pages。

---

## 8. 常见错误速查

| 症状 | 多半是 |
| --- | --- |
| 新文章没出现在列表里 | 层级放错（比如直接丢在 `docs/posts/` 根下）／`draft: true`／文件名叫 `index.md` |
| 图片线上 404 | 用了 `<img src="/...">` 而不是 Markdown 的 `![]()`；或 `docs/public/` 下的路径与引用不一致 |
| 构建报错，指向 frontmatter | `title` / `description` 里有半角冒号（`: `），换成全角「：」 |
| 标题重复出现两次 | 正文里手写了 `# 标题` |
| 分类筛选里显示英文名 | 文件夹没在 `categories.ts` 登记 |
| 文章页没有阅读时长 / 上下篇导航 | 该文章没被数据加载器收录（多半是路径层级或文件名问题） |
| 改了文件名后旧链接 404 | 文件名即 URL，改名等于换地址；已发布的文章别改名 |

更底层的原因（数据怎么加载、分类怎么从 URL 推导、为什么不能加 `rewrites`）都写在 `CLAUDE.md` 里。
