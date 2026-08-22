<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { data as posts, type Post } from '../../data/posts.data'
import { formatDate, yearOf } from '../utils/format'
import BlogCard from './BlogCard.vue'

const PER_PAGE = 6

const activeCategory = ref<string | null>(null)
const activeTag = ref<string | null>(null)
const page = ref(1)

/* ---------- URL query 同步（?cat=&tag=&page=），过滤结果可分享 ---------- */

function parseQuery() {
  if (typeof window === 'undefined') return
  const q = new URLSearchParams(window.location.search)
  activeCategory.value = q.get('cat')
  activeTag.value = q.get('tag')
  const p = Number(q.get('page'))
  page.value = Number.isInteger(p) && p > 0 ? p : 1
}

function syncQuery() {
  if (typeof window === 'undefined') return
  const q = new URLSearchParams()
  if (activeCategory.value) q.set('cat', activeCategory.value)
  if (activeTag.value) q.set('tag', activeTag.value)
  if (page.value > 1) q.set('page', String(page.value))
  const s = q.toString()
  window.history.replaceState(null, '', s ? `/blog/?${s}` : '/blog/')
}

onMounted(parseQuery)
watch([activeCategory, activeTag, page], syncQuery)

/* ---------- 派生数据 ---------- */

const featured = computed<Post | null>(
  () => posts.find((p) => p.featured) ?? posts[0] ?? null,
)

const list = computed(() =>
  posts.filter((p) => p.url !== featured.value?.url),
)

const categories = computed(() => {
  const m = new Map<string, number>()
  for (const p of posts) for (const c of p.categories) m.set(c, (m.get(c) ?? 0) + 1)
  return [...m.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
})

const tags = computed(() => {
  const m = new Map<string, number>()
  for (const p of posts) for (const t of p.tags) m.set(t, (m.get(t) ?? 0) + 1)
  return [...m.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
})

const filtered = computed(() =>
  list.value.filter(
    (p) =>
      (!activeCategory.value || p.categories.includes(activeCategory.value)) &&
      (!activeTag.value || p.tags.includes(activeTag.value)),
  ),
)

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / PER_PAGE)),
)

const paginated = computed(() =>
  filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE),
)

// 过滤后页码越界时回退到最后一页
watchEffect(() => {
  if (page.value > pageCount.value) page.value = pageCount.value
})

const archive = computed(() => {
  const years = new Map<string, Post[]>()
  for (const p of posts) {
    const y = yearOf(p.date)
    if (!y) continue
    if (!years.has(y)) years.set(y, [])
    years.get(y)!.push(p)
  }
  return [...years.entries()].sort((a, b) => +b[0] - +a[0])
})

function setCategory(name: string | null) {
  activeCategory.value = name
  page.value = 1
}

function setTag(name: string | null) {
  activeTag.value = name
  page.value = 1
}

function setPage(n: number) {
  page.value = n
}
</script>

<template>
  <main class="site-main blog-page">
    <!-- 标题 -->
    <section class="m3-section blog-hero">
      <div class="container">
        <header class="m3-section__header">
          <span class="m3-section__eyebrow">blog</span>
          <h1 class="m3-section__title">Blog</h1>
          <p class="m3-section__subtitle">前端、开源与 AI Agent 的笔记与思考。</p>
        </header>
      </div>
    </section>

    <!-- 精选 / 最新 -->
    <section v-if="featured" class="container blog-section">
      <BlogCard :post="featured" big />
    </section>

    <!-- 分类 / 标签筛选 -->
    <section class="container blog-section">
      <div class="blog-filter">
        <div class="blog-filter__row">
          <span class="blog-filter__label" id="blog-cat-label">分类</span>
          <div class="blog-filter__chips" role="group" aria-labelledby="blog-cat-label">
            <button
              class="blog-chip"
              :class="{ 'blog-chip--active': activeCategory === null }"
              type="button"
              @click="setCategory(null)"
            >
              全部
            </button>
            <button
              v-for="c in categories"
              :key="c.name"
              class="blog-chip"
              :class="{ 'blog-chip--active': activeCategory === c.name }"
              type="button"
              :aria-pressed="activeCategory === c.name"
              @click="setCategory(activeCategory === c.name ? null : c.name)"
            >
              {{ c.name }}<span class="blog-chip__count">{{ c.count }}</span>
            </button>
          </div>
        </div>
        <div class="blog-filter__row">
          <span class="blog-filter__label" id="blog-tag-label">标签</span>
          <div class="blog-filter__chips" role="group" aria-labelledby="blog-tag-label">
            <button
              class="blog-chip"
              :class="{ 'blog-chip--active': activeTag === null }"
              type="button"
              @click="setTag(null)"
            >
              全部
            </button>
            <button
              v-for="t in tags"
              :key="t.name"
              class="blog-chip"
              :class="{ 'blog-chip--active': activeTag === t.name }"
              type="button"
              :aria-pressed="activeTag === t.name"
              @click="setTag(activeTag === t.name ? null : t.name)"
            >
              #{{ t.name }}<span class="blog-chip__count">{{ t.count }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 全部文章（分页） -->
    <section class="container blog-section">
      <h2 class="blog-section__heading">全部文章</h2>
      <p v-if="paginated.length === 0" class="blog-empty">没有匹配「{{ activeCategory || activeTag }}」的文章。</p>
      <div v-else class="blog-grid">
        <BlogCard v-for="p in paginated" :key="p.url" :post="p" />
      </div>
      <nav v-if="pageCount > 1" class="pagination" aria-label="文章分页">
        <button
          class="pagination__btn"
          type="button"
          :disabled="page === 1"
          @click="setPage(page - 1)"
        >
          上一页
        </button>
        <span class="pagination__info">{{ page }} / {{ pageCount }}</span>
        <button
          class="pagination__btn"
          type="button"
          :disabled="page === pageCount"
          @click="setPage(page + 1)"
        >
          下一页
        </button>
      </nav>
    </section>

    <!-- 归档（按年） -->
    <section class="container blog-section">
      <h2 class="blog-section__heading">归档</h2>
      <div v-for="[year, items] in archive" :key="year" class="archive-year">
        <h3 class="archive-year__title">{{ year }} <span class="archive-year__count">{{ items.length }}</span></h3>
        <ul class="archive-list">
          <li v-for="p in items" :key="p.url" class="archive-list__item">
            <time :datetime="p.date" class="archive-list__date">{{ formatDate(p.date) }}</time>
            <a :href="p.url" class="archive-list__link">{{ p.title }}</a>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>
