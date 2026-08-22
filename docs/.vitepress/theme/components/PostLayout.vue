<script setup lang="ts">
import { Content } from 'vitepress'
</script>

<!-- 文章页容器（Phase 4 完善：元信息 / TOC / 前后篇导航） -->
<template>
  <main class="site-main">
    <div class="container post-layout">
      <div class="vp-doc">
        <Content />
      </div>
    </div>
  </main>
</template>
