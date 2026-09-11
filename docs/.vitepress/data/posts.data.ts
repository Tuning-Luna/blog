/**
 * 列表页 / 首页的数据源。
 *
 * 解析规则（过滤 draft、推导分类、排序、阅读时长）全在 `posts-core.ts`，
 * 这里只是把它接到 VitePress 的 `createContentLoader` 上 —— 同一套规则也被
 * `config.ts` 的 `transformPageData` 与 `buildEnd` 复用，不要在这里另写一份。
 *
 * 注意：加载结果会被内联进客户端 bundle（官方原话："the loaded data will be inlined
 * as JSON in the client bundle, so we need to be cautious about its size"），
 * 所以只导出真正要用的字段 —— 刻意不返回 `src`。
 */
import { createContentLoader } from 'vitepress'
import {
  POSTS_GLOB,
  POSTS_LOADER_OPTIONS,
  transformPosts,
  type Post,
} from './posts-core'

declare const data: Post[]
export { data }
export type { Post }

export default createContentLoader<Post[]>(POSTS_GLOB, {
  ...POSTS_LOADER_OPTIONS,
  transform: transformPosts,
})
