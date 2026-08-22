<script setup lang="ts">
import { computed } from 'vue'
import { Content, useData } from 'vitepress'
import HomeLayout from './components/HomeLayout.vue'
import PostLayout from './components/PostLayout.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'

const { frontmatter } = useData()

// 页面布局由 frontmatter.layout 决定：
//   home → 个人主页（HomeLayout）
//   post → 文章页（PostLayout，含元信息 + TOC + 前后篇）
//   其他 → 通用文档页
const layout = computed(() => frontmatter.value.layout ?? 'doc')
</script>

<template>
  <div class="site-bg" aria-hidden="true" />
  <SiteHeader />
  <HomeLayout v-if="layout === 'home'" />
  <PostLayout v-else-if="layout === 'post'" />
  <main v-else class="site-main doc-layout">
    <div class="container">
      <div class="vp-doc">
        <Content />
      </div>
    </div>
  </main>
  <SiteFooter />
</template>
