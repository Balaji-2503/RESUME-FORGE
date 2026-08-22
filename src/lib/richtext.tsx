import { Fragment, type ReactNode } from 'react'

/** A deliberately tiny inline formatter: `**bold**`, `*italic*` and bare URLs.
 *  Full rich text would produce markup that ATS parsers choke on, so the
 *  résumé body stays plain text with a couple of emphasis affordances. */
const TOKEN = /(\*\*[^*]+\*\*|\*[^*\n]+\*|https?:\/\/[^\s)]+)/g

export function renderInline(text: string): ReactNode {
  if (!text) return null
  const parts = text.split(TOKEN)
  return parts.map((part, i) => {
    if (!part) return null
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={i} href={part} className="rf-link">
          {part.replace(/^https?:\/\//, '')}
        </a>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

/** Emphasis markers removed — used by the analyser and by word counts. */
export function plainText(text: string): string {
  return text.replace(/\*\*/g, '').replace(/\*/g, '')
}
