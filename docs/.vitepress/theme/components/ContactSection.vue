<script setup lang="ts">
import type { IconName } from '../types'
import { profile } from '../../data/profile'
import M3Icon from './M3Icon.vue'

interface ContactLink {
  id: string
  href: string
  icon: IconName
  label: string
  desc: string
}

/** 联系方式列表（来源：个人主页 src/data/profile.ts + i18n/zh.ts）。 */
const LINKS: ContactLink[] = [
  { id: 'site', href: profile.siteUrl, icon: 'globe', label: '个人主页', desc: 'tuning-luna.github.io' },
  { id: 'github', href: profile.githubUrl, icon: 'github', label: 'GitHub', desc: '开源与代码' },
  { id: 'gmail', href: profile.gmailUrl, icon: 'gmail', label: 'Gmail', desc: '给我发邮件' },
  { id: 'discord', href: profile.discordUrl, icon: 'discord', label: 'Discord', desc: '和我聊天' },
  { id: 'telegram', href: profile.telegramUrl, icon: 'telegram', label: 'Telegram', desc: '私聊我' },
  { id: 'spotify', href: profile.spotifyUrl, icon: 'spotify', label: 'Spotify', desc: '我的歌单' },
  { id: 'bilibili', href: profile.bilibiliUrl, icon: 'bilibili', label: 'Bilibili', desc: '我的视频' },
]

/** 追光（design-system useSpotlight 的 Vue 版）。 */
function handleSpotlight(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`)
  el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`)
}
</script>

<template>
  <section class="m3-section contact-section">
    <div class="container">
      <header class="m3-section__header">
        <span class="m3-section__eyebrow">contact</span>
        <h2 class="m3-section__title">找到我</h2>
        <p class="m3-section__subtitle">在互联网上找到我。</p>
      </header>
      <div class="contact__links">
        <a
          v-for="link in LINKS"
          :key="link.id"
          class="contact__card spotlight"
          :href="link.href"
          target="_blank"
          rel="noreferrer noopener"
          @mousemove="handleSpotlight"
        >
          <M3Icon :name="link.icon" :size="28" />
          <span class="contact__card-label">{{ link.label }}</span>
          <span class="contact__card-desc">{{ link.desc }}</span>
        </a>
      </div>
    </div>
  </section>
</template>
