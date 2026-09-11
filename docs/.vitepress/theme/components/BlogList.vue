<script setup lang="ts">
/**
 * 博客列表页 —— 遵循 VitePress 官方 createContentLoader 模式（guide/data-loading）。
 *
 * 由 Layout.vue 的 `layout: blog` 分支直接渲染（见 docs/posts/index.md），
 * 因此**不套 .container / .vp-doc**：列表页要用满宽度做「内容 + 右侧粘性分类栏」两列。
 *
 * 过滤状态存在 URL query 里，可分享、可直接刷新恢复：
 *   - cat 一级分类（文件夹推导，见 data/categories.ts），由右侧栏 / 移动端折叠面板 / 卡片芯片触发；
 *   - sub 二级分类（如 software 下的 windows / android），只有分类面板能触发；
 *   - tag 是 frontmatter 的细粒度标签，只能点卡片上的标签触发。
 *   选一级分类时 sub 置空，即「看该分类下的全部」。
 */
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useData, withBase } from 'vitepress'
import {
  CATEGORIES,
  categoryOf,
  subcategoryOf,
  type Category,
  type CategoryFacet,
} from '../../data/categories'
import { data as posts } from '../../data/posts.data'
import { formatDate } from '../utils/format'
import BlogCategoryFilter from './BlogCategoryFilter.vue'

const PER_PAGE = 8

const { frontmatter } = useData()

/* 分类落地页（/posts/<分类>/）在 frontmatter 里声明预设分类。
   它必须是 ref 的**初始值**，才能参与 SSR —— 否则静态 HTML 仍是一份未筛选的完整列表，
   落地页对搜索引擎就毫无意义（客户端筛选是 hydration 之后才发生的）。 */
const presetCategory = computed(
  () => (frontmatter.value.presetCategory as string | undefined) ?? null,
)
const presetSubcategory = computed(
  () => (frontmatter.value.presetSubcategory as string | undefined) ?? null,
)

const activeCategory = ref<string | null>(presetCategory.value)
const activeSubcategory = ref<string | null>(presetSubcategory.value)
const activeTag = ref<string | null>(null)
const page = ref(1)

// 客户端在落地页之间跳转时 BlogList 不会重建，预设值要跟着 frontmatter 走。
// 不带 immediate：首次挂载已由上面的初始值处理。
watch([presetCategory, presetSubcategory], ([cat, sub]) => {
  activeCategory.value = cat
  activeSubcategory.value = sub
  activeTag.value = null
  page.value = 1
})

/* ---------- URL query 同步 ---------- */

function parseQuery() {
  if (typeof window === 'undefined') return
  const q = new URLSearchParams(window.location.search)
  // 只在参数**存在**时覆盖：落地页的分类来自 frontmatter，
  // 无条件赋值会被一个空查询串清掉。
  const cat = q.get('cat')
  const sub = q.get('sub')
  const tag = q.get('tag')
  if (cat !== null) activeCategory.value = cat
  if (sub !== null) activeSubcategory.value = sub
  if (tag !== null) activeTag.value = tag
  const p = Number(q.get('page'))
  page.value = Number.isInteger(p) && p > 0 ? p : 1
}

function syncQuery() {
  if (typeof window === 'undefined') return
  const q = new URLSearchParams()
  if (activeCategory.value) q.set('cat', activeCategory.value)
  if (activeSubcategory.value) q.set('sub', activeSubcategory.value)
  if (activeTag.value) q.set('tag', activeTag.value)
  if (page.value > 1) q.set('page', String(page.value))
  const s = q.toString()
  // 用当前 pathname（已含部署 base）而不是写死 /posts/：
  // 在分类落地页上筛选时不会跳回列表根路径。
  const path = window.location.pathname
  window.history.replaceState(null, '', s ? `${path}?${s}` : path)
}

onMounted(parseQuery)
watch([activeCategory, activeSubcategory, activeTag, page], syncQuery)

/* ---------- 数据 ---------- */

const isFiltered = computed(
  () => !!(activeCategory.value || activeSubcategory.value || activeTag.value),
)

/* 状态条上显示中文分类名（两级用 / 连接）；URL 里被改成未知 slug 时退回显示 slug 本身。 */
const activeCategoryLabel = computed(() => {
  const parent = categoryOf(activeCategory.value)
  if (!parent) return ''
  const child = subcategoryOf(activeCategory.value, activeSubcategory.value)
  return child ? `${parent.label} / ${child.label}` : parent.label
})

/* 落地页的预设分类（二级页会带上 sub）。列表页为 null。 */
const presetPath = computed(() => {
  const cat = categoryOf(presetCategory.value)
  if (!cat) return null
  return { cat, sub: subcategoryOf(presetCategory.value, presetSubcategory.value) }
})

/* 标题取**预设**分类而非实时筛选值 —— 否则在落地页上换个筛选 h1 就跳一下。 */
const pageTitle = computed(
  () => presetPath.value?.sub?.label ?? presetPath.value?.cat.label ?? 'Blog',
)

/* eyebrow：二级落地页显示它所属的一级名，一眼看出层级；其余仍是 blog。 */
const pageEyebrow = computed(() =>
  presetPath.value?.sub ? presetPath.value.cat.label : 'blog',
)

