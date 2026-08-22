<script setup lang="ts">
/**
 * M3 玻璃卡片容器（不含排版）。elevation 1|2|3，hover 抬升一级。
 * 见 design-system docs/components.md。
 */
withDefaults(defineProps<{ elevation?: 1 | 2 | 3; tag?: string }>(), {
  elevation: 1,
  tag: 'div',
})
</script>

<template>
  <component :is="tag" class="m3-card" :class="`m3-card--elev${elevation}`">
    <slot />
  </component>
</template>
