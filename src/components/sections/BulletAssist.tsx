import { useEffect, useRef, useState } from 'react'
import { HelpCircle, Loader2, RotateCw, X } from 'lucide-react'
import { rewriteBullet, type RewriteResult } from '@/lib/ai/rewrite'
import { isReady } from '@/lib/ai/config'
import { useAiConfig } from '@/state/ai'

/** Suggestion sheet for one bullet. Nothing is applied until the user picks a
 *  variant — the model proposes, the person decides. */
export default function BulletAssist({
  bullet, role, company, onApply, onClose,
}: {
  bullet: string
  role?: string
  company?: string
  onApply: (text: string) => void
  onClose: () => void
}) {
  const config = useAiConfig()
  const [result, setResult] = useState<RewriteResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const abort = useRef<AbortController>()

  const run = () => {
    abort.current?.abort()
    const controller = new AbortController()
    abort.current = controller
    setLoading(true)
    setError('')
    setResult(null)
    rewriteBullet(config, { bullet, role, company }, controller.signal)
      .then((r) => { if (!controller.signal.aborted) setResult(r) })
      .catch((e: Error) => { if (e.name !== 'AbortError') setError(e.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
  }

  // Fire on open, and cancel if the sheet closes mid-flight.
  useEffect(() => {
    run()
    return () => abort.current?.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isReady(config)) {
    return (
      <Shell onClose={onClose}>
        <p className="text-xs text-ink-600 dark:text-ink-300">
          Add an API key first — <strong>Review → AI assist</strong>. It runs on your own key,
          straight from this browser.
        </p>
      </Shell>
    )
  }

  return (
    <Shell onClose={onClose}>
      {loading ? (
        <p className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Rewriting…
        </p>
      ) : null}

      {error ? (
        <div className="space-y-2">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          <button type="button" className="btn-soft !py-1 text-xs" onClick={run}>
            <RotateCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      ) : null}

      {result ? (
        <div className="space-y-2">
          {result.variants.map((v, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { onApply(v.text); onClose() }}
              className="block w-full rounded-lg border border-ink-200 p-2 text-left transition hover:border-brand-400 hover:bg-brand-50/60 dark:border-ink-700 dark:hover:border-brand-500 dark:hover:bg-brand-950/30"
            >
              <span className="block text-xs leading-relaxed">{v.text}</span>
              {v.note ? <span className="muted mt-1 block text-[10px]">{v.note}</span> : null}
            </button>
          ))}

          {result.missing.length ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-2 dark:border-amber-900 dark:bg-amber-950/40">
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-amber-800 dark:text-amber-300">
                <HelpCircle className="h-3.5 w-3.5" /> Worth adding — only you know these
              </p>
              <ul className="mt-1 space-y-0.5">
                {result.missing.map((q, i) => (
                  <li key={i} className="text-[11px] leading-relaxed text-amber-900 dark:text-amber-200">
                    • {q}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <span className="muted text-[10px]">Nothing is applied until you pick one.</span>
            <button type="button" className="btn-ghost !px-2 !py-1 text-xs" onClick={run}>
              <RotateCw className="h-3.5 w-3.5" /> Again
            </button>
          </div>
        </div>
      ) : null}
    </Shell>
  )
}

function Shell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="animate-fade-in mt-1.5 rounded-lg border border-brand-200 bg-brand-50/50 p-2.5 dark:border-brand-900 dark:bg-brand-950/20">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-brand-700 dark:text-brand-300">Suggestions</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close suggestions"
          className="rounded p-0.5 text-ink-400 hover:text-ink-700 dark:hover:text-ink-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {children}
    </div>
  )
}
