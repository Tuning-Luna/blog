<script setup lang="ts">
/**
 * 分类筛选条（纯展示组件）。
 *
 * 只负责渲染与派发点击，不碰数据源：facets 由消费方从文章数据统计得出，
 * 因此篇数为 0 的分类不会出现在这里（例如尚未开写的「软件推荐」）。
 * 切换/取消的规则由消费方决定（这里只报告被点中的 slug，null 表示「全部」）。
 */
import type { CategoryFacet } from '../../data/categories'

defineProps<{
  facets: CategoryFacet[]
  /** 当前选中的分类 slug；null 表示「全部」 */
  active: string | null
  /** 全部文章数（含未归类的） */
  total: number
}>()

const emit = defineEmits<{ select: [slug: string | null] }>()
</script>

<template>
  <nav class="blog-cat-filter" aria-label="按分类筛选">
    <button
      type="button"
      class="blog-cat-filter__item"
      :class="{ 'is-active': active === null }"
      :aria-pressed="active === null"
      @click="emit('select', null)"
    >
      全部
      <span class="blog-cat-filter__count">{{ total }}</span>
    </button>

    <button
      v-for="f in facets"
      :key="f.slug"
      type="button"
      class="blog-cat-filter__item"
      :class="{ 'is-active': active === f.slug }"
      :aria-pressed="active === f.slug"
      @click="emit('select', f.slug)"
    >
      {{ f.label }}
      <span class="blog-cat-filter__count">{{ f.count }}</span>
    </button>
  </nav>
</template>
