/**
 * 把 ISO 日期格式化为 YYYY-MM-DD。
 *
 * 必须用 getUTC* 而不是 getFullYear/getMonth/getDate —— 上游（`posts-core.ts` 的
 * `new Date(fm.date).toISOString()`、`PostLayout` 对 `lastUpdated` 的同款处理）给过来的
 * 都是 **UTC 零点时刻**的 ISO 串，用本地时区取值会让负 UTC 偏移的访客看到早一天的日期
 * （实测 `new Date('2026-08-22T00:00:00.000Z')` 在 UTC-4 下渲染成 `2026-08-21`）。
 *
 * 更糟的是那会让产物依赖构建机时区：CI 跑在 UTC（SSR 得到 08-22），而客户端按访客时区
 * 重算（得到 08-21），两边不一致。取 UTC 才是真正的确定性输出，也才是这个函数的本意。
 */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
