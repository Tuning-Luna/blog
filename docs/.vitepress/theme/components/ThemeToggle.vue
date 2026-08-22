<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTheme } from '../composables/useTheme'
import type { IconName } from '../types'
import M3IconButton from './M3IconButton.vue'

const { mode, cycle } = useTheme()

// SSR / hydration 首帧渲染中性图标，避免与服务器输出不一致；
// 挂载后再显示真实模式对应的图标。
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})

const icon = computed<IconName>(() => {
  if (!mounted.value) return 'monitor'
  return mode.value === 'dark' ? 'moon' : mode.value === 'light' ? 'sun' : 'monitor'
})

const label = computed(() =>
  mounted.value ? `主题: ${mode.value}` : '切换主题',
)
</script>

<template>
  <M3IconButton :icon="icon" :label="label" @click="cycle" />
</template>
