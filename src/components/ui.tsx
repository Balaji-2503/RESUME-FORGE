import {
  useCallback, useEffect, useId, useLayoutEffect, useRef, useState,
  type ReactNode, type TextareaHTMLAttributes,
} from 'react'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'

/* ---------------------------------------------------------------- inputs -- */

export function TextField({
  label, value, onChange, placeholder, type = 'text', hint, className = '', list,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  hint?: string
  className?: string
  list?: string
}) {
  const id = useId()
  return (
    <div className={className}>
      {label ? <label className="label" htmlFor={id}>{label}</label> : null}
      <input
        id={id}
        className="field"
        type={type}
        value={value}
        list={list}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <p className="muted mt-1 text-[11px]">{hint}</p> : null}
    </div>
  )
}

type AutoTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value: string
  onValueChange: (v: string) => void
  minRows?: number
}

/** Textarea that grows with its content — writing bullets in a 3-line box is
 *  the single most annoying thing about most résumé builders. */
export function AutoTextarea({ value, onValueChange, minRows = 2, className = '', ...rest }: AutoTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const resize = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useLayoutEffect(resize, [value, resize])

  return (
    <textarea
      ref={ref}
      rows={minRows}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={`field resize-none overflow-hidden ${className}`}
      {...rest}
    />
  )
}

export function TextArea({
  label, value, onChange, placeholder, hint, minRows = 3, className = '',
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
  minRows?: number
  className?: string
}) {
  return (
    <div className={className}>
      {label ? <span className="label">{label}</span> : null}
      <AutoTextarea value={value} onValueChange={onChange} placeholder={placeholder} minRows={minRows} />
      {hint ? <p className="muted mt-1 text-[11px]">{hint}</p> : null}
    </div>
  )
}

