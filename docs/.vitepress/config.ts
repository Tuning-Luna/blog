import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'TuningLuna Blog',
  description: 'TuningLuna 的个人博客 — 前端、开源与 AI Agent 随笔',

  appearance: false,

  head: [],

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },
})
