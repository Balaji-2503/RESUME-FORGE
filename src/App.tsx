import { useEffect, useMemo } from 'react'
import { LayoutList, Palette, ShieldCheck } from 'lucide-react'
import Preview from './components/Preview'
import PrintRoot, { printResume } from './components/PrintRoot'
import TopBar from './components/TopBar'
import ContentPanel from './components/panels/ContentPanel'
import DesignPanel from './components/panels/DesignPanel'
import ReviewPanel from './components/panels/ReviewPanel'
import { useKeyboard } from './components/ui'
import { reviewResume } from './lib/analysis'
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

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="no-print flex w-full min-w-0 flex-col border-r border-ink-200 bg-ink-50 lg:w-[27rem] lg:shrink-0 dark:border-ink-800 dark:bg-ink-950">
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
                      : 'text-ink-500 hover:bg-ink-100 hover:text-ink-800 dark:hover:bg-ink-800 dark:hover:text-ink-100'
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

          <footer className="border-t border-ink-200 px-3 py-2 text-[11px] leading-relaxed text-ink-400 dark:border-ink-800">
            Everything stays in this browser — no account, no upload, no server.
          </footer>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Preview />
        </main>
      </div>

      <PrintRoot resume={resume} />
    </div>
  )
}