export function Select<T extends string>({
  label, value, onChange, options, className = '',
}: {
  label?: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  className?: string
}) {
  const id = useId()
  return (
    <div className={className}>
      {label ? <label className="label" htmlFor={id}>{label}</label> : null}
      <select id={id} className="field" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

export function Toggle({
  label, checked, onChange, hint,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  hint?: string
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1">
      <span className="min-w-0">
        <span className="text-sm text-ink-700 dark:text-ink-200">{label}</span>
        {hint ? <span className="muted block text-[11px]">{hint}</span> : null}
      </span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-5 w-9 rounded-full bg-ink-300 transition peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/40 dark:bg-ink-700" />
        <span className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
      </span>
    </label>
  )
}

export function Slider({
  label, value, min, max, step, unit = '', onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (v: number) => void
}) {
  const id = useId()
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="label" htmlFor={id}>{label}</label>
        <span className="text-[11px] tabular-nums text-ink-500 dark:text-ink-400">{value}{unit}</span>
      </div>
      <input
        id={id}
        type="range"
        className="w-full accent-brand-600"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

export function ColorField({
  label, value, onChange, swatches = [],
}: {
  label: string
  value: string
  onChange: (v: string) => void
  swatches?: string[]
}) {
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-9 cursor-pointer rounded-lg border border-ink-200 bg-white p-0.5 dark:border-ink-700 dark:bg-ink-900"
          aria-label={label}
        />
        <input
          className="field font-mono text-xs uppercase"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          aria-label={`${label} hex value`}
        />
      </div>
      {swatches.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {swatches.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={`h-5 w-5 rounded-full border transition hover:scale-110 ${
                value.toLowerCase() === c.toLowerCase() ? 'border-ink-900 ring-2 ring-ink-900/20 dark:border-white' : 'border-black/10'
              }`}
              style={{ background: c }}
              aria-label={`Use ${c}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

/** Comma / Enter separated token input for skills and tech tags. */
export function TagField({
  label, values, onChange, placeholder,
}: {
  label?: string
  values: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState('')

  const commit = (raw: string) => {
    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean)
    if (!parts.length) return
    const next = [...values]
    for (const p of parts) if (!next.some((v) => v.toLowerCase() === p.toLowerCase())) next.push(p)
    onChange(next)
    setDraft('')
  }

  return (
    <div>
      {label ? <span className="label">{label}</span> : null}
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-ink-200 bg-white p-1.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/25 dark:border-ink-700 dark:bg-ink-900">
        {values.map((v, i) => (
          <span key={`${v}-${i}`} className="chip">
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="ml-0.5 text-ink-400 hover:text-red-600"
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="min-w-[7rem] flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-ink-400"
          value={draft}
          placeholder={values.length ? '' : placeholder}
          onChange={(e) => {
            if (e.target.value.includes(',')) commit(e.target.value)
            else setDraft(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); commit(draft) }
            if (e.key === 'Backspace' && !draft && values.length) onChange(values.slice(0, -1))
          }}
          onBlur={() => commit(draft)}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- structure -- */

export function Collapsible({
  title, subtitle, actions, defaultOpen = true, children, tone = 'default',
}: {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
  tone?: 'default' | 'muted'
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`card overflow-hidden ${tone === 'muted' ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left hover:bg-ink-100 dark:hover:bg-ink-800"
          aria-expanded={open}
        >
          <ChevronDown className={`h-4 w-4 shrink-0 text-ink-400 transition-transform ${open ? '' : '-rotate-90'}`} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{title}</span>
            {subtitle ? <span className="muted block truncate text-xs">{subtitle}</span> : null}
          </span>
        </button>
        {actions ? <div className="flex shrink-0 items-center gap-0.5">{actions}</div> : null}
      </div>
      {open ? <div className="animate-fade-in border-t border-ink-200 px-3 py-3 dark:border-ink-800">{children}</div> : null}
    </div>
  )
}

export function IconButton({
  label, onClick, children, danger = false, disabled = false,
}: {
  label: string
  onClick: () => void
  children: ReactNode
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md p-1.5 transition disabled:opacity-30 ${
        danger
          ? 'text-ink-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40'
          : 'text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-100'
      }`}
    >
      {children}
    </button>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="muted rounded-lg border border-dashed border-ink-300 px-3 py-4 text-center text-xs dark:border-ink-700">
      {children}
    </p>
  )
}

/* ------------------------------------------------------------- sortable --- */

/** Drag-to-reorder without a dependency. The row is only made draggable while
 *  the grip is held, so text selection inside inputs keeps working. */
export function useSortable(onMove: (from: number, to: number) => void) {
  const from = useRef<number | null>(null)
  const [armed, setArmed] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(null)

  const reset = () => { from.current = null; setArmed(null); setOver(null) }

  return {
    overIndex: over,
    rowProps: (index: number) => ({
      draggable: armed === index,
      onDragStart: (e: React.DragEvent) => {
        from.current = index
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', String(index))
      },
      onDragOver: (e: React.DragEvent) => {
        if (from.current === null) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setOver(index)
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault()
        const source = from.current
        if (source !== null && source !== index) onMove(source, index)
        reset()
      },
      onDragEnd: reset,
    }),
    gripProps: (index: number) => ({
      onPointerDown: () => setArmed(index),
      onPointerUp: () => setArmed(null),
      onPointerLeave: () => setArmed((a) => (a === index ? null : a)),
    }),
  }
}

/** The keyboard- and touch-accessible counterpart to the drag grip: HTML5
 *  drag events never fire on touch, and a grip can't be operated by keyboard.
 *  These buttons are the path that always works. */
export function MoveButtons({
  index, count, onMove, label,
}: {
  index: number
  count: number
  onMove: (from: number, to: number) => void
  label: string
}) {
  if (count < 2) return null
  return (
    <>
      <IconButton label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(index, index - 1)}>
        <ChevronUp className="h-3.5 w-3.5" />
      </IconButton>
      <IconButton label={`Move ${label} down`} disabled={index === count - 1} onClick={() => onMove(index, index + 1)}>
        <ChevronDown className="h-3.5 w-3.5" />
      </IconButton>
    </>
  )
}

export function Grip(props: Record<string, unknown>) {
  return (
    <span
      {...props}
      className="hidden cursor-grab touch-none rounded p-1 text-ink-300 hover:text-ink-500 active:cursor-grabbing lg:inline-block dark:text-ink-600 dark:hover:text-ink-300"
      title="Drag to reorder (or use the arrow buttons)"
    >
      <GripVertical className="h-4 w-4" />
    </span>
  )
}

/* ----------------------------------------------------------------- misc --- */

export function useKeyboard(handler: (e: KeyboardEvent) => void) {
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => {
    const fn = (e: KeyboardEvent) => ref.current(e)
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])
}