/* 分类筛选项：只列出真正有文章的类别（所以哪天某个分类清空了就不会出现）。
   一级计数含其下所有子文件夹；顺序取 CATEGORIES 的登记顺序；
   存在但未登记的文件夹按名称追加在后，展示名回退为 slug。 */
const categoryFacets = computed<CategoryFacet[]>(() => {
  const totals = new Map<string, number>()
  const subTotals = new Map<string, number>()
  for (const p of posts) {
    const parent = p.category?.slug
    if (!parent) continue
    totals.set(parent, (totals.get(parent) ?? 0) + 1)
    const child = p.subcategory?.slug
    if (child) {
      const key = `${parent}/${child}`
      subTotals.set(key, (subTotals.get(key) ?? 0) + 1)
    }
  }

  // 逐字段构造而不是展开 Category：注册表只有两级，
  // 展开会把 Category.children（Category[]）带进来，与 CategoryFacet.children 不兼容。
  const build = (c: Category): CategoryFacet => {
    const facet: CategoryFacet = {
      slug: c.slug,
      label: c.label,
      count: totals.get(c.slug) ?? 0,
    }
    const children = c.children
      ?.map((child) => ({
        slug: child.slug,
        label: child.label,
        count: subTotals.get(`${c.slug}/${child.slug}`) ?? 0,
      }))
      .filter((child) => child.count > 0)
    if (children?.length) facet.children = children
    return facet
  }

  const registered = CATEGORIES.filter((c) => totals.has(c.slug)).map(build)
  const unregistered = [...totals.keys()]
    .filter((slug) => !CATEGORIES.some((c) => c.slug === slug))
    .sort()
    .map((slug) => ({ slug, label: slug, count: totals.get(slug)! }))
  return [...registered, ...unregistered]
})

const filtered = computed(() =>
  posts.filter(
    (p) =>
      (!activeCategory.value || p.category?.slug === activeCategory.value) &&
      (!activeSubcategory.value ||
        p.subcategory?.slug === activeSubcategory.value) &&
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

/* ---------- 交互 ---------- */

/**
 * 回到顶部。不写 behavior —— 交给 `html { scroll-behavior: smooth }`（vendor/base.css），
 * 它在 prefers-reduced-motion 分支里已被全局折叠为 auto，无需自己判断。
 */
function scrollToTop() {
  if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
}

/**
 * 点分类：payload 为 { cat: null } 表示「全部」。
 * 再点一次当前选项则取消回到全部；点一级分类会把二级清空（即看该一级下的全部）。
 */
function selectCategory(payload: { cat: string | null; sub: string | null }) {
  const isSame =
    activeCategory.value === payload.cat &&
    activeSubcategory.value === payload.sub
  activeCategory.value = isSame ? null : payload.cat
  activeSubcategory.value = isSame ? null : payload.sub
  page.value = 1
  scrollToTop()
}

function filterTag(name: string) {
  activeTag.value = activeTag.value === name ? null : name
  page.value = 1
  scrollToTop()
}

function clearFilters() {
  activeCategory.value = null
  activeSubcategory.value = null
  activeTag.value = null
  page.value = 1
  scrollToTop()
}

function setPage(n: number) {
  page.value = n
  scrollToTop()
}
</script>

<template>
  <main class="site-main blog-list">
    <div class="blog-list__container">
      <div class="blog-list__layout">
        <div class="blog-list__content">
          <!-- 标题 -->
          <header class="blog-list__header">
            <span class="blog-list__eyebrow">{{ pageEyebrow }}</span>
            <h1 class="blog-list__title">{{ pageTitle }}</h1>
          </header>

          <!-- 窄屏：分类面板折叠在顶部（≥1200px 由右侧粘性栏接管，见 .blog-list__rail） -->
          <details class="blog-filter-mobile">
            <summary class="blog-filter-mobile__summary">分类</summary>
            <BlogCategoryFilter
              :facets="categoryFacets"
              :cat="activeCategory"
              :sub="activeSubcategory"
              :total="posts.length"
              @select="selectCategory"
            />
          </details>

          <!-- 筛选状态条（仅筛选时显示；标签筛选没有侧栏入口，靠它显示与清除） -->
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

          <!-- 文章列表：自适应多列的玻璃卡片 -->
          <ul v-if="paginated.length" class="blog-list__items">
            <li v-for="p in paginated" :key="p.url">
              <article class="blog-list__item">
                <div class="blog-list__item-meta">
                  <time :datetime="p.date" class="blog-list__date">
                    {{ formatDate(p.date) }}
                  </time>
                  <button
                    v-if="p.category"
                    type="button"
                    class="blog-list__link blog-list__link--category"
                    :class="{ 'is-active': activeCategory === p.category.slug }"
                    @click="selectCategory({ cat: p.category.slug, sub: null })"
                  >
                    {{ p.category.label }}
                  </button>
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
                    class="blog-list__link"
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
        </div>

        <!-- 宽屏：粘性分类栏（与文章页 .post-toc 同宽同偏移，两页导轨对齐） -->
        <aside class="blog-list__rail" aria-label="分类筛选">
          <nav class="blog-list__rail-panel">
            <span class="blog-list__rail-eyebrow">categories</span>
            <BlogCategoryFilter
              :facets="categoryFacets"
              :cat="activeCategory"
              :sub="activeSubcategory"
              :total="posts.length"
              @select="selectCategory"
            />
          </nav>
        </aside>
      </div>
    </div>
  </main>
</template>
