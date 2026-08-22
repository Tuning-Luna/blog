import { useEffect, useRef, type CSSProperties, type Ref } from 'react'
import './Slider.css'

interface SliderProps {
  className?: string
  /** Accessible name for the slider. */
  label: string
  value: number
  max: number
  step?: number
  disabled?: boolean
  /** Human-readable current value (e.g. "70%"). */
  valueText?: string
  ref?: Ref<HTMLInputElement>
  /** Called with the raw slider value on every input event (drag, click, keys). */
  onChange: (value: number) => void
  /** When set, scrolling the wheel over the slider steps the value by this
   *  amount (down = decrease) and prevents the page from scrolling. */
  wheelStep?: number
}

/** Styled `<input type="range">`: 4px rounded track with the handled portion
 *  filled via a gradient bounded by `--range-progress` (set from the value on
 *  every render), and a circular primary-color thumb that grows while active
 *  (MD3 slider handles respond to interaction). */
export function Slider({
  className,
  label,
  value,
  max,
  step,
  disabled,
  valueText,
  ref,
  onChange,
  wheelStep,
}: SliderProps) {
  // The wheel listener below needs the latest value/callbacks without being
  // re-attached on every render (the value changes every animation frame).
  const valueRef = useRef(value)
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    valueRef.current = value
    onChangeRef.current = onChange
  })

  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!wheelStep) return
    const el = inputRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const direction = Math.sign(e.deltaY)
      if (direction === 0) return
      const current = valueRef.current
      const next = Math.min(max, Math.max(0, current - direction * wheelStep))
      if (next !== current) onChangeRef.current(next)
    }
    // Native listener: React attaches wheel events passively, which makes
    // preventDefault() (scroll lock) impossible.
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [wheelStep, max])

  const progress = max > 0 ? `${(value / max) * 100}%` : '0%'
  return (
    <input
      type="range"
      className={['m3-slider', className].filter(Boolean).join(' ')}
      aria-label={label}
      aria-valuetext={valueText}
      min={0}
      max={max || 1}
      step={step ?? 1}
      value={value}
      disabled={disabled}
      style={{ '--range-progress': progress } as CSSProperties}
      onChange={(e) => onChange(Number(e.currentTarget.value))}
      ref={(el) => {
        inputRef.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) ref.current = el
      }}
    />
  )
}
