<script setup lang="ts">
import { computed } from 'vue'
import { Content, useData } from 'vitepress'
import HomeLayout from './components/HomeLayout.vue'
import PostLayout from './components/PostLayout.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'

const { frontmatter, page } = useData()

// 页面布局优先级：
//   1. frontmatter.layout 显式指定（home → 个人主页；post → 文章页）
//   2. 自动识别博客文章路径（blog/posts/*.md）→ 文章页（无需写 layout: post）
//   3. 其余 → 通用文档页
const layout = computed(() => {
  const fm = frontmatter.value.layout
  if (fm) return fm
  if (page.value.relativePath.startsWith('blog/posts/')) return 'post'
  return 'doc'
})
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
