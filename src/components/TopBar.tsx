import { useEffect, useRef, useState } from 'react'
import {
  Check, ChevronDown, Copy, Download, FileDown, FilePlus2, FileText, Moon,
  Redo2, Sparkles, Sun, Trash2, Undo2, Upload,
} from 'lucide-react'
import { printResume } from './PrintRoot'
import { blankResume } from '@/lib/factory'
import { relativeTime } from '@/lib/format'
import { isResumeLike, normaliseResume } from '@/lib/schema'
import { sampleResume } from '@/lib/sample'
import { toPlainText } from '@/lib/plaintext'
import { download, exportJson, setResumeName } from '@/state/actions'
import { store, useResume, useStore, useUI } from '@/state/store'

const fileStem = (name: string) => name.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') || 'resume'

export default function TopBar() {
  const resume = useResume()
  const resumes = useStore((s) => s.resumes)
  const { dark } = useUI()
  const [notice, setNotice] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(''), 2200)
    return () => clearTimeout(t)
  }, [notice])

  const importFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text())
      if (!isResumeLike(parsed)) throw new Error('not a résumé')
      store.addResume(normaliseResume({ ...parsed, id: undefined }))
      setNotice('Imported')
    } catch {
      setNotice("That file isn't a Resume Forge export")
    }
  }

  const copyPlainText = async () => {
    try {
      await navigator.clipboard.writeText(toPlainText(resume))
      setNotice('Plain text copied')
    } catch {
      download(`${fileStem(resume.name)}.txt`, toPlainText(resume), 'text/plain')
      setNotice('Downloaded as .txt')
    }
  }

  return (
    <header className="no-print z-20 flex flex-wrap items-center gap-2 border-b border-ink-200 bg-white px-3 py-2 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">RF</span>
        <span className="hidden text-sm font-semibold tracking-tight sm:block">Resume Forge</span>
      </div>

      <span className="mx-1 hidden h-6 w-px bg-ink-200 dark:bg-ink-800 sm:block" />

      <DocumentMenu resumes={resumes} activeName={resume.name} onNotice={setNotice} />

      <input
        className="min-w-0 max-w-[16rem] flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-medium hover:border-ink-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:hover:border-ink-700"
        value={resume.name}
        onChange={(e) => setResumeName(e.target.value)}
        aria-label="Résumé name"
      />

      <span className="muted hidden text-[11px] lg:block">Saved {relativeTime(resume.updatedAt)}</span>

      <div className="ml-auto flex items-center gap-1">
        {notice ? (
          <span className="animate-fade-in mr-1 hidden items-center gap-1 text-xs text-emerald-600 sm:flex dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" /> {notice}
          </span>
        ) : null}

        <IconAction label="Undo (⌘Z)" onClick={() => store.undo()}><Undo2 className="h-4 w-4" /></IconAction>
        <IconAction label="Redo (⇧⌘Z)" onClick={() => store.redo()}><Redo2 className="h-4 w-4" /></IconAction>
        <IconAction label={dark ? 'Light mode' : 'Dark mode'} onClick={() => store.updateUI({ dark: !dark })}>
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </IconAction>

        <span className="mx-1 h-6 w-px bg-ink-200 dark:bg-ink-800" />

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void importFile(file)
            e.target.value = ''
          }}
        />
        <IconAction label="Import JSON" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /></IconAction>
        <IconAction label="Export JSON" onClick={() => { download(`${fileStem(resume.name)}.json`, exportJson(resume)); setNotice('Exported') }}>
          <FileDown className="h-4 w-4" />
        </IconAction>
        <IconAction label="Copy as plain text" onClick={copyPlainText}><FileText className="h-4 w-4" /></IconAction>

        {/* The label is hidden on narrow screens, so the name has to come
            from aria-label or the button is unlabelled for screen readers. */}
        <button className="btn-primary ml-1" onClick={printResume} aria-label="Download PDF">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download PDF</span>
        </button>
      </div>
    </header>
  )
}

function IconAction({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className="btn-ghost !px-2" title={label} aria-label={label} onClick={onClick}>
      {children}
    </button>
  )
}

function DocumentMenu({
  resumes, activeName, onNotice,
}: {
  resumes: { id: string; name: string; updatedAt: number }[]
  activeName: string
  onNotice: (s: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button type="button" className="btn-soft !px-2 !py-1.5 text-xs" onClick={() => setOpen((o) => !o)}>
        {resumes.length} doc{resumes.length === 1 ? '' : 's'}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open ? (
        <div className="animate-fade-in absolute left-0 top-full z-30 mt-1 w-72 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-lg dark:border-ink-800 dark:bg-ink-900">
          <div className="max-h-64 overflow-auto py-1">
            {resumes.map((r) => (
              <div key={r.id} className="group flex items-center gap-1 px-1">
                <button
                  type="button"
                  className={`min-w-0 flex-1 rounded-md px-2 py-1.5 text-left text-sm hover:bg-ink-100 dark:hover:bg-ink-800 ${
                    r.name === activeName ? 'font-semibold' : ''
                  }`}
                  onClick={() => { store.setActive(r.id); setOpen(false) }}
                >
                  <span className="block truncate">{r.name}</span>
                  <span className="muted block text-[11px]">Edited {relativeTime(r.updatedAt)}</span>
                </button>
                <button
                  type="button"
                  className="btn-danger !px-1.5 !py-1 opacity-0 transition group-hover:opacity-100"
                  title="Delete"
                  onClick={() => store.removeResume(r.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-ink-200 p-1 dark:border-ink-800">
            <MenuAction icon={FilePlus2} label="New blank résumé" onClick={() => { store.addResume(blankResume()); setOpen(false) }} />
            <MenuAction icon={Copy} label="Duplicate this résumé" onClick={() => { store.duplicateActive(); setOpen(false); onNotice('Duplicated') }} />
            <MenuAction icon={Sparkles} label="Load a worked example" onClick={() => { store.addResume(sampleResume()); setOpen(false) }} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function MenuAction({
  icon: Icon, label, onClick,
}: {
  icon: typeof FilePlus2
  label: string
  onClick: () => void
}) {
  return (
    <button type="button" className="btn-ghost w-full justify-start !py-1.5 text-sm" onClick={onClick}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  )
}
