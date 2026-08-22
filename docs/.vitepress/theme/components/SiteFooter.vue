<script setup lang="ts">
import { useData } from 'vitepress'

const { site } = useData()
const year = new Date().getFullYear()
const author = 'TuningLuna'
</script>

<template>
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <p>© {{ year }} {{ author }}</p>
      <p class="site-footer__meta">
        Powered by VitePress · MD3 × Glassmorphism
      </p>
    </div>
  </footer>
</template>
