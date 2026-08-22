import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Maximize2, Minus, Plus } from 'lucide-react'
import ResumeDocument from './ResumeDocument'
import { PAPER, mmToPx } from '@/lib/paper'
import { store, useResume, useUI } from '@/state/store'

const ZOOM_MIN = 0.35
const ZOOM_MAX = 2

export default function Preview() {
  const resume = useResume()
  const { zoom } = useUI()
  const scrollRef = useRef<HTMLDivElement>(null)
  const docRef = useRef<HTMLDivElement>(null)
  const [docHeight, setDocHeight] = useState(0)

  const paper = PAPER[resume.theme.paper]
  const pageW = mmToPx(paper.w)
  const pageH = mmToPx(paper.h)

  // Track the rendered height so we can draw page-break guides where the
  // browser will actually break, rather than guessing from word counts.
  useLayoutEffect(() => {
    const node = docRef.current
    if (!node) return
    const ro = new ResizeObserver(() => setDocHeight(node.getBoundingClientRect().height / zoom))
    ro.observe(node)
    setDocHeight(node.getBoundingClientRect().height / zoom)
    return () => ro.disconnect()
  }, [zoom, resume])

  const fitToWidth = () => {
    const el = scrollRef.current
    if (!el) return
    const available = el.clientWidth - 64
    // Capped at 1: filling a wide pane by magnifying the page misrepresents
    // how the résumé will actually look on paper.
    store.updateUI({ zoom: Math.max(ZOOM_MIN, Math.min(1, available / pageW)) })
  }

  // Fit once on mount so the page is fully visible whatever the window size.
  useEffect(() => {
    fitToWidth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pages = Math.max(1, Math.ceil((docHeight - 1) / pageH))
  const guides = Array.from({ length: Math.max(0, pages - 1) }, (_, i) => (i + 1) * pageH)
  const scaledHeight = Math.max(docHeight, pageH) * zoom

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto bg-ink-200/70 p-8 dark:bg-ink-950">
        <div className="mx-auto" style={{ width: pageW * zoom, height: scaledHeight }}>
          <div
            ref={docRef}
            className="relative origin-top-left shadow-[0_1px_2px_rgba(0,0,0,.08),0_12px_36px_-8px_rgba(0,0,0,.28)]"
            style={{ width: pageW, transform: `scale(${zoom})` }}
          >
            <ResumeDocument resume={resume} />
            {guides.map((top, i) => (
              <div key={top} className="rf-page-guide" style={{ top }} data-label={`Page ${i + 2}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="no-print flex items-center justify-between border-t border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-500 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-400">
        <span>
          {pages} page{pages > 1 ? 's' : ''} · {paper.label}
          {pages > 2 ? <span className="ml-2 text-amber-600 dark:text-amber-400">Long for most roles</span> : null}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="btn-ghost !px-1.5 !py-1"
            onClick={() => store.updateUI({ zoom: Math.max(ZOOM_MIN, Number((zoom - 0.1).toFixed(2))) })}
            aria-label="Zoom out"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-11 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
          <button
            className="btn-ghost !px-1.5 !py-1"
            onClick={() => store.updateUI({ zoom: Math.min(ZOOM_MAX, Number((zoom + 0.1).toFixed(2))) })}
            aria-label="Zoom in"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button className="btn-ghost !px-1.5 !py-1" onClick={fitToWidth} aria-label="Fit to width" title="Fit to width">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
