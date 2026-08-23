import { useEffect, useMemo, useState } from 'react'
import { FileText, LayoutList, Palette, PencilLine, ShieldCheck } from 'lucide-react'
import Preview from './components/Preview'
import PrintRoot, { printResume } from './components/PrintRoot'
import TopBar from './components/TopBar'
import ContentPanel from './components/panels/ContentPanel'
import DesignPanel from './components/panels/DesignPanel'
import ReviewPanel from './components/panels/ReviewPanel'
import { useKeyboard } from './components/ui'
import { reviewResume } from './lib/analysis'
import { isReady, providerById } from './lib/ai/config'
import { useAiConfig } from './state/ai'
import { store, useResume, useUI } from './state/store'
import type { AppState } from './lib/types'

const PANELS: { id: AppState['ui']['panel']; label: string; icon: typeof LayoutList }[] = [
  { id: 'content', label: 'Content', icon: LayoutList },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'review', label: 'Review', icon: ShieldCheck },
]

export default function App() {
  const resume = useResume()
  const { dark, panel } = useUI()
  const ai = useAiConfig()
  // Below `lg` the editor and the page can't sit side by side, so they take
  // turns. Transient by design — which pane you last looked at is not worth
  // restoring on a later visit.
  const [pane, setPane] = useState<'edit' | 'preview'>('edit')

  const issues = useMemo(() => {
    const { findings } = reviewResume(resume)
    return findings.filter((f) => f.severity === 'critical' || f.severity === 'warning').length
  }, [resume])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useKeyboard((e) => {
    const mod = e.metaKey || e.ctrlKey
    if (!mod) return
    const key = e.key.toLowerCase()
    if (key === 'z') {
      e.preventDefault()
      if (e.shiftKey) store.redo()
      else store.undo()
    }
    if (key === 'p') {
      e.preventDefault()
      printResume()
    }
    if (key === 's') {
      // Everything is already persisted; intercepting avoids a useless
      // "save this page" dialog when muscle memory kicks in.
      e.preventDefault()
    }
  })

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <TopBar />

      <div className="no-print flex border-b border-ink-200 bg-white px-2 py-1.5 lg:hidden dark:border-ink-800 dark:bg-ink-900">
        {([
          { id: 'edit' as const, label: 'Edit', icon: PencilLine },
          { id: 'preview' as const, label: 'Preview', icon: FileText },
        ]).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPane(p.id)}
            aria-current={pane === p.id}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
              pane === p.id
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                : 'text-ink-600 dark:text-ink-400'
            }`}
          >
            <p.icon className="h-4 w-4" />
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside
          className={`no-print w-full min-w-0 flex-col border-r border-ink-200 bg-ink-50 lg:flex lg:w-[27rem] lg:shrink-0 dark:border-ink-800 dark:bg-ink-950 ${
            pane === 'edit' ? 'flex' : 'hidden'
          }`}
        >
          <nav className="flex gap-1 border-b border-ink-200 bg-white px-2 py-1.5 dark:border-ink-800 dark:bg-ink-900">
            {PANELS.map((p) => {
              const active = panel === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => store.updateUI({ panel: p.id })}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                      : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100'
                  }`}
                  aria-current={active}
                >
                  <p.icon className="h-4 w-4" />
                  {p.label}
                  {p.id === 'review' && issues > 0 ? (
                    <span className="ml-0.5 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold leading-4 text-white">
                      {issues}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {panel === 'content' ? <ContentPanel /> : null}
            {panel === 'design' ? <DesignPanel /> : null}
            {panel === 'review' ? <ReviewPanel /> : null}
          </div>

          {/* The privacy claim has to stay literally true. Once AI assist is
              configured, one bullet at a time does leave the device, so say so
              rather than keeping the blanket promise. */}
          <footer className="muted border-t border-ink-200 px-3 py-2 text-[11px] leading-relaxed dark:border-ink-800">
            {isReady(ai)
              ? `Your résumé stays in this browser. AI assist sends only the bullet you pick to ${providerById(ai.provider).label}.`
              : 'Everything stays in this browser — no account, no upload, no server.'}
          </footer>
        </aside>

        <main
          className={`min-h-0 min-w-0 flex-1 flex-col lg:flex ${pane === 'preview' ? 'flex' : 'hidden'}`}
        >
          <Preview />
        </main>
      </div>

      <PrintRoot resume={resume} />
    </div>
  )
}
