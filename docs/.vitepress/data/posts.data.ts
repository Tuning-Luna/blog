import { createContentLoader } from 'vitepress'

/** 博客文章数据模型（对应 posts 的 frontmatter）。 */
export interface Post {
  /** 文章链接（/posts/xxx，不含 .html，base 由消费方 withBase） */
  url: string
  title: string
  /** ISO 日期字符串（按发布时间倒序） */
  date: string
  description: string
  tags: string[]
  categories: string[]
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

export default createContentLoader('posts/*.md', {
  includeSrc: true,
  excerpt: true,
  transform(raw): Post[] {
    return raw
      // 排除列表页本身（docs/posts/index.md → /posts/，不是一篇文章）。
      .filter(
        (page) =>
          !page.frontmatter.draft &&
          page.url.replace(/\.html$/, '') !== '/posts/',
      )
      .map((page) => ({
        url: page.url.replace(/\.html$/, ''),
        title: page.frontmatter.title || 'Untitled',
        date: page.frontmatter.date
          ? new Date(page.frontmatter.date).toISOString()
          : new Date(0).toISOString(),
        description: page.frontmatter.description || '',
        tags: Array.isArray(page.frontmatter.tags) ? page.frontmatter.tags : [],
        categories: Array.isArray(page.frontmatter.categories)
          ? page.frontmatter.categories
          : [],
        featured: Boolean(page.frontmatter.featured),
        readingTime: estimateReadingTime(page.src ?? ''),
        excerpt: page.excerpt ?? '',
      }))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  },
})
