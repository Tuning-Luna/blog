<script setup lang="ts">
/**
 * 博客列表页 —— 遵循 VitePress 官方 createContentLoader 模式（guide/data-loading）：
 * 一个干净的按日期倒序的文章列表。
 * 过滤状态存在 URL query（?cat=&tag=&page=）里，可分享、可直接刷新恢复：
 *   - cat 是按文件夹推导出的分类（见 data/categories.ts），由顶部筛选条与卡片芯片触发；
 *   - tag 是 frontmatter 的细粒度标签，只能点卡片上的标签触发。
 */
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { withBase } from 'vitepress'
import { CATEGORIES, categoryOf, type CategoryFacet } from '../../data/categories'
import { data as posts, type Post } from '../../data/posts.data'
import { formatDate, yearOf } from '../utils/format'
import BlogCategoryFilter from './BlogCategoryFilter.vue'

const PER_PAGE = 8

const activeCategory = ref<string | null>(null)
const activeTag = ref<string | null>(null)
const page = ref(1)

/* ---------- URL query 同步 ---------- */

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
  // history.replaceState 写的是完整 URL，必须带部署 base。
  const basePath = withBase('/posts/')
  window.history.replaceState(null, '', s ? `${basePath}?${s}` : basePath)
}

onMounted(parseQuery)
watch([activeCategory, activeTag, page], syncQuery)

/* ---------- 数据 ---------- */

const isFiltered = computed(() => !!(activeCategory.value || activeTag.value))

/* 状态条上显示中文分类名；若 URL 里被人为改成未知 slug，就退回显示 slug 本身。 */
const activeCategoryLabel = computed(
  () => categoryOf(activeCategory.value)?.label ?? '',
)

/* 分类筛选项：只列出真正有文章的类别（所以尚未开写的「软件推荐」不会出现）。
   顺序取 CATEGORIES 的登记顺序；存在但未登记的文件夹按名称追加在后，展示名回退为 slug。 */
const categoryFacets = computed<CategoryFacet[]>(() => {
  const counts = new Map<string, number>()
  for (const p of posts) {
    const slug = p.category?.slug
    if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1)
  }
  const registered = CATEGORIES.filter((c) => counts.has(c.slug))
  const unregistered = [...counts.keys()]
    .filter((slug) => !CATEGORIES.some((c) => c.slug === slug))
    .sort()
    .map((slug) => ({ slug, label: slug }))
  return [...registered, ...unregistered].map((c) => ({
    ...c,
    count: counts.get(c.slug)!,
  }))
})

const filtered = computed(() =>
  posts.filter(
    (p) =>
      (!activeCategory.value || p.category?.slug === activeCategory.value) &&
      (!activeTag.value || p.tags.includes(activeTag.value)),
  ),
)

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / PER_PAGE)),
)

const paginated = computed(() =>
  filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE),
)

watchEffect(() => {
  if (page.value > pageCount.value) page.value = pageCount.value
})

/* 归档：按年分组 */
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

/** 点分类：已是当前分类则取消；slug 为 null 表示「全部」。 */
function filterCategory(slug: string | null) {
  activeCategory.value = activeCategory.value === slug ? null : slug
  page.value = 1
}

function filterTag(name: string) {
  activeTag.value = activeTag.value === name ? null : name
  page.value = 1
}

function clearFilters() {
  activeCategory.value = null
  activeTag.value = null
  page.value = 1
}

function setPage(n: number) {
  page.value = n
}
</script>

<template>
  <main class="site-main blog-list">
    <div class="blog-list__container">
      <!-- 标题 -->
      <header class="blog-list__header">
        <span class="blog-list__eyebrow">blog</span>
        <h1 class="blog-list__title">Blog</h1>
      </header>

      <!-- 分类筛选条 -->
      <BlogCategoryFilter
        :facets="categoryFacets"
        :active="activeCategory"
        :total="posts.length"
        @select="filterCategory"
      />

      <!-- 筛选状态条（仅筛选时显示） -->
      <div v-if="isFiltered" class="blog-list__filterbar" role="status">
        <span class="blog-list__filterbar-text">
          {{ activeCategory ? `分类：${activeCategoryLabel}` : '' }}
          {{ activeTag ? `标签：${activeTag}` : '' }}
          · 共 {{ filtered.length }} 篇
        </span>
        <button type="button" class="blog-list__clear" @click="clearFilters">
          清除筛选
        </button>
      </div>

      <!-- 文章列表：每行一个玻璃卡片 -->
      <ul v-if="paginated.length" class="blog-list__items">
        <li v-for="p in paginated" :key="p.url">
          <article class="blog-list__item">
            <div class="blog-list__item-meta">
              <time :datetime="p.date" class="blog-list__date">
                {{ formatDate(p.date) }}
              </time>
              <span v-if="p.category" class="blog-list__category">
                <button
                  type="button"
                  class="blog-list__link blog-list__link--category"
                  :class="{ 'is-active': activeCategory === p.category.slug }"
                  @click="filterCategory(p.category.slug)"
                >
                  {{ p.category.label }}
                </button>
              </span>
            </div>
            <a :href="withBase(p.url)" class="blog-list__item-title">{{ p.title }}</a>
            <p v-if="p.description" class="blog-list__item-desc">
              {{ p.description }}
            </p>
            <div v-if="p.tags.length" class="blog-list__tags">
              <button
                v-for="t in p.tags"
                :key="t"
                type="button"
                class="blog-list__link blog-list__link--tag"
                :class="{ 'is-active': activeTag === t }"
                @click="filterTag(t)"
              >
                #{{ t }}
              </button>
            </div>
          </article>
        </li>
      </ul>
      <p v-else class="blog-list__empty">没有匹配的文章。</p>

      <!-- 分页 -->
      <nav v-if="pageCount > 1" class="blog-list__pagination" aria-label="文章分页">
        <button
          type="button"
          class="blog-list__page-btn"
          :disabled="page === 1"
          @click="setPage(page - 1)"
        >
          上一页
        </button>
        <span class="blog-list__page-info">{{ page }} / {{ pageCount }}</span>
        <button
          type="button"
          class="blog-list__page-btn"
          :disabled="page === pageCount"
          @click="setPage(page + 1)"
        >
          下一页
        </button>
      </nav>

      <!-- 归档 -->
      <section class="blog-list__archive" aria-labelledby="blog-archive-title">
        <h2 id="blog-archive-title" class="blog-list__archive-title">归档</h2>
        <div v-for="[year, items] in archive" :key="year" class="blog-list__year">
          <h3 class="blog-list__year-title">
            {{ year }} 年
            <span class="blog-list__year-count">{{ items.length }}</span>
          </h3>
          <ul class="blog-list__archive-list">
            <li v-for="p in items" :key="p.url" class="blog-list__archive-item">
              <time :datetime="p.date" class="blog-list__archive-date">
                {{ formatDate(p.date) }}
              </time>
              <a :href="withBase(p.url)" class="blog-list__archive-link">{{ p.title }}</a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </main>
</template>
