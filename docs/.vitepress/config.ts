import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { createContentLoader, defineConfigWithTheme } from 'vitepress'
import type { MarkdownRenderer } from 'vitepress'
import { buildFeed } from './data/feed'
import { SEARCH_STORE_FIELDS, tokenizeCJK } from './data/search-core'
import {
  POSTS_GLOB,
  POSTS_LOADER_OPTIONS,
  navFor,
  transformPosts,
  type Post,
} from './data/posts-core'

/** 自定义主题的 themeConfig 结构（与 theme 组件消费的字段一致）。 */
interface BlogThemeConfig {
  siteMeta: { author: string; github: string }
  nav: { text: string; link: string }[]
  lastUpdated?: { text: string }
  /** VitePress 官方本地搜索（自定义主题自建 UI，见 LocalSearch.vue）。 */
  search?: {
    provider: 'local'
    options?: {
      detailedView?: boolean
      disableQueryPersistence?: boolean
      /** 构建期 MiniSearch 的选项（storeFields 增加 text 以支持摘要；tokenize 为中文分词）。 */
      miniSearch?: {
        options?: {
          storeFields?: string[]
          /**
           * 中文分词器 —— 见 `data/search-core.ts`。
           * ⚠️ 索引 JSON 里不含分词器，客户端必须传同一份（LocalSearch.vue 已 import）。
           */
          tokenize?: (text: string) => string[]
        }
      }
      /**
       * 自定义「送进索引的 HTML」，见下方 `renderForSearch`。
       * 签名对齐官方 `LocalSearchOptions['_render']`（MarkdownEnv 未从 vitepress 主入口导出）。
       */
      _render?: (
        src: string,
        env: { frontmatter?: Record<string, unknown> },
        md: MarkdownRenderer
      ) => string
    }
  }
}

/**
 * 站点元数据 —— SITE.url 为部署后的真实 URL（GitHub Pages 项目页，用于 canonical / Open Graph / sitemap）；
 * BASE_URL 由 GitHub Actions 注入（见 deploy.yml）。
 */
const SITE = {
  title: 'TuningLuna Blog',
  description: 'TuningLuna 的个人博客 — 前端、开源与 AI Agent 随笔',
  author: 'TuningLuna',
  github: 'https://github.com/Tuning-Luna',
  url: 'https://tuning-luna.github.io/blog',
}

/** 首页「最新文章」展示几篇（由 transformPageData 注入，HomeLayout 只管渲染）。 */
const HOME_LATEST_COUNT = 6

/** 从环境变量解析 base：本地为 /，CI 注入 /<repo>/；用户页（<user>.github.io）回退 /。 */
function resolveBase(): string {
  const b = process.env.BASE_URL
  if (b) {
    if (b.startsWith('/') && b.endsWith('.github.io/')) return '/'
    return b
  }
  return '/'
}

const base = resolveBase()

/**
 * 页面在**生产站点**上的绝对地址（供 canonical / og:url 使用）。
 * 永远用 SITE.url（已含 /blog），这样本地 base=/ 时生成的仍是线上正确的地址。
 * index.md 收敛到目录本身：`index.md` → `/`，`posts/index.md` → `/posts/`。
 */
function pageUrl(relativePath: string): string {
  const clean = relativePath.replace(/index\.md$/, '').replace(/\.md$/, '')
  return `${SITE.url}/${clean}`
}

/**
 * 构建期的文章列表。`transformPageData` 与 `buildEnd` 都用它，
 * 规则与 `posts.data.ts` 完全一致（同一份 `transformPosts`）。
 * createContentLoader 自带按文件 mtime 的缓存，dev 下改文章也会生效。
 */
let postsLoader: { load: () => Promise<Post[]> } | null = null
function loadPosts(): Promise<Post[]> {
  postsLoader ??= createContentLoader<Post[]>(POSTS_GLOB, {
    ...POSTS_LOADER_OPTIONS,
    transform: transformPosts,
  })
  return postsLoader.load()
}

