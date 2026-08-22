import type { ReactNode } from 'react'
import './Section.css'

interface SectionProps {
  id: string
  eyebrow: string
  title?: string
  subtitle?: string
  children: ReactNode
}

/** Section wrapper with an eyebrow label, M3 headline and optional description. */
export function Section({ id, eyebrow, title, subtitle, children }: SectionProps) {
  const hasHeader = Boolean(eyebrow || title || subtitle)
  return (
    <section id={id} className="m3-section">
      <div className="container">
        {hasHeader && (
          <header className="m3-section__header">
            <span className="m3-section__eyebrow">{eyebrow}</span>
            {title && <h2 className="m3-section__title">{title}</h2>}
            {subtitle && <p className="m3-section__subtitle">{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}
