<script setup lang="ts">
import { computed } from 'vue'
import { Content, useData } from 'vitepress'
import BlogList from './components/BlogList.vue'
import HomeLayout from './components/HomeLayout.vue'
import PostLayout from './components/PostLayout.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'

const { frontmatter, page, site } = useData()

// 站点背景图：docs/public/JSA-279k.png（暗色纹理照片）。
// 用运行时 base 拼 URL，适配 GitHub Pages 项目页 /<repo>/ 与用户页 /。
const siteBgImage = `url(${site.value.base}JSA-279k.png)`

// 页面布局优先级：
//   1. frontmatter.layout 显式指定（home → 个人主页；blog → 博客列表；post → 文章页）
//   2. 自动识别博客文章路径（posts/*.md）→ 文章页（无需写 layout: post）
//   3. 其余 → 通用文档页
// 列表页必须显式写 layout: blog，否则会被第 2 条判成文章页。
const layout = computed(() => {
  const fm = frontmatter.value.layout
  if (fm) return fm
  if (page.value.relativePath.startsWith('posts/')) return 'post'
  return 'doc'
})
</script>

<template>
  <div class="site-bg" aria-hidden="true" :style="{ '--site-bg-image': siteBgImage }" />
  <!-- .site-shell 撑满一屏，.site-main 用 flex:1 吃掉剩余高度：
       内容不足一屏时页脚也会贴住视口底部（详见 styles/layout.css）。
       .site-bg 是 position:fixed，不参与这个 flex 布局，所以留在 shell 外面。 -->
  <div class="site-shell">
    <SiteHeader />
    <HomeLayout v-if="layout === 'home'" />
    <BlogList v-else-if="layout === 'blog'" />
    <PostLayout v-else-if="layout === 'post'" />
    <main v-else class="site-main doc-layout">
      <div class="container">
        <div class="vp-doc">
          <Content />
        </div>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>
