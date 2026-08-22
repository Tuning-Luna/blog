<script setup lang="ts">
import { githubInfo } from '../../data/github-info'
import M3Chip from './M3Chip.vue'
import M3Icon from './M3Icon.vue'

defineProps<{ limit?: number }>()
</script>

<template>
  <div class="home-projects">
    <a
      v-for="repo in githubInfo.topRepos.slice(0, limit ?? githubInfo.topRepos.length)"
      :key="repo.name"
      :href="repo.homepage || repo.htmlUrl"
      target="_blank"
      rel="noreferrer noopener"
      class="home-project m3-card m3-card--elev1"
    >
      <span class="home-project__title">{{ repo.name }}</span>
      <span class="home-project__desc">{{ repo.description }}</span>
      <div class="home-project__chips">
        <M3Chip v-if="repo.language" :label="repo.language" />
        <span v-if="repo.stars" class="home-project__stars">
          <M3Icon name="star" :size="14" /> {{ repo.stars }}
        </span>
        <span v-if="repo.archived" class="home-project__archived">已归档</span>
      </div>
    </a>
  </div>
</template>
