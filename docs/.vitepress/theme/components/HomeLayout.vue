<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../../data/posts.data'
import { formatDate } from '../utils/format'
import { useScrollReveal } from '../composables/useScrollReveal'
import M3Button from './M3Button.vue'
import M3Chip from './M3Chip.vue'
import M3Section from './M3Section.vue'
import M3Stat from './M3Stat.vue'

useScrollReveal()

/* 真实数据：文章 / 分类 / 标签数（不编造） */
const postCount = computed(() => posts.length)
const categoryCount = computed(
  () => new Set(posts.flatMap((p) => p.categories)).size,
)
const tagCount = computed(() => new Set(posts.flatMap((p) => p.tags)).size)
const latest = computed(() => posts.slice(0, 3))

/* 真实项目：本博客仓库（占位文本标注 TODO） */
const projectPlaceholder = {
  title: 'tuningluna-blog',
  desc: '本站源码：VitePress + MD3 × Glassmorphism 的个人博客。',
  chips: ['VitePress', 'Vue 3', 'TypeScript', 'GitHub Actions'],
}

/* 占位技术栈：来自本项目实际使用的技术，可自行增删 */
const skillPlaceholders = [
  'VitePress',
  'Vue 3',
  'TypeScript',
  'CSS Design Tokens',
  'MD3',
  'Glassmorphism',
  'npm',
  'GitHub Actions',
]

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
          <div class="home-hero__avatar" aria-hidden="true">TL</div>
          <p class="home-hero__eyebrow">Hello, I'm</p>
          <h1 class="home-hero__name">TuningLuna</h1>
          <p class="home-hero__role">前端开发者 · 开源爱好者</p>
          <p class="home-hero__intro">
            TODO 占位：在这里写一句关于自己的介绍（不编造，由本人补充）。
          </p>
          <div class="home-hero__actions">
            <M3Button href="/blog/">查看博客</M3Button>
            <M3Button href="/projects/" variant="tonal">项目</M3Button>
          </div>
        </div>
      </div>
    </section>

    <!-- 统计（真实数据） -->
    <M3Section
      eyebrow="stats"
      title="本站一览"
      subtitle="统计来自本站已发布的文章。"
    >
      <div class="home-stats">
        <M3Stat icon="commit" :value="postCount" label="文章" />
        <M3Stat icon="folder" :value="categoryCount" label="分类" />
        <M3Stat icon="star" :value="tagCount" label="标签" />
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

    <!-- 项目 -->
    <M3Section
      eyebrow="projects"
      title="项目"
      subtitle="TODO 占位：补充更多真实项目。"
    >
      <div class="home-projects">
        <article class="home-project m3-card m3-card--elev1">
          <h3 class="home-project__title">{{ projectPlaceholder.title }}</h3>
          <p class="home-project__desc">{{ projectPlaceholder.desc }}</p>
          <div class="home-project__chips">
            <M3Chip
              v-for="c in projectPlaceholder.chips"
              :key="c"
              :label="c"
            />
          </div>
        </article>
        <article class="home-project m3-card m3-card--elev1 home-project--placeholder">
          <h3 class="home-project__title">TODO</h3>
          <p class="home-project__desc">在这里添加你的下一个项目。</p>
        </article>
      </div>
    </M3Section>

    <!-- 技术栈 -->
    <M3Section
      eyebrow="skills"
      title="技术栈"
      subtitle="来自本项目的实际技术栈，占位示例，可自行增删。"
    >
      <div class="home-skills">
        <M3Chip v-for="s in skillPlaceholders" :key="s" :label="s" />
      </div>
    </M3Section>
  </main>
</template>
