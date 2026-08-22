/**
 * Regenerates the GitHub account info snapshot used by the blog:
 *   docs/.vitepress/data/github-info.json
 *
 * Run: npm run github:info
 *
 * Auth: GH_TOKEN or GITHUB_TOKEN env var if set (the scheduled GitHub Actions
 * workflow calls it this way), otherwise the authenticated gh CLI.
 * The site itself stays backend-free: this is a build-time generator only,
 * invoked inside the deploy workflow before `npm run build`.
 *
 * Everything fetched here is public profile data — readable by CI's
 * GITHUB_TOKEN (NEVER call `/user`, which returns the authenticated user's
 * private view and is 403 for integration tokens).
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const LOGIN = process.env.GH_LOGIN ?? 'Tuning-Luna'
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'docs/.vitepress/data/github-info.json')
const API = 'https://api.github.com'

/** 元仓库（profile README 与主页本身）不进入「项目」列表。 */
const EXCLUDE_REPOS = new Set(['Tuning-Luna', 'Tuning-Luna.github.io'])
/** 项目列表展示数量。 */
const TOP_REPOS = 8

function resolveToken() {
  const fromEnv = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN
  if (fromEnv) return fromEnv
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim()
  } catch {
    throw new Error('no token: set GH_TOKEN/GITHUB_TOKEN or run `gh auth login`.')
  }
}

const token = resolveToken()

async function api(path, init) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'tuningluna-blog-github-info',
      ...init?.headers,
    },
  })
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} on ${path}: ${await res.text()}`)
  }
  return res.json()
}

// 公开 profile（followers / public_repos）。
const user = await api(`/users/${LOGIN}`)

// 分页拉取 owner 仓库（含私有），求非 fork 的总 star，并收集按 star 排序的项目。
const repos = []
let totalStars = 0
for (let page = 1; ; page++) {
  const pageRepos = await api(
    `/users/${LOGIN}/repos?per_page=100&page=${page}&type=owner`,
  )
  for (const repo of pageRepos) {
    if (repo.fork) continue
    totalStars += repo.stargazers_count
    if (!EXCLUDE_REPOS.has(repo.name)) {
      repos.push({
        name: repo.name,
        description: repo.description ?? '',
        htmlUrl: repo.html_url,
        homepage: repo.homepage ?? '',
        language: repo.language ?? '',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        archived: repo.archived,
      })
    }
  }
  if (pageRepos.length < 100) break
}

const topRepos = repos
  .sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name))
  .slice(0, TOP_REPOS)

const snapshot = {
  retrievedAt: new Date().toLocaleDateString('en-CA'),
  user: {
    login: user.login,
    name: user.name ?? user.login,
    bio: user.bio ?? '',
    htmlUrl: user.html_url,
    avatarUrl: `https://github.com/${LOGIN}.png?size=256`,
    followers: user.followers,
    publicRepos: user.public_repos,
    totalStars,
  },
  topRepos,
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, `${JSON.stringify(snapshot, null, 2)}\n`)

console.log(
  `github-info.json: ${totalStars} stars, ${user.public_repos} repos, ${user.followers} followers, ${topRepos.length} top repos`,
)
