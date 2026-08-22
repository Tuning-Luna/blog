<script setup lang="ts">
/**
 * 区块包裹器：eyebrow（mono 小标）+ 标题（display 字体）+ 可选副标题。
 * 滚动显现由 useScrollReveal 处理（.m3-section.pre-reveal）。见 design-system。
 */
withDefaults(
  defineProps<{ id?: string; eyebrow?: string; title?: string; subtitle?: string }>(),
  {},
)
</script>

<template>
  <section :id="id" class="m3-section">
    <div class="container">
      <header class="m3-section__header">
        <span v-if="eyebrow" class="m3-section__eyebrow">{{ eyebrow }}</span>
        <h2 v-if="title" class="m3-section__title">{{ title }}</h2>
        <p v-if="subtitle" class="m3-section__subtitle">{{ subtitle }}</p>
      </header>
      <slot />
    </div>
  </section>
</template>