/**
 * 送进本地搜索索引的 HTML（VitePress 的 `search.options._render`）。
 *
 * 为什么需要它：索引器切分的只是**渲染后的 Markdown 正文**，frontmatter 不在其中。
 * 而本站文章页的标题由 PostLayout 从 `frontmatter.title` 渲染（正文不写 `# 标题`，
 * 见 WRITING.md），于是标题与摘要根本不在索引里 —— 搜「科大讯飞一面」永远是 0 条。
 * 首页 / 列表页 / 分类落地页同理：正文由组件渲染、Markdown 正文近乎为空，索引里没内容。
 *
 * 做法即官方文档 local search 一节的 Example 2：在正文前补一个一级标题（外加摘要段落），
 * 标题与摘要随之可被搜到，并多出一条**页面级**结果（id 不带 #锚点，就是页面地址本身）。
 *
 * 两个实现细节：
 * - 索引器只把「内部带 `<a href="#…">` 的 h1~h6」当作标题（VitePress 的 headingRegex），
 *   且标题**之前**的正文会被整段丢弃，所以标题必须以「标题 + 锚点链接」的形式补。
 *   锚点的 href 故意留空：本站的 h1 由布局组件渲染，正文里并不存在可跳转的锚点，
 *   留空正好让这条记录的 id 干净地等于页面地址，而不是一个页面上并不存在的 #锚点。
 * - 官方文档提醒：自己实现 `_render` 之后，`search: false` 的排除逻辑要自己写；
 *   且 `env.frontmatter` 要等 `md.render` 之后才有值。
 *
 * 该函数以 `_` 开头，VitePress 不会（也无法）把它序列化进客户端，Node API 可自由使用。
 */
function renderForSearch(
  src: string,
  env: { frontmatter?: Record<string, unknown> },
  md: MarkdownRenderer
): string {
  const html = md.render(src, env)

  const frontmatter = env.frontmatter
  if (frontmatter?.search === false) return ''

  const title = typeof frontmatter?.title === 'string' ? frontmatter.title : ''
  if (!title) return html

  // frontmatter 是人工写的纯文本，转义后再拼接，避免标题里的 < > 破坏索引器的切分。
  const heading = md.utils.escapeHtml(title)
  const description =
    typeof frontmatter?.description === 'string'
      ? md.utils.escapeHtml(frontmatter.description)
      : ''
  const summary = description ? `<p>${description}</p>\n` : ''

  return `<h1>${heading}<a class="header-anchor" href="#"></a></h1>\n${summary}${html}`
}

