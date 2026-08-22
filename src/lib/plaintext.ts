import { dateRange, displayUrl } from './format'
import { plainText } from './richtext'
import type { Resume } from './types'

/** Plain-text rendering for the "copy for an online application form" case,
 *  where pasting styled HTML into a textarea mangles the layout. */
export function toPlainText(resume: Resume): string {
  const out: string[] = []
  const p = resume.profile

  if (p.fullName.trim()) out.push(p.fullName.toUpperCase())
  if (p.headline.trim()) out.push(p.headline)

  const contact = [p.email, p.phone, p.location, displayUrl(p.website), displayUrl(p.linkedin), displayUrl(p.github)]
    .map((s) => s.trim())
    .filter(Boolean)
  for (const e of p.extras) if (e.value.trim()) contact.push(displayUrl(e.value))
  if (contact.length) out.push(contact.join(' | '))

  const heading = (title: string) => {
    out.push('', title.toUpperCase(), '='.repeat(Math.max(title.length, 3)))
  }
  const bullets = (items: string[]) => {
    for (const b of items) if (b.trim()) out.push(`- ${plainText(b).trim()}`)
  }

  for (const s of resume.sections) {
    if (s.hidden) continue
    switch (s.kind) {
      case 'summary':
        if (!s.content.trim()) break
        heading(s.title)
        out.push(plainText(s.content).trim())
        break

      case 'experience': {
        const items = s.items.filter((i) => !i.hidden)
        if (!items.length) break
        heading(s.title)
        for (const i of items) {
          out.push('', [i.role, i.company].filter(Boolean).join(' — '))
          const meta = [dateRange(i.start, i.end, i.current), i.location].filter(Boolean).join(' | ')
          if (meta) out.push(meta)
          if (i.summary.trim()) out.push(plainText(i.summary).trim())
          bullets(i.bullets)
          if (i.tags.length) out.push(`Tech: ${i.tags.join(', ')}`)
        }
        break
      }

      case 'education': {
        const items = s.items.filter((i) => !i.hidden)
        if (!items.length) break
        heading(s.title)
        for (const i of items) {
          out.push('', [i.degree, i.school].filter(Boolean).join(' — '))
          const meta = [dateRange(i.start, i.end, i.current), i.location, i.score].filter(Boolean).join(' | ')
          if (meta) out.push(meta)
          bullets(i.bullets)
        }
        break
      }

      case 'projects': {
        const items = s.items.filter((i) => !i.hidden)
        if (!items.length) break
        heading(s.title)
        for (const i of items) {
          out.push('', [i.name, i.role].filter(Boolean).join(' — '))
          const meta = [dateRange(i.start, i.end), displayUrl(i.link)].filter(Boolean).join(' | ')
          if (meta) out.push(meta)
          if (i.summary.trim()) out.push(plainText(i.summary).trim())
          bullets(i.bullets)
          if (i.tags.length) out.push(`Tech: ${i.tags.join(', ')}`)
        }
        break
      }

      case 'skills': {
        const groups = s.groups.filter((g) => !g.hidden && g.skills.length)
        if (!groups.length) break
        heading(s.title)
        for (const g of groups) out.push(g.label.trim() ? `${g.label}: ${g.skills.join(', ')}` : g.skills.join(', '))
        break
      }

      case 'custom': {
        const items = s.items.filter((i) => !i.hidden)
        if (!items.length) break
        heading(s.title)
        for (const i of items) {
          out.push('', [i.title, i.subtitle].filter(Boolean).join(' — '))
          const meta = [dateRange(i.start, i.end, i.current), i.location].filter(Boolean).join(' | ')
          if (meta) out.push(meta)
          if (i.summary.trim()) out.push(plainText(i.summary).trim())
          bullets(i.bullets)
        }
        break
      }

      default: {
        const items = s.items.filter((i) => !i.hidden)
        if (!items.length) break
        heading(s.title)
        for (const i of items) {
          const line = [i.title, i.subtitle, i.date].filter((x) => x.trim()).join(' — ')
          out.push(line + (i.description.trim() ? `: ${plainText(i.description).trim()}` : ''))
        }
        break
      }
    }
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}
