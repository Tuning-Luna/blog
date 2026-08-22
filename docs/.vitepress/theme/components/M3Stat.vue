<script setup lang="ts">
import type { IconName } from '../types'
import M3Icon from './M3Icon.vue'

/** 数值统计：mono 大数字 + 小标签，可选 primary 色前导填充图标。见 design-system。 */
defineProps<{ value: string | number; label: string; icon?: IconName }>()
</script>

<template>
  <div class="m3-stat">
    <M3Icon v-if="icon" class="m3-stat__icon" :name="icon" :size="20" />
    <span class="m3-stat__value">{{ value }}</span>
    <span class="m3-stat__label">{{ label }}</span>
  </div>
</template>
