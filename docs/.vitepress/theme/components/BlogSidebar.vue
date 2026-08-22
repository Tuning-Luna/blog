<script setup lang="ts">
/**
 * 博客侧栏：分类 / 标签 / 归档 筛选。
 * 纯受控组件：props 传入候选项与当前激活项，emit 通知父级切换（点击已激活项取消）。
 * 桌面 sticky 玻璃面板；窄屏降为普通区块（由 blog.css 处理）。
 */

export interface SidebarItem {
  name: string
  count: number
}

export interface SidebarYear {
  year: string
  count: number
}

const props = defineProps<{
  categories: SidebarItem[]
  tags: SidebarItem[]
  years: SidebarYear[]
  activeCategory: string | null
  activeTag: string | null
  activeYear: string | null
}>()

const emit = defineEmits<{
  'update:category': [name: string | null]
  'update:tag': [name: string | null]
  'update:year': [year: string | null]
  clear: []
}>()

const isFiltered = () =>
  !!(props.activeCategory || props.activeTag || props.activeYear)
</script>

<template>
  <aside class="blog-sidebar" aria-label="文章筛选">
    <div class="blog-sidebar__panel">
      <!-- 分类 -->
      <section class="blog-sidebar__section">
        <h3 class="blog-sidebar__title">分类</h3>
        <ul class="blog-sidebar__list">
          <li v-for="c in categories" :key="c.name">
            <button
              type="button"
              class="blog-sidebar__item"
              :class="{ 'blog-sidebar__item--active': activeCategory === c.name }"
              :aria-pressed="activeCategory === c.name"
              @click="emit('update:category', activeCategory === c.name ? null : c.name)"
            >
              <span>{{ c.name }}</span>
              <span class="blog-sidebar__count">{{ c.count }}</span>
            </button>
          </li>
        </ul>
      </section>

      <!-- 标签 -->
      <section class="blog-sidebar__section">
        <h3 class="blog-sidebar__title">标签</h3>
        <div class="blog-sidebar__chips">
          <button
            v-for="t in tags"
            :key="t.name"
            type="button"
            class="blog-chip"
            :class="{ 'blog-chip--active': activeTag === t.name }"
            :aria-pressed="activeTag === t.name"
            @click="emit('update:tag', activeTag === t.name ? null : t.name)"
          >
            #{{ t.name }}<span class="blog-chip__count">{{ t.count }}</span>
          </button>
        </div>
      </section>

      <!-- 归档（按年） -->
      <section class="blog-sidebar__section">
        <h3 class="blog-sidebar__title">归档</h3>
        <ul class="blog-sidebar__list">
          <li v-for="y in years" :key="y.year">
            <button
              type="button"
              class="blog-sidebar__item"
              :class="{ 'blog-sidebar__item--active': activeYear === y.year }"
              :aria-pressed="activeYear === y.year"
              @click="emit('update:year', activeYear === y.year ? null : y.year)"
            >
              <span>{{ y.year }} 年</span>
              <span class="blog-sidebar__count">{{ y.count }}</span>
            </button>
          </li>
        </ul>
      </section>

      <!-- 清除筛选 -->
      <button
        v-if="isFiltered()"
        type="button"
        class="blog-sidebar__clear"
        @click="emit('clear')"
      >
        清除筛选
      </button>
    </div>
  </aside>
</template>
