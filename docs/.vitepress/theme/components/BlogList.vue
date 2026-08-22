<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { data as posts, type Post } from '../../data/posts.data'
import { yearOf } from '../utils/format'
import BlogCard from './BlogCard.vue'
import BlogSidebar from './BlogSidebar.vue'

const PER_PAGE = 6

const activeCategory = ref<string | null>(null)
const activeTag = ref<string | null>(null)
const activeYear = ref<string | null>(null)
const page = ref(1)

/* ---------- URL query 同步（?cat=&tag=&year=&page=），筛选结果可分享 ---------- */

function parseQuery() {
  if (typeof window === 'undefined') return
  const q = new URLSearchParams(window.location.search)
  activeCategory.value = q.get('cat')
  activeTag.value = q.get('tag')
  activeYear.value = q.get('year')
  const p = Number(q.get('page'))
  page.value = Number.isInteger(p) && p > 0 ? p : 1
}

function syncQuery() {
  if (typeof window === 'undefined') return
  const q = new URLSearchParams()
  if (activeCategory.value) q.set('cat', activeCategory.value)
  if (activeTag.value) q.set('tag', activeTag.value)
  if (activeYear.value) q.set('year', activeYear.value)
  if (page.value > 1) q.set('page', String(page.value))
  const s = q.toString()
  window.history.replaceState(null, '', s ? `/blog/?${s}` : '/blog/')
}

onMounted(parseQuery)
watch([activeCategory, activeTag, activeYear, page], syncQuery)

/* ---------- 派生数据 ---------- */

const isFiltered = computed(
  () => !!(activeCategory.value || activeTag.value || activeYear.value),
)

// 精选卡只在无筛选时展示（筛选时应看到的是匹配结果）
const featured = computed<Post | null>(
  () => (isFiltered.value ? null : posts.find((p) => p.featured) ?? posts[0] ?? null),
)

const list = computed(() => posts.filter((p) => p.url !== featured.value?.url))

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

const years = computed(() => {
  const m = new Map<string, number>()
  for (const p of posts) {
    const y = yearOf(p.date)
    if (!y) continue
    m.set(y, (m.get(y) ?? 0) + 1)
  }
  return [...m.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => +b.year - +a.year)
})

const filtered = computed(() =>
  list.value.filter(
    (p) =>
      (!activeCategory.value || p.categories.includes(activeCategory.value)) &&
      (!activeTag.value || p.tags.includes(activeTag.value)) &&
      (!activeYear.value || yearOf(p.date) === activeYear.value),
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

const filterSummary = computed(() => {
  const parts: string[] = []
  if (activeCategory.value) parts.push(`分类：${activeCategory.value}`)
  if (activeTag.value) parts.push(`标签：${activeTag.value}`)
  if (activeYear.value) parts.push(`${activeYear.value} 年`)
  return parts.join(' · ')
})

function setCategory(name: string | null) {
  activeCategory.value = name
  page.value = 1
}

function setTag(name: string | null) {
  activeTag.value = name
  page.value = 1
}

function setYear(year: string | null) {
  activeYear.value = year
  page.value = 1
}

function clearFilters() {
  activeCategory.value = null
  activeTag.value = null
  activeYear.value = null
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
        </header>
      </div>
    </section>

    <!-- 双列：主内容 + 筛选侧栏 -->
    <div class="blog-layout">
      <div class="blog-layout__main">
        <!-- 精选 -->
        <section v-if="featured" class="blog-section">
          <BlogCard :post="featured" big />
        </section>

        <!-- 筛选状态条 -->
        <div v-if="isFiltered" class="blog-filterbar" role="status">
          <span class="blog-filterbar__text">
            {{ filterSummary }} · 共 {{ filtered.length }} 篇
          </span>
          <button type="button" class="blog-filterbar__clear" @click="clearFilters">
            清除筛选
          </button>
        </div>

        <!-- 全部文章（分页） -->
        <section class="blog-section">
          <h2 class="blog-section__heading">
            {{ isFiltered ? '筛选结果' : '全部文章' }}
          </h2>
          <p v-if="paginated.length === 0" class="blog-empty">
            没有匹配的文章。
          </p>
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
      </div>

      <BlogSidebar
        :categories="categories"
        :tags="tags"
        :years="years"
        :active-category="activeCategory"
        :active-tag="activeTag"
        :active-year="activeYear"
        @update:category="setCategory"
        @update:tag="setTag"
        @update:year="setYear"
        @clear="clearFilters"
      />
    </div>
  </main>
</template>
