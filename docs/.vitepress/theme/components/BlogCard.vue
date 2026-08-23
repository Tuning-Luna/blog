<script setup lang="ts">
import type { Post } from '../../data/posts.data'
import { withBase } from 'vitepress'
import { formatDate } from '../utils/format'
import M3Icon from './M3Icon.vue'

withDefaults(defineProps<{ post: Post; big?: boolean }>(), { big: false })

const queryFor = (key: 'cat' | 'tag', value: string) =>
  `/posts/?${key}=${encodeURIComponent(value)}`
</script>

<template>
  <article
    class="blog-card m3-card m3-card--elev1"
    :class="{ 'blog-card--big': big }"
  >
    <div class="blog-card__meta">
      <span class="blog-card__meta-item">
        <M3Icon name="calendar" :size="14" />
        <time :datetime="post.date">{{ formatDate(post.date) }}</time>
      </span>
      <span class="blog-card__meta-item">
        <M3Icon name="clock" :size="14" />
        {{ post.readingTime }} 分钟
      </span>
    </div>

    <h3 class="blog-card__title" :class="{ 'blog-card__title--big': big }">
      <a :href="withBase(post.url)">{{ post.title }}</a>
    </h3>

    <p v-if="post.description" class="blog-card__desc">{{ post.description }}</p>
    <!-- 精选卡展示富文本摘要 -->
    <div
      v-else-if="big && post.excerpt"
      class="blog-card__excerpt"
      v-html="post.excerpt"
    />

    <div class="blog-card__chips">
      <a
        v-for="c in post.categories"
        :key="c"
        class="blog-card__chip blog-card__chip--category"
        :href="withBase(queryFor('cat', c))"
      >
        {{ c }}
      </a>
      <a
        v-for="t in post.tags"
        :key="t"
        class="blog-card__chip"
        :href="withBase(queryFor('tag', t))"
      >
        #{{ t }}
      </a>
    </div>
  </article>
</template>
