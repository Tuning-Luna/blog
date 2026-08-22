import { useEffect } from 'react'

/**
 * Scroll-reveal: every `.m3-section` starts faded/raised (`.pre-reveal`, see
 * Section.css) and animates in when it enters the viewport. Unobserves each
 * section after its first reveal. Falls back to always-visible when
 * IntersectionObserver is unavailable.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
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
    return () => io.disconnect()
  }, [])
}
