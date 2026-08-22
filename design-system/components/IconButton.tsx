import type { ButtonHTMLAttributes } from 'react'
import { Icon, type IconName } from './Icon'
import './IconButton.css'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName
  /** Accessible name for the icon button. */
  label: string
}

export function IconButton({ icon, label, className, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      className={['m3-icon-button', className].filter(Boolean).join(' ')}
      aria-label={label}
      {...rest}
    >
      <Icon name={icon} size={20} />
    </button>
  )
}
