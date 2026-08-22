<script setup lang="ts">
import type { Header } from 'vitepress'

/** 递归渲染目录树（headers 来自 VitePress useData）。 */
defineProps<{ headers: Header[]; activeId?: string }>()
</script>

<template>
  <ul class="toc-list">
    <li
      v-for="h in headers"
      :key="h.slug"
      class="toc-list__item"
      :class="`toc-list__item--level-${h.level}`"
    >
      <a
        :href="`#${h.slug}`"
        class="toc-list__link"
        :class="{ 'toc-list__link--active': activeId === h.slug }"
      >
        {{ h.title }}
      </a>
      <PostToc
        v-if="h.children && h.children.length"
        :headers="h.children"
        :active-id="activeId"
      />
    </li>
  </ul>
</template>
