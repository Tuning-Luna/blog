import type { HTMLAttributes } from 'react'
import './Card.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** M3 elevation level to show at rest. */
  elevation?: 1 | 2 | 3
}

/** M3 elevated card. */
export function Card({ elevation = 1, className, ...rest }: CardProps) {
  return (
    <div
      className={['m3-card', `m3-card--elev${elevation}`, className].filter(Boolean).join(' ')}
      {...rest}
    />
  )
}
