/**
 * 文章分类注册表（两级）。
 *
 * 分类的唯一事实来源是「文件夹」：`docs/posts/<一级>/<二级>/xxx.md` 属于该一级下的二级分类，
 * `docs/posts/<一级>/xxx.md` 则只属于一级。本文件只负责「展示名」与「展示顺序」，
 * 不参与匹配（匹配认文件夹名本身）。
 *
 * 新增分类：在 `docs/posts/` 下新建文件夹，并在这里补一条登记即可。
 * 未登记的文件夹不会导致构建失败 —— `categoryOf()` / `subcategoryOf()` 会回退成 slug 本身。
 */
export interface Category {
  /** 文件夹名，同时用作 URL 片段与列表页查询参数的值（ASCII，避免百分号编码） */
  slug: string
  /** 展示名 */
  label: string
  /** 二级分类；只有需要再分的分类才写 */
  children?: Category[]
}

/** 分类 + 该分类下的文章数，供列表页筛选面板消费。 */
export interface CategoryFacet extends Category {
  count: number
  children?: CategoryFacet[]
}

/** 数组顺序即列表页筛选面板中的展示顺序。 */
export const CATEGORIES: Category[] = [
  { slug: 'frontend', label: '前端' },
  { slug: 'backend', label: '后端' },
  { slug: 'tools', label: '工具' },
  { slug: 'interview', label: '笔试面试' },
  { slug: 'essay', label: '杂谈' },
  {
    slug: 'software',
    label: '软件推荐',
    children: [
      { slug: 'windows', label: 'Windows' },
      { slug: 'android', label: 'Android' },
    ],
  },
]

const BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]))

/**
 * 一级文件夹名 → 分类。未登记的文件夹回退为 slug 本身，
 * 这样「先建文件夹、后补登记」不会让构建挂掉，只是展示名暂时是英文。
 */
export function categoryOf(slug: string | null): Category | null {
  if (!slug) return null
  return BY_SLUG.get(slug) ?? { slug, label: slug }
}

/** 二级文件夹名 → 分类（在父级的 children 里找），同样带 slug 回退。 */
export function subcategoryOf(
  parentSlug: string | null,
  slug: string | null,
): Category | null {
  if (!slug) return null
  const parent = categoryOf(parentSlug)
  return (
    parent?.children?.find((c) => c.slug === slug) ?? { slug, label: slug }
  )
}
