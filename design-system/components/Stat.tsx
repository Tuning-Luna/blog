import { Icon } from './Icon'
import type { IconName } from './Icon'
import './Stat.css'

interface StatProps {
  value: number | string
  label: string
  /** Optional filled icon shown above the value. */
  icon?: IconName
}

export function Stat({ value, label, icon }: StatProps) {
  return (
    <div className="m3-stat">
      {icon && <Icon name={icon} size={20} className="m3-stat__icon" />}
      <span className="m3-stat__value">{value}</span>
      <span className="m3-stat__label">{label}</span>
    </div>
  )
}
