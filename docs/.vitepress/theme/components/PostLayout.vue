<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Content, useData, withBase } from 'vitepress'
import { data as posts } from '../../data/posts.data'
import { formatDate } from '../utils/format'
import M3Icon from './M3Icon.vue'
import PostToc from './PostToc.vue'

const { page, frontmatter } = useData()

const title = computed(() => frontmatter.value.title ?? page.value.title)
const description = computed(() => frontmatter.value.description ?? '')
const rawDate = computed(() =>
  frontmatter.value.date ? new Date(frontmatter.value.date).toISOString() : '',
)
const dateText = computed(() => formatDate(rawDate.value))
const tags = computed<string[]>(() => frontmatter.value.tags ?? [])
const lastUpdated = computed(() => {
  const ts = page.value.lastUpdated
  if (!ts) return ''
  return formatDate(new Date(ts).toISOString())
})

// 从文章数据源匹配当前文章（阅读时间 / 分类 / 前后篇）
const current = computed(() =>
  posts.find((p) => p.url === `/${page.value.relativePath.replace(/\.md$/, '')}`),
)

// 分类由所在文件夹推导（见 data/categories.ts），不写在 frontmatter 里。
const category = computed(() => current.value?.category ?? null)

const older = computed(() => {
  const i = posts.findIndex((p) => p.url === current.value?.url)
  if (i === -1 || i + 1 >= posts.length) return null
  return posts[i + 1]
})

const newer = computed(() => {
  const i = posts.findIndex((p) => p.url === current.value?.url)
  if (i === -1 || i - 1 < 0) return null
  return posts[i - 1]
})

/* ---------- TOC 滚动高亮 ---------- */

const headers = computed(() => page.value.headers ?? [])
const activeId = ref('')
let observer: IntersectionObserver | null = null

function collectIds(nodes: typeof headers.value): string[] {
  const ids: string[] = []
  for (const h of nodes) {
    ids.push(h.slug)
    ids.push(...collectIds(h.children ?? []))
  }
  return ids
}

function setupObserver() {
  observer?.disconnect()
  activeId.value = ''
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return
  const ids = collectIds(headers.value)
  if (!ids.length) return
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) activeId.value = (e.target as HTMLElement).id
      }
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
  )
  for (const id of ids) {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  }
}

onMounted(setupObserver)
watch(() => page.value.relativePath, setupObserver)
onBeforeUnmount(() => observer?.disconnect())

/* ---------- 回到顶部 ---------- */

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <main class="site-main post-layout">
    <!-- 目录（窄屏折叠） -->
    <details v-if="headers.length" class="post-toc-mobile">
      <summary class="post-toc-mobile__summary">目录</summary>
      <PostToc :headers="headers" :active-id="activeId" />
    </details>

    <!-- 正文列 -->
    <article class="post-layout__content">
      <!-- 返回列表（M3 text button + 前导箭头图标） -->
      <M3Button :href="withBase('/posts/')" variant="text" class="post-back">
        <M3Icon name="arrowLeft" :size="18" />
        返回列表
      </M3Button>

      <header class="post-header">
        <div v-if="category" class="post-header__categories">
          <a
            class="post-header__category"
            :href="withBase(`/posts/?cat=${encodeURIComponent(category.slug)}`)"
          >
            {{ category.label }}
          </a>
        </div>

        <h1 class="post-header__title">{{ title }}</h1>

        <p v-if="description" class="post-header__desc">{{ description }}</p>

        <div class="post-header__meta">
          <span v-if="dateText" class="post-header__meta-item">
            <M3Icon name="calendar" :size="14" />
            <time :datetime="rawDate">{{ dateText }}</time>
          </span>
          <span v-if="current?.readingTime" class="post-header__meta-item">
            <M3Icon name="clock" :size="14" />
            {{ current.readingTime }} 分钟
          </span>
          <span v-if="lastUpdated" class="post-header__meta-item">
            更新于 {{ lastUpdated }}
          </span>
        </div>

        <div v-if="tags.length" class="post-header__tags">
          <a
            v-for="t in tags"
            :key="t"
            class="post-header__tag"
            :href="withBase(`/posts/?tag=${encodeURIComponent(t)}`)"
          >
            #{{ t }}
          </a>
        </div>
      </header>

      <div class="vp-doc">
        <Content />
      </div>

      <!-- 前后篇 -->
      <nav v-if="older || newer" class="post-nav" aria-label="文章导航">
        <a v-if="older" :href="withBase(older.url)" class="post-nav__card m3-card m3-card--elev1">
          <span class="post-nav__label">上一篇</span>
          <span class="post-nav__title">{{ older.title }}</span>
        </a>
        <a v-if="newer" :href="withBase(newer.url)" class="post-nav__card m3-card m3-card--elev1 post-nav__card--right">
          <span class="post-nav__label">下一篇</span>
          <span class="post-nav__title">{{ newer.title }}</span>
        </a>
      </nav>
    </article>

    <!-- 目录（桌面右侧玻璃栏）+ 回到顶部 -->
    <aside v-if="headers.length" class="post-toc" aria-label="目录">
      <nav class="post-toc__panel">
        <span class="post-toc__eyebrow">on this page</span>
        <PostToc :headers="headers" :active-id="activeId" />
      </nav>

      <!-- 回到顶部：随侧栏吸顶，不随正文滚动 -->
      <M3Button variant="text" class="back-to-top" @click="scrollToTop">
        <M3Icon name="chevronUp" :size="18" /> 回到顶部
      </M3Button>
    </aside>

    <!-- 回到顶部：移动端右下角悬浮图标按钮 -->
    <M3IconButton
      icon="chevronUp"
      label="回到顶部"
      class="back-to-top--float"
      @click="scrollToTop"
    />
  </main>
</template>
