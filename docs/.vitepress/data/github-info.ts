/**
 * GitHub 账户信息快照的类型化加载。
 * 数据文件 docs/.vitepress/data/github-info.json 由
 * `npm run github:info`（scripts/fetch-github-info.mjs）生成；
 * deploy workflow 每天调度刷新并在构建前提交，站点本身纯静态。
 */
import raw from './github-info.json'

export interface GitHubRepo {
  name: string
  description: string
  htmlUrl: string
  homepage: string
  language: string
  stars: number
  forks: number
  archived: boolean
}

export interface GitHubInfo {
  /** 快照生成日期（YYYY-MM-DD）。 */
  retrievedAt: string
  user: {
    login: string
    name: string
    bio: string
    htmlUrl: string
    avatarUrl: string
    followers: number
    publicRepos: number
    totalStars: number
  }
  topRepos: GitHubRepo[]
}

export const githubInfo = raw as GitHubInfo
