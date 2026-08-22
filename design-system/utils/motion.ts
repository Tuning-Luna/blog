// MD3 motion utilities for JS-driven (rAF) animations: the design system's
// easing curves as evaluatable functions, plus a cancellable tween.
//
// Curve values mirror the tokens in `src/theme/tokens.css` (identical to the
// official `md.sys.motion.easing.*` tokens from m3.material.io):
//   • emphasized-decelerate — entering/arriving: peak velocity, gentle rest
//   • emphasized-accelerate — exiting/leaving: gentle start, fast departure

/** Evaluate a CSS cubic-bezier easing curve (x-axis = time, y-axis = progress)
 *  using Newton-Raphson with a bisection fallback — the same approach as the
 *  browser's own CSS timing functions. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number): (x: number) => number {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx

  return (x: number) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 8; i++) {
      const dx = sampleX(t) - x
      if (Math.abs(dx) < 1e-6) return sampleY(t)
      const d = sampleDX(t)
      if (Math.abs(d) < 1e-6) break
      t -= dx / d
    }
    let lo = 0
    let hi = 1
    t = x
    while (hi - lo > 1e-6) {
      if (sampleX(t) < x) lo = t
      else hi = t
      t = (lo + hi) / 2
    }
    return sampleY(t)
  }
}

/** MD3 `md.sys.motion.easing.emphasized-decelerate` — entering/arriving. */
export const easingEmphasizedDecelerate = cubicBezier(0.05, 0.7, 0.1, 1)
/** MD3 `md.sys.motion.easing.emphasized-accelerate` — exiting/leaving. */
export const easingEmphasizedAccelerate = cubicBezier(0.3, 0, 0.8, 0.15)

export interface TweenHandle {
  /** Stops the tween; `onDone` will not fire. */
  cancel: () => void
}

/** Animate a number from `from` to `to` over `durationMs`, eased by `easing`,
 *  calling `onUpdate` every frame. `onDone` fires only on natural completion. */
export function tween(
  from: number,
  to: number,
  durationMs: number,
  easing: (x: number) => number,
  onUpdate: (value: number) => void,
  onDone?: () => void,
): TweenHandle {
  let raf = 0
  let cancelled = false
  const start = performance.now()
  const frame = (now: number) => {
    if (cancelled) return
    const progress = durationMs <= 0 ? 1 : Math.min(1, (now - start) / durationMs)
    onUpdate(from + (to - from) * easing(progress))
    if (progress < 1) {
      raf = requestAnimationFrame(frame)
    } else {
      raf = 0
      onDone?.()
    }
  }
  raf = requestAnimationFrame(frame)
  return {
    cancel: () => {
      if (cancelled) return
      cancelled = true
      if (raf) cancelAnimationFrame(raf)
    },
  }
}

/** True when the visitor asked for reduced motion (visual glides collapse to
 *  instant changes; audio fades are kept — they prevent clicks, not motion). */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
