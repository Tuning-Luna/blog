/// <reference types="vitepress/client" />

/**
 * VitePress 官方本地搜索的虚拟模块类型（custom theme 下自建 UI 消费）。
 * 默认导出：locale → () => import('@localSearchIndex<locale>')，每个 chunk 的
 * default 是 MiniSearch 索引的 JSON 字符串。
 */
declare module '@localSearchIndex' {
  interface SearchIndexChunk {
    default: string
  }
  const localSearchIndex: Record<string, () => Promise<SearchIndexChunk>>
  export default localSearchIndex
}
