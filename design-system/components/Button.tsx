import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'
import './Button.css'

type Variant = 'filled' | 'tonal' | 'text'

interface BaseProps {
  variant?: Variant
  children: ReactNode
}

type ButtonProps = BaseProps &
  (ButtonHTMLAttributes<HTMLButtonElement> | AnchorHTMLAttributes<HTMLAnchorElement>) & {
    /** When present, renders an <a> instead of a <button>. */
    href?: string
  }

/**
 * M3 button. Renders an <a> when `href` is given, otherwise a <button>.
 * External links (http(s) and mailto:) open in a new tab with a small external
 * indicator.
 */
export function Button({ variant = 'filled', href, children, className, ...rest }: ButtonProps) {
  const classes = ['m3-button', `m3-button--${variant}`, className].filter(Boolean).join(' ')

  if (href) {
    const external = href.startsWith('http') || href.startsWith('mailto:')
    return (
      <a
        className={classes}
        href={href}
        {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        <span className="m3-button__label">{children}</span>
        {external && (
          <span className="m3-button__icon" aria-hidden="true">
            ↗
          </span>
        )}
      </a>
    )
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      <span className="m3-button__label">{children}</span>
    </button>
  )
}