export default defineConfigWithTheme<BlogThemeConfig>({
  lang: 'zh-CN',
  title: SITE.title,
  description: SITE.description,
  base,
  // 关闭 VitePress 内置外观切换（.dark class），由 design-system 的 data-theme 机制接管。
  appearance: false,
  cleanUrls: true,
  lastUpdated: true,
  // 页面标题：保持默认「标题 | 站名」模式（首页标题与站名相同时自动去重，
  // 避免出现「TuningLuna Blog | TuningLuna Blog」）。
  titleTemplate: true,

  /**
   * 按页补 SEO 标签。
   *
   * 为什么必须在这里做：`head` 是全局的，写死在里面的 canonical / og:url 会让
   * 每一篇文章都声称自己的规范地址是首页 —— 等于告诉搜索引擎所有文章都是重复内容。
   * 官方推荐用 `transformPageData`（它同时作用于 dev 与客户端导航），
   * 官方文档给的示例也正是写 canonical / og:title。
   *
   * ⚠️ VitePress 的 head 合并规则：有 `id` 的按 `id` 去重、`meta` 按第一个非 `content`
   *    属性去重，**其余（含 `link`）一律不去重**。所以全局 head 里不能再有 canonical，
   *    否则每页会输出两条。
   *
   * 顺带把「阅读时长 / 分类 / 前后篇」注入文章页、把「最新 N 篇」注入首页 ——
   * 这样 PostLayout / HomeLayout 不必各自 import 整份文章索引，
   * 那份数据也就不会被拖进「每页都加载」的主题 chunk。
   */
  async transformPageData(pageData) {
    const relative = pageData.relativePath
    const url = pageUrl(relative)
    const isPost = relative.startsWith('posts/')

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:url', content: url }],
      [
        'meta',
        { property: 'og:type', content: isPost ? 'article' : 'website' },
      ],
      ['meta', { property: 'og:title', content: pageData.title ?? SITE.title }],
      [
        'meta',
        {
          property: 'og:description',
          content: pageData.description ?? SITE.description,
        },
      ],
      // Twitter 卡片显式按页给，不依赖它回退到 og: 的行为。
      ['meta', { name: 'twitter:title', content: pageData.title ?? SITE.title }],
      [
        'meta',
        {
          name: 'twitter:description',
          content: pageData.description ?? SITE.description,
        },
      ],
    )

    if (relative === 'index.md') {
      const posts = await loadPosts()
      pageData.frontmatter.latestPosts = posts.slice(0, HOME_LATEST_COUNT)
      return
    }

    if (isPost) {
      const posts = await loadPosts()
      // Post.url 形如 /posts/tools/git-rebase（已去掉 .html）
      const nav = navFor(posts, `/${relative.replace(/\.md$/, '')}`)
      if (nav) pageData.frontmatter.blogNav = nav
    }
  },

  /** 构建结束后产出 RSS（官方文档给出的 buildEnd 用法）。outDir 已是绝对路径。 */
  async buildEnd(siteConfig) {
    const posts = await loadPosts()
    writeFileSync(
      path.join(siteConfig.outDir, 'feed.xml'),
      buildFeed(posts, SITE),
      'utf8',
    )
  },

  // VitePress 官方 sitemap 生成（https://vitepress.dev/guide/sitemap-generation）
  sitemap: {
    hostname: SITE.url,
    lastmodDateOnly: true,
    // VitePress 生成的条目 url 是不含部署 base 的路由路径（如 /posts/git-rebase），
    // 与含路径段的 hostname（…/blog）拼接时会丢掉 /blog，导致 sitemap 指向 404。
    // 这里用 SITE.url（origin + base）作前缀把 base 补回每个 url。
    async transformItems(items) {
      return items.map((item) => ({
        ...item,
        url: `${SITE.url}/${item.url.replace(/^\/+/, '')}`,
      }))
    },
  },

  head: [
    ['link', { rel: 'icon', href: `${base}favicon.svg`, type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#10140f' }],

    // 字体（禁 Google Fonts，见 design-system AGENT-GUIDE §6）
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/@fontsource/manrope@5.3.0/latin.css',
      },
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.3.0/latin.css',
      },
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fontsapi.zeoseven.com/442/main/result.css',
      },
    ],

    // 首帧前应用主题（默认 dark，防闪白）。键名必须与 theme/composables/useTheme.ts 一致。
    [
      'script',
      {},
      `(function(){try{var t=localStorage.getItem('tuningluna-blog-theme');if(t!=='light'&&t!=='dark'&&t!=='system')t='dark';if(t!=='system')document.documentElement.setAttribute('data-theme',t);}catch(e){}})()`,
    ],

    // RSS 自动发现
    [
      'link',
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: SITE.title,
        href: `${base}feed.xml`,
      },
    ],

    // SEO：title / description 由 VitePress 按页注入；canonical / og:url / og:type /
    // og:title / og:description / twitter:* 全部在 transformPageData 里按页生成。
    // 这里只留站点级、与页面无关的兜底项。
    ['meta', { property: 'og:site_name', content: SITE.title }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
  ],

  markdown: {
    // 开启标题提取（供自定义主题的 TOC 使用）；自定义主题下 VitePress 默认不启用。
    headers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    // 官方能力：图片懒加载 + 代码块行号。
    image: { lazyLoading: true },
    lineNumbers: true,
  },

  themeConfig: {
    // 站点身份（占位，替换 SITE 常量即可）
    siteMeta: {
      author: SITE.author,
      github: SITE.github,
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Blog', link: '/posts/' },
    ],
    lastUpdated: { text: '最后更新' },
    // VitePress 官方本地搜索（https://vitepress.dev/reference/default-theme-search）
    // - storeFields 增加 text，让自定义搜索 UI 能展示摘要（默认只存 title/titles）；
    // - tokenize 换成中文优先的分词器，否则中文内容一个句子就是一个 token，搜不到
    //   （原因与做法见 data/search-core.ts，客户端 LocalSearch.vue 必须传同一份）；
    // - _render 把 frontmatter 的标题 / 摘要补进索引，否则标题根本搜不到（见该函数注释）。
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            storeFields: [...SEARCH_STORE_FIELDS],
            tokenize: tokenizeCJK,
          },
        },
        _render: renderForSearch,
      },
    },
  },
})
