import { createContentLoader } from 'vitepress'
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
  /** 置顶/精选（首页展示） */
  featured: boolean
  /** 估算阅读分钟数（中文 ~400 字/分，英文 ~200 词/分） */
  readingTime: number
  /** 渲染后的摘要 HTML（content 内 <!-- more --> 之前的部分） */
  excerpt: string
}

declare const data: Post[]
export { data }

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

/** 列表页 / 分类落地页（index.md）不是文章，排除。 */
function isIndexPage(url: string): boolean {
  const path = url.replace(/\.html$/, '').replace(/\/$/, '')
  return path.endsWith('/index') || path === '/posts'
}

export default createContentLoader('posts/**/*.md', {
  includeSrc: true,
  excerpt: true,
  transform(raw): Post[] {
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
          featured: Boolean(page.frontmatter.featured),
          readingTime: estimateReadingTime(page.src ?? ''),
          excerpt: page.excerpt ?? '',
        }
      })
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  },
})
