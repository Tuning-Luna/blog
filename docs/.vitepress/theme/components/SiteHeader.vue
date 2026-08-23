<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import LocalSearch from './LocalSearch.vue'
import M3Icon from './M3Icon.vue'
import ThemeToggle from './ThemeToggle.vue'
import { profile } from '../../data/profile'

const { site } = useData()
const route = useRoute()

const nav = computed(() => site.value.themeConfig.nav ?? [])

// route.path 含部署 base（如 /blog/posts/git-rebase），而 nav link 是「逻辑路由」路径，
// 需用 withBase 对齐后再比较。
const isActive = (link: string): boolean => {
  const path = route.path
  const target = withBase(link)
  if (link === '/') return path === target || path.startsWith(withBase('/index.html'))
  if (path === target) return true
  // 前缀匹配：/posts/ 覆盖 /posts/xxx
  return path.startsWith(target.replace(/\/$/, ''))
}

// 顶栏 GitHub 图标指向本站源码仓库
const githubUrl = computed(() => profile.siteGithubUrl)
</script>

<template>
  <header class="appbar">
    <div class="container appbar__inner">
      <a class="appbar__brand" :href="withBase('/')" aria-label="回到首页">
        <span class="appbar__avatar appbar__avatar--text" aria-hidden="true">TB</span>
        <span class="appbar__name">{{ site.title }}</span>
      </a>

      <nav class="appbar__nav" aria-label="主导航">
        <a
          v-for="item in nav"
          :key="item.link"
          :href="withBase(item.link)"
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
