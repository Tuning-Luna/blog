/**
 * 技术栈（来源：个人主页 src/data/tech.ts，据 GitHub profile README 的
 * skillicons 列表并交叉核对仓库 topics/描述）。
 */
export interface TechGroup {
  id: string
  title: string
  items: string[]
}

export const techGroups: TechGroup[] = [
  {
    id: 'languages',
    title: '编程语言',
    items: ['C', 'C++', 'Java', 'Python', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'SQL'],
  },
  {
    id: 'frontend',
    title: '前端',
    items: ['Vue', 'React', 'Next.js', 'Vite', 'UniApp', 'Element Plus'],
  },
  {
    id: 'backend',
    title: '后端',
    items: ['Node.js', 'Express', 'NestJS', 'Spring Boot', 'FastAPI'],
  },
  {
    id: 'databases',
    title: '数据与数据库',
    items: ['MySQL', 'SQLite', 'Redis'],
  },
  {
    id: 'tools',
    title: '工具与运维',
    items: [
      'Git',
      'Linux',
      'Debian',
      'Nginx',
      'Docker',
      'Electron',
      'Tauri',
      'Bun',
      'npm',
      'PowerShell',
      'Neovim',
      'Markdown',
    ],
  },
]
