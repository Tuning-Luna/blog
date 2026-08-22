<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../../data/posts.data'
import { profile } from '../../data/profile'
import { techGroups } from '../../data/tech'
import { formatDate } from '../utils/format'
import { useScrollReveal } from '../composables/useScrollReveal'
import ContactSection from './ContactSection.vue'
import M3Button from './M3Button.vue'
import M3Chip from './M3Chip.vue'
import M3Section from './M3Section.vue'

useScrollReveal()

/* 博客真实数据 */
const latest = computed(() => posts.slice(0, 3))

/* 自我介绍（来源：个人主页 i18n/zh.ts about.*） */
const aboutLines = [
  '我是 Tuning-Luna，合肥工业大学（HFUT）宣城校区计算机科学（CS）专业的学生。',
  '喜欢折腾技术、动手写代码：把课程设计、实验与学习资料整理成开源项目，也写爬虫、逆向与全栈应用。信奉「Always Learning, Always Building」——代码是最接近魔法的东西。',
]
const focus = ['Web 全栈', '爬虫与逆向', '机器学习', '开源与学习资料']

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
    <!-- Hero：个人卡片（玻璃 + 追光） -->
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
            width="96"
            height="96"
            loading="lazy"
          />
          <p class="home-hero__eyebrow">Hello, I'm</p>
          <h1 class="home-hero__name">{{ profile.name }}</h1>
          <p class="home-hero__role">计算机科学（CS）学生 · 开源爱好者</p>
          <p class="home-hero__intro">{{ aboutLines[0] }}</p>
          <div class="home-hero__focus">
            <M3Chip v-for="f in focus" :key="f" :label="f" />
          </div>
          <div class="home-hero__actions">
            <M3Button href="/blog/">查看博客</M3Button>
            <M3Button :href="profile.githubUrl" variant="text">GitHub</M3Button>
          </div>
        </div>
      </div>
    </section>

    <!-- 关于 -->
    <M3Section
      eyebrow="about"
      title="关于我"
      subtitle="Always Learning, Always Building."
    >
      <div class="home-about">
        <p v-for="(line, i) in aboutLines" :key="i" class="home-about__p">
          {{ line }}
        </p>
      </div>
    </M3Section>

    <!-- 最新文章 -->
    <M3Section eyebrow="blog" title="最新文章" subtitle="近期写的一些笔记。">
      <div class="home-posts">
        <a
          v-for="p in latest"
          :key="p.url"
          :href="p.url"
          class="home-post m3-card m3-card--elev1"
        >
          <time :datetime="p.date" class="home-post__date">
            {{ formatDate(p.date) }}
          </time>
          <span class="home-post__title">{{ p.title }}</span>
          <span v-if="p.description" class="home-post__desc">
            {{ p.description }}
          </span>
        </a>
      </div>
      <div class="home-more">
        <M3Button href="/blog/" variant="text">查看全部文章</M3Button>
      </div>
    </M3Section>

    <!-- 技术栈 -->
    <M3Section eyebrow="skills" title="技术栈" subtitle="来自 GitHub profile README 的技术清单。">
      <div v-for="group in techGroups" :key="group.id" class="home-tech-group">
        <h3 class="home-tech-group__title">{{ group.title }}</h3>
        <div class="home-skills">
          <M3Chip v-for="s in group.items" :key="s" :label="s" />
        </div>
      </div>
    </M3Section>

    <!-- 联系 -->
    <ContactSection />
  </main>
</template>
