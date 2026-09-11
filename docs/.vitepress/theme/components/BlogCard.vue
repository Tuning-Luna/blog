<script setup lang="ts">
import type { Post } from '../../data/posts-core'
import { withBase } from 'vitepress'
import { formatDate } from '../utils/format'
import M3Icon from './M3Icon.vue'

defineProps<{ post: Post }>()

/** 标签仍走列表页的就地筛选（没有标签落地页）。 */
const tagHref = (tag: string) => `/posts/?tag=${encodeURIComponent(tag)}`
</script>

<template>
  <article class="blog-card m3-card m3-card--elev1">
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

    <h3 class="blog-card__title">
      <a :href="withBase(post.url)">{{ post.title }}</a>
    </h3>

    <p v-if="post.description" class="blog-card__desc">{{ post.description }}</p>

    <div class="blog-card__chips">
      <a
        v-if="post.category"
        class="blog-card__chip blog-card__chip--category"
        :href="withBase(`/posts/${post.category.slug}/`)"
      >
        {{ post.category.label }}
      </a>
      <a
        v-for="t in post.tags"
        :key="t"
        class="blog-card__chip"
        :href="withBase(tagHref(t))"
      >
        #{{ t }}
      </a>
    </div>
  </article>
</template>
