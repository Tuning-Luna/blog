import type { HTMLAttributes } from 'react'
import './Chip.css'

type ChipProps = HTMLAttributes<HTMLSpanElement>

/** M3 assist chip — used for tags and tech names. */
export function Chip({ className, children, ...rest }: ChipProps) {
  return (
    <span className={['m3-chip', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </span>
  )
}
