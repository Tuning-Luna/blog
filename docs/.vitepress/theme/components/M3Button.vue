<script setup lang="ts">
import { computed } from 'vue'
import M3Icon from './M3Icon.vue'

/**
 * M3 按钮：filled / tonal / text。传 href 渲染 <a>，否则 <button>；
 * http(s)/mailto/tel 外链自动 target=_blank + external 图标。
 * 见 design-system docs/components.md。
 */
const props = withDefaults(
  defineProps<{ variant?: 'filled' | 'tonal' | 'text'; href?: string }>(),
  { variant: 'filled' },
)

const isExternal = computed(() =>
  props.href ? /^(https?:|mailto:|tel:)/.test(props.href) : false,
)
const variantClass = computed(() => `m3-button--${props.variant}`)
</script>

<template>
  <a
    v-if="href"
    :href="href"
    :class="['m3-button', variantClass]"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noreferrer noopener' : undefined"
  >
    <span class="m3-button__label"><slot /></span>
    <span v-if="isExternal" class="m3-button__icon">
      <M3Icon name="external" :size="14" />
    </span>
  </a>
  <button v-else type="button" :class="['m3-button', variantClass]">
    <span class="m3-button__label"><slot /></span>
  </button>
</template>
