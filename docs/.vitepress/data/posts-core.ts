/**
 * 文章数据的核心逻辑（纯模块，不依赖 VitePress 的数据加载插件）。
 *
 * 为什么单独拆出来：同一套解析规则有三个消费方 ——
 *   1. `posts.data.ts`  —— 列表页 / 首页用的客户端数据源；
 *   2. `config.ts` 的 `transformPageData` —— 把阅读时长与前后篇注入每一页的文章数据；
 *   3. `config.ts` 的 `buildEnd` —— 构建结束后生成 RSS。
 * 三处必须用完全相同的过滤 / 推导 / 排序规则，所以只写一份。
 */
import type { ContentData } from 'vitepress'
import { categoryOf, subcategoryOf, type Category } from './categories'

/** 博客文章数据模型（对应 posts 的 frontmatter）。 */
export interface Post {
  /** 文章链接（/posts/<分类>/xxx，不含 .html，base 由消费方 withBase） */
  url: string
  title: string
  /** ISO 日期字符串（按发布时间倒序） */
  date: string
  description: string
  tags: string[]
  /** 一级分类（由所在文件夹推导），顶层文章为 null */
  category: Category | null
  /** 二级分类（一级文件夹下的子文件夹，如 software/windows），没有二级时为 null */
  subcategory: Category | null
  /** 估算阅读分钟数（中文 ~400 字/分，英文 ~200 词/分） */
  readingTime: number
}

/** 前后篇导航只需要这两项 —— 注进每一页时不必把整篇 Post 塞进去。 */
export interface PostRef {
  url: string
  title: string
}

/** 文章页专属数据，由 config.ts 的 transformPageData 写进 `frontmatter.blogNav`。 */
export interface PostNav {
  category: Category | null
  subcategory: Category | null
  readingTime: number
  /** 上一篇（更旧） */
  older: PostRef | null
  /** 下一篇（更新） */
  newer: PostRef | null
}

/** 文章来源：docs/ 下 posts/ 的任意层级（分类文件夹最多两级，更深只作整理）。 */
export const POSTS_GLOB = 'posts/**/*.md'

/**
 * createContentLoader 的选项（不含 transform，方便 build hook 直接复用）。
 * `includeSrc` 是估算阅读时长所必需的 —— 注意 `src` 是 Markdown 原文**文本**，不是文件路径。
 */
export const POSTS_LOADER_OPTIONS = { includeSrc: true }

/** 粗略估算阅读时长：从正文源码计算。 */
function estimateReadingTime(src: string): number {
  if (!src) return 1
  const text = src
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/[#>*_`~\-\[\]()!|]/g, ' ')
  const cjk = (text.match(/[一-鿿]/g) ?? []).length
  const words = (text.match(/[a-zA-Z0-9]+/g) ?? []).length
  const minutes = Math.round(cjk / 400 + words / 200)
  return Math.max(1, minutes)
}

/**
 * 从 url 推导分类文件夹（最多两级）。
 *
 * `createContentLoader` 的 `page.src` 是 Markdown 原文文本，不是文件路径，
 * 页面数据里也没有 relativePath/filePath —— 唯一能定位的就是 `url`。
 * config.ts 没有 `rewrites`，文件路径直接决定 URL，因此：
 *   /posts/frontend/vue3-composition.html   → { parent: 'frontend', child: null }
 *   /posts/software/windows/bitwarden.html  → { parent: 'software', child: 'windows' }
 *
 * 更深的层级（posts/a/b/c/x.md）仍归 a/b —— 多出来的目录只作整理用，不影响分类。
 *
 * ⚠️ 一旦 config.ts 引入 `rewrites`，url 会与文件路径脱钩，这里会静默失效
 *    （全部文章会变成未分类）。
 */
function pathOf(url: string): { parent: string | null; child: string | null } {
  const segs = url.replace(/\.html$/, '').split('/').filter(Boolean)
  // segs = ['posts', <一级>, <二级?>, <slug>]
  return {
    parent: segs.length >= 3 ? segs[1] : null,
    child: segs.length >= 4 ? segs[2] : null,
  }
}

/**
 * 列表页 / 分类落地页（index.md）不是文章，排除。
 *
 * VitePress 给 `index.md` 的 url 是**目录形式**：
 *   docs/posts/index.md          → `/posts/`
 *   docs/posts/frontend/index.md → `/posts/frontend/`
 * 所以除了显式的 `/index`，**以 `/` 结尾的一律排除**。
 * （早先的实现只判断 `=== '/posts'`，新增分类落地页后会漏掉它们，
 * 落地页会被当成文章混进列表、RSS 与分类统计。）
 */
function isIndexPage(url: string): boolean {
  const path = url.replace(/\.html$/, '')
  return path.endsWith('/') || path.endsWith('/index')
}

/** 过滤 draft 与 index 页，推导分类，按日期倒序。三个消费方共用这一份。 */
export function transformPosts(raw: ContentData[]): Post[] {
  return raw
    .filter((page) => !page.frontmatter.draft && !isIndexPage(page.url))
    .map((page) => {
      const { parent, child } = pathOf(page.url)
      return {
        url: page.url.replace(/\.html$/, ''),
        title: page.frontmatter.title || 'Untitled',
        date: page.frontmatter.date
          ? new Date(page.frontmatter.date).toISOString()
          : new Date(0).toISOString(),
        description: page.frontmatter.description || '',
        tags: Array.isArray(page.frontmatter.tags) ? page.frontmatter.tags : [],
        category: categoryOf(parent),
        subcategory: subcategoryOf(parent, child),
        readingTime: estimateReadingTime(page.src ?? ''),
      }
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

/**
 * 取某篇文章在**已按日期倒序**的列表中的导航数据（阅读时长 / 分类 / 前后篇）。
 * 数组倒序，所以 i + 1 是更旧的一篇（上一篇），i - 1 是更新的一篇（下一篇）。
 */
export function navFor(sortedPosts: Post[], url: string): PostNav | null {
  const i = sortedPosts.findIndex((p) => p.url === url)
  if (i === -1) return null
  const current = sortedPosts[i]
  const ref = (p: Post | undefined): PostRef | null =>
    p ? { url: p.url, title: p.title } : null
  return {
    category: current.category,
    subcategory: current.subcategory,
    readingTime: current.readingTime,
    older: ref(sortedPosts[i + 1]),
    newer: ref(sortedPosts[i - 1]),
  }
}
