<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../../data/posts.data'
import { profile } from '../../data/profile'
import { useScrollReveal } from '../composables/useScrollReveal'
import BlogCard from './BlogCard.vue'
import ContactSection from './ContactSection.vue'
import M3Button from './M3Button.vue'

useScrollReveal()

/* 首页展示的文章数 */
const LATEST_COUNT = 6
const latest = computed(() => posts.slice(0, LATEST_COUNT))

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
          <p class="home-hero__role">计算机科学（CS）学生 · 开源爱好者</p>
          <p class="home-hero__intro">记录前端、开源与 AI Agent 的思考。</p>
          <div class="home-hero__actions">
            <M3Button href="/blog/">查看博客</M3Button>
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
          <M3Button href="/blog/" variant="text">查看全部文章</M3Button>
        </div>
      </div>
    </section>

    <!-- 联系 -->
    <ContactSection />
  </main>
</template>
