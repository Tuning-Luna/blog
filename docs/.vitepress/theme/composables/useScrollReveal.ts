import { onMounted } from 'vue'

/**
 * 滚动显现：所有 .m3-section 初始淡出上移（.pre-reveal，见 design-system
 * Section.css），进入视口后动画进入。IntersectionObserver 不可用时回退为始终可见。
 * 复刻 design-system hooks/useScrollReveal.ts 的 Vue 版（源项目同款逻辑）。
 */
export function useScrollReveal() {
  onMounted(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return
    const sections = document.querySelectorAll<HTMLElement>('.m3-section')
    sections.forEach((el) => el.classList.add('pre-reveal'))
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.remove('pre-reveal')
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.08 },
    )
    sections.forEach((el) => io.observe(el))
  })
}
