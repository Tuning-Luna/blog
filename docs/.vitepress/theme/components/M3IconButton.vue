<script setup lang="ts">
import type { IconName } from '../types'
import M3Icon from './M3Icon.vue'

/** M3 标准 40px 图标按钮。label 必填（aria-label）。见 design-system docs/components.md。 */
withDefaults(defineProps<{ icon: IconName; label: string; size?: number }>(), {
  size: 20,
})
defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button
    type="button"
    class="m3-icon-button"
    :aria-label="label"
    @click="$emit('click', $event)"
  >
    <M3Icon :name="icon" :size="size" />
  </button>
</template>
