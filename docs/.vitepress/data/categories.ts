/**
 * 文章分类注册表。
 *
 * 分类的唯一事实来源是「文件夹」：`docs/posts/<文件夹>/xxx.md` 属于 `<文件夹>` 分类。
 * 本文件只负责「展示名」与「展示顺序」，不参与匹配（匹配认文件夹名本身）。
 *
 * 新增分类：在 `docs/posts/` 下新建文件夹，并在这里补一条登记即可。
 * 未登记的文件夹不会导致构建失败 —— `categoryOf()` 会回退成 slug 本身作展示名。
 */
export interface Category {
  /** 文件夹名，同时用作 URL 片段与列表页 `?cat=` 的值（ASCII，避免百分号编码） */
  slug: string
  /** 展示名 */
  label: string
}

/** 分类 + 该分类下的文章数，供列表页筛选条消费。 */
export interface CategoryFacet extends Category {
  count: number
}

/** 数组顺序即列表页筛选条中的展示顺序。 */
export const CATEGORIES: Category[] = [
  { slug: 'frontend', label: '前端' },
  { slug: 'backend', label: '后端' },
  { slug: 'tools', label: '工具' },
  { slug: 'interview', label: '笔试面试' },
  { slug: 'essay', label: '杂谈' },
  { slug: 'software', label: '软件推荐' },
]

const BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]))

/**
 * 文件夹名 → 分类。未登记的文件夹回退为 slug 本身，
 * 这样「先建文件夹、后补登记」不会让构建挂掉，只是展示名暂时是英文。
 */
export function categoryOf(slug: string | null): Category | null {
  if (!slug) return null
  return BY_SLUG.get(slug) ?? { slug, label: slug }
}
