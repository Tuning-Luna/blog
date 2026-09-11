<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import type { Post } from '../../data/posts-core'
import { profile } from '../../data/profile'
import { useScrollReveal } from '../composables/useScrollReveal'
import BlogCard from './BlogCard.vue'
import M3Button from './M3Button.vue'

useScrollReveal()

const { frontmatter } = useData()

/* 「最新 N 篇」由 config.ts 的 transformPageData 按页注入（HOME_LATEST_COUNT），
   这里只负责渲染 —— 于是首页也不必 import 整份文章索引。 */
const latest = computed<Post[]>(() => frontmatter.value.latestPosts ?? [])

/* 追光（design-system useSpotlight 的 Vue 版） */
function handleSpotlight(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`)
  el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`)
}
</script>

<template>
  <main class="site-main home-page">
    <!-- Hero：紧凑个人卡片（玻璃 + 追光），突出博客内容在下方立即可见 -->
    <section class="home-hero">
      <div class="container">
        <div
          class="home-hero__panel m3-card m3-card--elev1 spotlight"
          @mousemove="handleSpotlight"
        >
          <img
            class="home-hero__avatar"
            :src="profile.avatarUrl"
            :alt="`${profile.name} 的头像`"
            width="72"
            height="72"
            loading="lazy"
          />
          <h1 class="home-hero__name">{{ profile.name }}</h1>
          <div class="home-hero__actions">
            <M3Button :href="withBase('/posts/')">查看博客</M3Button>
            <M3Button :href="profile.siteUrl" variant="text">个人主页</M3Button>
            <M3Button :href="profile.githubUrl" variant="text">GitHub</M3Button>
          </div>
        </div>
      </div>
    </section>

    <!-- 最新文章：首页核心内容，一眼可见 -->
    <section class="m3-section home-latest">
      <div class="container">
        <header class="m3-section__header">
          <span class="m3-section__eyebrow">blog</span>
          <h2 class="m3-section__title">最新文章</h2>
        </header>
        <div class="blog-grid">
          <BlogCard v-for="p in latest" :key="p.url" :post="p" />
        </div>
        <div class="home-more">
          <M3Button :href="withBase('/posts/')" variant="text">查看全部文章</M3Button>
        </div>
      </div>
    </section>

    <!-- 联系 -->
    <!-- <ContactSection /> -->
  </main>
</template>
