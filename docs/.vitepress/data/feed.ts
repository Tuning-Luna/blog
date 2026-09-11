/**
 * RSS 2.0 生成（构建结束时由 config.ts 的 buildEnd 调用，写到 dist/feed.xml）。
 *
 * 官方文档给的正是这个用法：
 *   async buildEnd() {
 *     const posts = await createContentLoader('posts/*.md').load()
 *     // generate files based on posts metadata, e.g. RSS feed
 *   }
 */
import type { Post } from './posts-core'

export interface FeedSite {
  /** 站点绝对地址，已含部署 base（如 https://tuning-luna.github.io/blog） */
  url: string
  title: string
  description: string
}

/** XML 文本/属性转义。 */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** RFC 822 日期（RSS 2.0 的 pubDate 要求）。 */
function rfc822(iso: string): string {
  const d = new Date(iso)
  return (Number.isNaN(d.getTime()) ? new Date(0) : d).toUTCString()
}

/**
 * 生成 RSS 2.0。
 * `posts` 必须已按日期倒序 —— `transformPosts()` 已保证，这里不再排序。
 */
export function buildFeed(posts: Post[], site: FeedSite): string {
  const feedUrl = `${site.url}/feed.xml`

  const items = posts.map((p) => {
    const link = `${site.url}${p.url}`
    const lines = [
      '    <item>',
      `      <title>${esc(p.title)}</title>`,
      `      <link>${esc(link)}</link>`,
      `      <guid isPermaLink="true">${esc(link)}</guid>`,
      `      <pubDate>${rfc822(p.date)}</pubDate>`,
    ]
    if (p.description) {
      lines.push(`      <description>${esc(p.description)}</description>`)
    }
    if (p.category) {
      lines.push(`      <category>${esc(p.category.label)}</category>`)
    }
    lines.push('    </item>')
    return lines.join('\n')
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${esc(site.title)}</title>`,
    `    <link>${esc(`${site.url}/`)}</link>`,
    `    <description>${esc(site.description)}</description>`,
    '    <language>zh-CN</language>',
    `    <lastBuildDate>${rfc822(posts[0]?.date ?? new Date(0).toISOString())}</lastBuildDate>`,
    `    <atom:link href="${esc(feedUrl)}" rel="self" type="application/rss+xml" />`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
}
