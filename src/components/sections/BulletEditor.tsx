import { Plus, Sparkles, Trash2 } from 'lucide-react'
import { useState } from 'react'
import BulletAssist from './BulletAssist'
import { AutoTextarea, Grip, IconButton, MoveButtons, useSortable } from '@/components/ui'
import { move } from '@/state/actions'

/** Bullet list editor. Enter adds the next bullet, Backspace on an empty one
 *  removes it — so a whole role can be written without touching the mouse. */
export default function BulletEditor({
  bullets, onChange, placeholder = 'Led …, reducing … by 30%', role, company,
}: {
  bullets: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  /** Passed to AI assist so a rewrite knows the job it belongs to. */
  role?: string
  company?: string
}) {
  const sortable = useSortable((from, to) => onChange(move(bullets, from, to)))
  const [assisting, setAssisting] = useState<number | null>(null)

  const setAt = (index: number, value: string) =>
    onChange(bullets.map((b, i) => (i === index ? value : b)))

  const insertAfter = (index: number) => {
    const next = [...bullets]
    next.splice(index + 1, 0, '')
    onChange(next)
    // Focus lands on the new field once React has rendered it.
    requestAnimationFrame(() => {
      const fields = document.querySelectorAll<HTMLTextAreaElement>('[data-bullet-field]')
      fields[Math.min(index + 1, fields.length - 1)]?.focus()
    })
  }

  const removeAt = (index: number) => onChange(bullets.filter((_, i) => i !== index))

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="label !mb-0">Bullets</span>
        <span className="muted text-[10px]">**bold** · *italic*</span>
      </div>

      {bullets.map((bullet, index) => (
        <div key={index}>
        <div
          {...sortable.rowProps(index)}
          className={`group flex items-start gap-1 rounded-lg transition ${
            sortable.overIndex === index ? 'ring-2 ring-brand-500/40' : ''
          }`}
        >
          <Grip {...sortable.gripProps(index)} />
          <AutoTextarea
            data-bullet-field=""
            value={bullet}
            onValueChange={(v) => setAt(index, v)}
            placeholder={placeholder}
            minRows={1}
            className="flex-1 !py-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); insertAfter(index) }
              if (e.key === 'Backspace' && !bullet && bullets.length > 1) { e.preventDefault(); removeAt(index) }
            }}
          />
          <div className="flex shrink-0 items-center">
            <IconButton
              label="Improve this bullet with AI"
              disabled={!bullet.trim()}
              onClick={() => setAssisting((i) => (i === index ? null : index))}
            >
              <Sparkles className={`h-3.5 w-3.5 ${assisting === index ? 'text-brand-600' : ''}`} />
            </IconButton>
            <MoveButtons
              index={index}
              count={bullets.length}
              label="bullet"
              onMove={(from, to) => onChange(move(bullets, from, to))}
            />
            <IconButton label="Remove bullet" danger onClick={() => removeAt(index)}>
              <Trash2 className="h-3.5 w-3.5" />
            </IconButton>
          </div>
        </div>

        {assisting === index ? (
          <BulletAssist
            bullet={bullet}
            role={role}
            company={company}
            onApply={(text) => setAt(index, text)}
            onClose={() => setAssisting(null)}
          />
        ) : null}
        </div>
      ))}

      <button type="button" className="btn-ghost !px-2 !py-1 text-xs" onClick={() => insertAfter(bullets.length - 1)}>
        <Plus className="h-3.5 w-3.5" /> Add bullet
      </button>
    </div>
  )
}
