import { Github, Globe, Linkedin, Mail, MapPin, Phone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { displayUrl, href } from '@/lib/format'
import type { Profile } from '@/lib/types'

export interface ContactEntry {
  key: string
  icon: LucideIcon
  text: string
  url: string
}

export function contactEntries(p: Profile): ContactEntry[] {
  const out: ContactEntry[] = []
  if (p.email.trim()) out.push({ key: 'email', icon: Mail, text: p.email.trim(), url: `mailto:${p.email.trim()}` })
  if (p.phone.trim()) out.push({ key: 'phone', icon: Phone, text: p.phone.trim(), url: `tel:${p.phone.replace(/[^\d+]/g, '')}` })
  if (p.location.trim()) out.push({ key: 'location', icon: MapPin, text: p.location.trim(), url: '' })
  if (p.website.trim()) out.push({ key: 'website', icon: Globe, text: displayUrl(p.website), url: href(p.website) })
  if (p.linkedin.trim()) out.push({ key: 'linkedin', icon: Linkedin, text: displayUrl(p.linkedin), url: href(p.linkedin) })
  if (p.github.trim()) out.push({ key: 'github', icon: Github, text: displayUrl(p.github), url: href(p.github) })
  for (const e of p.extras) {
    if (!e.value.trim()) continue
    out.push({ key: e.id, icon: Globe, text: e.label.trim() ? `${e.label}: ${displayUrl(e.value)}` : displayUrl(e.value), url: href(e.value) })
  }
  return out
}

export function ContactRow({
  profile, showIcons, align = 'left', separator = '·', className = '',
}: {
  profile: Profile
  showIcons: boolean
  align?: 'left' | 'center'
  separator?: string
  className?: string
}) {
  const entries = contactEntries(profile)
  if (!entries.length) return null
  return (
    <div className={`flex flex-wrap items-center gap-x-[0.6em] gap-y-[0.2em] ${align === 'center' ? 'justify-center' : ''} ${className}`}>
      {entries.map((e, i) => (
        <span key={e.key} className="inline-flex items-center gap-[0.3em]">
          {i > 0 && !showIcons ? <span aria-hidden className="opacity-45">{separator}</span> : null}
          {showIcons ? <e.icon className="h-[1em] w-[1em] shrink-0 opacity-70" strokeWidth={2} /> : null}
          {e.url ? <a href={e.url} className="rf-link">{e.text}</a> : <span>{e.text}</span>}
        </span>
      ))}
    </div>
  )
}

/** Stacked variant for sidebar templates. */
export function ContactStack({ profile, showIcons }: { profile: Profile; showIcons: boolean }) {
  const entries = contactEntries(profile)
  if (!entries.length) return null
  return (
    <div className="space-y-[0.3em]">
      {entries.map((e) => (
        <div key={e.key} className="flex items-start gap-[0.4em]">
          {showIcons ? <e.icon className="mt-[0.2em] h-[1em] w-[1em] shrink-0 opacity-70" strokeWidth={2} /> : null}
          {e.url ? <a href={e.url} className="rf-link min-w-0" style={{ overflowWrap: 'anywhere' }}>{e.text}</a> : <span className="min-w-0">{e.text}</span>}
        </div>
      ))}
    </div>
  )
}
