import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import ResumeDocument from './ResumeDocument'
import { PAPER } from '@/lib/paper'
import type { Resume } from '@/lib/types'

/** A second copy of the document, mounted outside #root and hidden on screen.
 *  Printing then needs no new window, no server, and no PDF library — the
 *  browser's own engine paginates real text, which keeps the output selectable
 *  and machine-readable. */
export default function PrintRoot({ resume }: { resume: Resume }) {
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    let node = document.getElementById('print-root')
    if (!node) {
      node = document.createElement('div')
      node.id = 'print-root'
      node.style.display = 'none'
      document.body.appendChild(node)
    }
    setHost(node)
  }, [])

  useEffect(() => {
    const id = 'rf-page-rule'
    let tag = document.getElementById(id) as HTMLStyleElement | null
    if (!tag) {
      tag = document.createElement('style')
      tag.id = id
      document.head.appendChild(tag)
    }
    // @page cannot read custom properties reliably, so the rule is rewritten.
    tag.textContent = `@page { size: ${resume.theme.paper === 'letter' ? 'Letter' : 'A4'} portrait; margin: 0; }`
  }, [resume.theme.paper])

  useEffect(() => {
    const title = resume.profile.fullName.trim()
      ? `${resume.profile.fullName.trim().replace(/\s+/g, '_')}_Résumé`
      : 'Resume_Forge'
    // Chrome and Safari seed the PDF filename from document.title.
    const original = document.title
    const onBefore = () => { document.title = title }
    const onAfter = () => { document.title = original }
    window.addEventListener('beforeprint', onBefore)
    window.addEventListener('afterprint', onAfter)
    return () => {
      window.removeEventListener('beforeprint', onBefore)
      window.removeEventListener('afterprint', onAfter)
      document.title = original
    }
  }, [resume.profile.fullName])

  if (!host) return null
  return createPortal(<ResumeDocument resume={resume} mode="print" />, host)
}

export function printResume() {
  // Give React a frame to flush any pending edit into the print portal.
  requestAnimationFrame(() => requestAnimationFrame(() => window.print()))
}

export const paperLabel = (id: keyof typeof PAPER) => PAPER[id].label
