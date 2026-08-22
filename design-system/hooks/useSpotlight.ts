import type { MouseEvent } from 'react'

/**
 * Mousemove handler for the `.spotlight` halo: writes the cursor position
 * relative to the element into --spot-x / --spot-y, which the CSS radial
 * gradient uses to paint a faint light that follows the mouse.
 */
export function handleSpotlight(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`)
  el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`)
}
