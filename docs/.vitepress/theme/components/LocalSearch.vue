<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useData, useRouter } from 'vitepress'
import MiniSearch from 'minisearch'
import localSearchIndex from '@localSearchIndex'
import {
  SEARCH_FIELDS,
  SEARCH_STORE_FIELDS,
  tokenizeCJK,
} from '../../data/search-core'
import M3Icon from './M3Icon.vue'

/**
 * 基于 VitePress 官方本地搜索（themeConfig.search.provider: 'local'）的自定义 UI。
 * 索引由 VitePress 在构建期生成（@localSearchIndex 虚拟模块），用 MiniSearch 查询，
 * 站点保持纯静态、无后端。
 */

interface SearchDoc {
  /** 文档原始 id：即 path（可能带 #anchor） */
  id: string
  title: string
  titles: string[] | string
  text: string
}

const { localeIndex } = useData()
const router = useRouter()

const open = ref(false)
const query = ref('')
const loading = ref(false)
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLUListElement | null>(null)
const miniSearch = shallowRef<MiniSearch<SearchDoc> | null>(null)

/* ---------- 索引懒加载 ---------- */

async function ensureIndex() {
  if (miniSearch.value) return
  loading.value = true
  try {
    const chunk = await localSearchIndex[localeIndex.value]?.()
    if (!chunk?.default) return
    // ⚠️ `loadJSON` 的第一个参数是**JSON 字符串**，它内部会自己 JSON.parse
    //（`loadJS(JSON.parse(json), options)`）。这里再 parse 一次就会把对象喂进去，
    // 触发 `"[object Object]" is not valid JSON`，索引永远建不起来 —— 搜索框因此
    // 完全没结果。官方默认主题的 VPLocalSearchBox 也是直接传 chunk.default。
    miniSearch.value = MiniSearch.loadJSON<SearchDoc>(chunk.default, {
      fields: [...SEARCH_FIELDS],
      storeFields: [...SEARCH_STORE_FIELDS],
      // ⚠️ 索引 JSON 里不含分词器，这里必须传入与构建期（config.ts）**同一份**，
      // 否则查询串与索引里的 token 对不上，搜索会静默地永远没有结果。
      tokenize: tokenizeCJK,
      searchOptions: {
        fuzzy: 0.2,
        prefix: true,
        boost: { title: 4, text: 2, titles: 1 },
      },
    })
  } finally {
    loading.value = false
  }
}

const results = computed(() => {
  const q = query.value.trim()
  if (!q || !miniSearch.value) return []
  // MiniSearch 运行时在结果里附带 storeFields（path/title/titles/text），
  // 但类型定义未包含，故经 unknown 断言。
  const found = miniSearch.value.search(q) as unknown as Array<
    SearchDoc & { score: number }
  >
  return found.slice(0, 16)
})

function snippet(text: string, max = 120): string {
  const clean = (text ?? '').replace(/\s+/g, ' ').trim()
  return clean.length > max ? `${clean.slice(0, max)}…` : clean
}

/* ---------- 打开 / 关闭 ---------- */

function openSearch() {
  open.value = true
  activeIndex.value = 0
  ensureIndex()
  nextTick(() => inputRef.value?.focus())
}

function close() {
  open.value = false
  query.value = ''
  activeIndex.value = 0
}

function go(id: string) {
  close()
  router.go(id)
}

/* ---------- 键盘导航 ---------- */

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) {
    close()
    return
  }
  if (!open.value) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(results.value.length - 1, activeIndex.value + 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(0, activeIndex.value - 1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const r = results.value[activeIndex.value]
    if (r) go(r.id)
  }
}

/** 全局快捷键：/ 打开搜索（输入态不拦截）。 */
function onGlobalKeydown(e: KeyboardEvent) {
  if (e.key === '/' && !open.value) {
    const target = e.target as HTMLElement | null
    const isTyping =
      target?.tagName === 'INPUT' ||
      target?.tagName === 'TEXTAREA' ||
      target?.isContentEditable
    if (!isTyping) {
      e.preventDefault()
      openSearch()
    }
  }
}

onMounted(() => window.addEventListener('keydown', onGlobalKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onGlobalKeydown))
</script>

<template>
  <!-- 触发按钮 -->
  <button
    type="button"
    class="m3-icon-button appbar-search-btn"
    aria-label="搜索（按 / 打开）"
    @click="openSearch"
  >
    <M3Icon name="search" :size="20" />
  </button>

  <Teleport to="body">
    <div
      v-if="open"
      class="local-search"
      role="dialog"
      aria-modal="true"
      aria-label="站内搜索"
      @keydown="onKeydown"
      @click.self="close"
    >
      <div class="local-search__panel">
        <div class="local-search__input-wrap">
          <M3Icon name="search" :size="20" class="local-search__icon" />
          <input
            ref="inputRef"
            v-model="query"
            class="local-search__input"
            type="search"
            placeholder="搜索文章标题或内容…"
            aria-label="搜索关键词"
            autocomplete="off"
          />
          <button
            type="button"
            class="local-search__close"
            aria-label="关闭搜索"
            @click="close"
          >
            <M3Icon name="chevronUp" :size="16" />
          </button>
        </div>

        <p v-if="loading" class="local-search__status">正在加载索引…</p>
        <p v-else-if="query.trim() && results.length === 0" class="local-search__status">
          没有找到与「{{ query }}」相关的结果
        </p>
        <p v-else-if="!query.trim()" class="local-search__status">
          输入关键词开始搜索
        </p>

        <ul v-else ref="listRef" class="local-search__results">
          <li v-for="(r, i) in results" :key="r.id">
            <a
              :href="r.id"
              class="local-search__result"
              :class="{ 'local-search__result--active': i === activeIndex }"
              @click.prevent="go(r.id)"
              @mouseenter="activeIndex = i"
            >
              <span class="local-search__title">{{ r.title }}</span>
              <span v-if="r.titles && r.titles.length" class="local-search__titles">
                {{ (Array.isArray(r.titles) ? r.titles : [r.titles]).join(' › ') }}
              </span>
              <span v-if="snippet(r.text)" class="local-search__snippet">
                {{ snippet(r.text) }}
              </span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>
