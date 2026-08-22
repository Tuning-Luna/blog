<script setup lang="ts">
/** M3 assist chip（span，非交互）。见 design-system docs/components.md。 */
defineProps<{ label?: string }>()
</script>

<template>
  <span class="m3-chip"><slot>{{ label }}</slot></span>
</template>
