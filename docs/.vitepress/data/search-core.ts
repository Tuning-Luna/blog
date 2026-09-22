/**
 * 本地搜索的**分词核心** —— 构建期（生成索引）与客户端（发起查询）必须用同一份。
 * MiniSearch 的索引 JSON 里**不包含分词器**，两边各传一份；只要不一致，
 * 查询串切出来的 token 与索引里的 token 对不上，搜索就会静默地永远没有结果。
 *
 * 为什么非要自定义：MiniSearch 默认分词只按「空白 / 标点」切
 * （`/[\n\r\p{Z}\p{P}]+/u`，见 node_modules/minisearch 的 SPACE_OR_PUNCTUATION）。
 * 这对英文正确，对中文等于不切 —— 一整句「安全回滚已推送的提交」会变成**一个** token，
 * 于是只有把整句原样敲进去才搜得到，输入「回滚」「提交」都是 0 结果，
 * 标题同理（「玻璃拟态：一份可复用的玻璃配方」是一个 token）。
 *
 * 这里的做法是**二元切分（bigram）**：把连续汉字切成相邻两字的组合，
 * 查询时同样切分，于是「回滚」能命中上面那句。
 *
 * - 单字查询（1 个汉字）在索引里没有对应的 bigram，靠 MiniSearch 的
 *   `searchOptions.prefix: true` 前缀展开命中（「搜」→「搜索」「搜寻」…），
 *   因此**不需要**额外索引单字词 —— 那会让索引体积与噪声都翻倍。
 * - 非汉字片段（英文单词、数字）保持默认行为：整段作为一个 token。
 * - 汉字范围只取表意文字（基本区 / 扩展 A / 兼容区），与本站的中文内容一致。
 *   谚文（韩语）本来就以空格分词，不需要处理；若要支持日文假名，在此扩展范围即可。
 */

/** 与 MiniSearch 默认分词器一致的分隔符：空白、换行、Unicode 标点。 */
const WORD_BOUNDARY = /[\n\r\p{Z}\p{P}]+/u

/** 单个汉字：基本区 + 扩展 A + 兼容表意文字。 */
const HAN = /[㐀-䶿一-鿿豈-﫿]/

/** 索引与查询共用的字段（改这里等于同时改构建期与客户端）。 */
export const SEARCH_FIELDS = ['title', 'titles', 'text'] as const

/**
 * 索引里**实际存储**的字段。必须包含 `text`，否则搜索结果拿不到正文摘要
 * （MiniSearch 默认只存 `title` / `titles`）。
 */
export const SEARCH_STORE_FIELDS = ['title', 'titles', 'text'] as const

/**
 * 中文友好的分词器：汉字按二元切分，其余按默认规则切分。
 *
 * 产出示例：`'用 CSS 实现玻璃拟态'` → `['用', 'css', '实现', '现玻', '玻璃', '璃拟', '拟态']`
 * （`用` 是单字片段，保留原样；`css` 是英文片段，整段保留）
 */
export function tokenizeCJK(text: string): string[] {
  const tokens: string[] = []

  for (const chunk of text.split(WORD_BOUNDARY)) {
    if (!chunk) continue

    // 把片段进一步切成「汉字连续段」与「非汉字连续段」，分别处理。
    let run = ''
    let runIsHan = false

    const flush = () => {
      if (!run) return
      if (!runIsHan) {
        tokens.push(run)
      } else if (run.length === 1) {
        // 单个汉字：索引时保留，查询侧靠前缀展开也能命中更长的词。
        tokens.push(run)
      } else {
        for (let i = 0; i < run.length - 1; i++) tokens.push(run.slice(i, i + 2))
      }
      run = ''
    }

    // 用 for...of 按码位迭代，避免把代理对拆成两半。
    for (const char of chunk) {
      const isHan = HAN.test(char)
      if (run && isHan !== runIsHan) flush()
      runIsHan = isHan
      run += char
    }
    flush()
  }

  return tokens
}
