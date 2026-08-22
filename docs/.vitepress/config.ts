import { defineConfigWithTheme } from 'vitepress'

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
      /** 传给构建期 MiniSearch 的选项（storeFields 增加 text 以支持摘要）。 */
      miniSearch?: {
        options?: { storeFields?: string[] }
      }
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
  // VitePress 官方 sitemap 生成（https://vitepress.dev/guide/sitemap-generation）
  sitemap: {
    hostname: SITE.url,
    lastmodDateOnly: true,
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

    // SEO：title / description 由 VitePress 按页注入，这里补 canonical / OG / Twitter Card。
    ['link', { rel: 'canonical', href: `${SITE.url}/` }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: SITE.title }],
    ['meta', { property: 'og:title', content: SITE.title }],
    ['meta', { property: 'og:description', content: SITE.description }],
    ['meta', { property: 'og:url', content: `${SITE.url}/` }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: SITE.title }],
    ['meta', { name: 'twitter:description', content: SITE.description }],
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
      { text: 'Blog', link: '/blog/' },
    ],
    lastUpdated: { text: '最后更新' },
    // VitePress 官方本地搜索（https://vitepress.dev/reference/default-theme-search）
    // storeFields 增加 text，让自定义搜索 UI 能展示摘要（默认只存 title/titles）。
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            storeFields: ['title', 'titles', 'text'],
          },
        },
      },
    },
  },
})
