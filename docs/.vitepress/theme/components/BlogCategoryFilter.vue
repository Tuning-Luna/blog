<script setup lang="ts">
/**
 * 分类筛选面板（纯展示组件）。
 *
 * 只负责渲染与派发点击，不碰数据源：facets 由消费方从文章数据统计得出，
 * 因此篇数为 0 的分类不会出现在这里。
 * 切换/取消的规则由消费方决定（这里只报告被点中的 { cat, sub }）。
 *
 * 两级：一级分类选中后展开它的二级（如 软件推荐 → Windows / Android）。
 * 注意本组件渲染在玻璃面板内部，所以行本身**不能是玻璃**（AGENT-GUIDE §13.1 禁止玻璃嵌套）。
 */
import type { CategoryFacet } from '../../data/categories'

defineProps<{
  facets: CategoryFacet[]
  /** 当前选中的一级分类 slug；null 表示「全部」 */
  cat: string | null
  /** 当前选中的二级分类 slug；null 表示该一级下的全部 */
  sub: string | null
  /** 全部文章数（含未归类的） */
  total: number
}>()

const emit = defineEmits<{
  select: [payload: { cat: string | null; sub: string | null }]
}>()
</script>

<template>
  <nav class="blog-cat-filter" aria-label="按分类筛选">
    <ul class="blog-cat-filter__list">
      <li>
        <button
          type="button"
          class="blog-cat-filter__item"
          :class="{ 'is-active': cat === null }"
          :aria-pressed="cat === null"
          @click="emit('select', { cat: null, sub: null })"
        >
          <span class="blog-cat-filter__label">全部</span>
          <span class="blog-cat-filter__count">{{ total }}</span>
        </button>
      </li>

      <li v-for="f in facets" :key="f.slug">
        <!-- 一级：选中的是「该一级下的全部」时才算 applied；已经是某个二级时只标记为祖先 -->
        <button
          type="button"
          class="blog-cat-filter__item"
          :class="{
            'is-active': cat === f.slug && sub === null,
            'is-current': cat === f.slug && sub !== null,
          }"
          :aria-pressed="cat === f.slug && sub === null"
          @click="emit('select', { cat: f.slug, sub: null })"
        >
          <span class="blog-cat-filter__label">{{ f.label }}</span>
          <span class="blog-cat-filter__count">{{ f.count }}</span>
        </button>

        <!-- 二级：仅在该一级被选中时展开，避免面板过长 -->
        <ul
          v-if="f.children?.length && cat === f.slug"
          class="blog-cat-filter__sublist"
        >
          <li v-for="c in f.children" :key="c.slug">
            <button
              type="button"
              class="blog-cat-filter__item blog-cat-filter__item--sub"
              :class="{ 'is-active': sub === c.slug }"
              :aria-pressed="sub === c.slug"
              @click="emit('select', { cat: f.slug, sub: c.slug })"
            >
              <span class="blog-cat-filter__label">{{ c.label }}</span>
              <span class="blog-cat-filter__count">{{ c.count }}</span>
            </button>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>
