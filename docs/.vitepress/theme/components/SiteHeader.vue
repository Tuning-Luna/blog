<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import LocalSearch from './LocalSearch.vue'
import M3Icon from './M3Icon.vue'
import ThemeToggle from './ThemeToggle.vue'

const { site } = useData()
const route = useRoute()

const nav = computed(() => site.value.themeConfig.nav ?? [])

const isActive = (link: string): boolean => {
  const path = route.path
  if (link === '/') return path === '/' || path.startsWith('/index.html')
  if (path === link) return true
  // 前缀匹配：/blog/ 覆盖 /blog/posts/xxx
  return path.startsWith(link.replace(/\/$/, ''))
}

const githubUrl = computed(() => site.value.themeConfig.siteMeta?.github ?? '#')
</script>

<template>
  <header class="appbar">
    <div class="container appbar__inner">
      <a class="appbar__brand" href="/" aria-label="回到首页">
        <span class="appbar__avatar appbar__avatar--text" aria-hidden="true">TL</span>
        <span class="appbar__name">{{ site.title }}</span>
      </a>

      <nav class="appbar__nav" aria-label="主导航">
        <a
          v-for="item in nav"
          :key="item.link"
          :href="item.link"
          class="appbar__link"
          :class="{ 'is-active': isActive(item.link) }"
          :aria-current="isActive(item.link) ? 'page' : undefined"
        >
          {{ item.text }}
        </a>
      </nav>

      <div class="appbar__actions">
        <LocalSearch />
        <ThemeToggle />
        <a
          class="appbar__social"
          :href="githubUrl"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="GitHub"
        >
          <M3Icon name="github" :size="20" />
        </a>
      </div>
    </div>
  </header>
</template>
