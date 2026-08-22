import type { ReactNode } from 'react'
import { dateRange, displayUrl, href } from '@/lib/format'
import { renderInline } from '@/lib/richtext'
import { itemHasContent, sectionHasContent } from '@/lib/sections'
import type { Resume, Section, Theme } from '@/lib/types'

export interface TemplateProps {
  resume: Resume
}

export const visibleSections = (r: Resume): Section[] => r.sections.filter((s) => !s.hidden)

export const isEmptySection = (s: Section): boolean => !sectionHasContent(s)

/** Entries the user has started but not filled in are skipped, so a blank row
 *  in the editor never leaves a gap on the page. */
const printable = <T extends { hidden?: boolean }>(section: Section, items: T[]): T[] =>
  items.filter((item, index) => !item.hidden && itemHasContent(section, index))

export function Bullets({ items, theme, className = '' }: { items: string[]; theme: Theme; className?: string }) {
  const filled = items.filter((b) => b.trim())
  if (!filled.length) return null
  return (
    <ul className={`mt-[0.35em] space-y-[0.25em] ${className}`}>
      {filled.map((b, i) => (
        <li key={i} className="flex gap-[0.5em]">
          <span aria-hidden className="shrink-0 opacity-70" style={{ lineHeight: 'inherit' }}>
            {theme.bulletChar}
          </span>
          <span className="min-w-0 flex-1">{renderInline(b)}</span>
        </li>
      ))}
    </ul>
  )
}

export function Tags({ items, accent }: { items: string[]; accent: string }) {
  if (!items.length) return null
  return (
    <div className="mt-[0.35em] flex flex-wrap gap-[0.3em]">
      {items.map((t, i) => (
        <span
          key={i}
          className="rounded px-[0.45em] py-[0.1em] text-[0.85em] font-medium"
          style={{ background: `${accent}14`, color: accent }}
        >
          {t}
        </span>
      ))}
    </div>
  )
}

/** Right-hand meta column used by most templates for dates and locations. */
export function Meta({ children }: { children: ReactNode }) {
  if (!children) return null
  return <div className="shrink-0 pl-[1em] text-right text-[0.92em] tabular-nums opacity-75">{children}</div>
}

export function EntryHead({
  title, subtitle, meta, submeta, accent,
}: {
  title: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  submeta?: ReactNode
  accent: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-[0.5em]">
      <div className="min-w-0">
        <div className="font-semibold">{title}</div>
        {subtitle ? <div className="text-[0.95em]" style={{ color: accent }}>{subtitle}</div> : null}
      </div>
      {(meta || submeta) && (
        <Meta>
          {meta ? <div>{meta}</div> : null}
          {submeta ? <div className="text-[0.95em] opacity-90">{submeta}</div> : null}
        </Meta>
      )}
    </div>
  )
}

/** Renders any section's body. Templates own the heading and the frame; this
 *  owns the content, so adding a section kind updates every template at once.
 *  `narrow` switches the two-column rows to stacked, for sidebar columns. */
export function SectionBody({
  section, theme, narrow = false,
}: {
  section: Section
  theme: Theme
  narrow?: boolean
}) {
  const accent = theme.accent

  switch (section.kind) {
    case 'summary':
      return <p className="whitespace-pre-line">{renderInline(section.content)}</p>

    case 'experience':
      return (
        <div className="space-y-[0.75em]">
          {printable(section, section.items).map((item) => (
            <div key={item.id} className="rf-entry">
              <EntryHead
                accent={accent}
                title={item.role || item.company}
                subtitle={item.role && item.company ? item.company : undefined}
                meta={dateRange(item.start, item.end, item.current)}
                submeta={item.location}
              />
              {item.summary.trim() ? <p className="mt-[0.25em] italic opacity-90">{renderInline(item.summary)}</p> : null}
              <Bullets items={item.bullets} theme={theme} />
              <Tags items={item.tags} accent={accent} />
            </div>
          ))}
        </div>
      )

    case 'education':
      return (
        <div className="space-y-[0.6em]">
          {printable(section, section.items).map((item) => (
            <div key={item.id} className="rf-entry">
              <EntryHead
                accent={accent}
                title={item.degree || item.school}
                subtitle={item.degree && item.school ? item.school : undefined}
                meta={dateRange(item.start, item.end, item.current)}
                submeta={item.location}
              />
              {item.score.trim() ? <div className="mt-[0.15em] text-[0.95em] opacity-90">{item.score}</div> : null}
              <Bullets items={item.bullets} theme={theme} />
            </div>
          ))}
        </div>
      )

    case 'projects':
      return (
        <div className="space-y-[0.7em]">
          {printable(section, section.items).map((item) => (
            <div key={item.id} className="rf-entry">
              <EntryHead
                accent={accent}
                title={
                  <>
                    {item.name}
                    {item.link.trim() ? (
                      <>
                        {' '}
                        <a href={href(item.link)} className="rf-link text-[0.85em] font-normal opacity-70">
                          {displayUrl(item.link)}
                        </a>
                      </>
                    ) : null}
                  </>
                }
                subtitle={item.role}
                meta={dateRange(item.start, item.end)}
              />
              {item.summary.trim() ? <p className="mt-[0.2em]">{renderInline(item.summary)}</p> : null}
              <Bullets items={item.bullets} theme={theme} />
              <Tags items={item.tags} accent={accent} />
            </div>
          ))}
        </div>
      )

    case 'skills': {
      const groups = printable(section, section.groups).filter((g) => g.skills.length)
      if (section.display === 'inline') {
        return <p>{groups.flatMap((g) => g.skills).join(' · ')}</p>
      }
      if (section.display === 'chips') {
        return (
          <div className="flex flex-wrap gap-[0.35em]">
            {groups.flatMap((g) => g.skills).map((s, i) => (
              <span key={i} className="rounded px-[0.5em] py-[0.12em] text-[0.92em]" style={{ background: `${accent}14`, color: accent }}>
                {s}
              </span>
            ))}
          </div>
        )
      }
      if (narrow) {
        return (
          <div className="space-y-[0.45em]">
            {groups.map((g) => (
              <div key={g.id}>
                {g.label.trim() ? <div className="font-semibold">{g.label}</div> : null}
                <div>{g.skills.join(', ')}</div>
              </div>
            ))}
          </div>
        )
      }
      return (
        <div className="space-y-[0.3em]">
          {groups.map((g) => (
            <div key={g.id} className="flex gap-[0.5em]">
              {g.label.trim() ? <span className="shrink-0 font-semibold">{g.label}:</span> : null}
              <span className="min-w-0 flex-1">{g.skills.join(', ')}</span>
            </div>
          ))}
        </div>
      )
    }

    case 'custom':
      return (
        <div className="space-y-[0.7em]">
          {printable(section, section.items).map((item) => (
            <div key={item.id} className="rf-entry">
              <EntryHead
                accent={accent}
                title={item.title}
                subtitle={item.subtitle}
                meta={dateRange(item.start, item.end, item.current)}
                submeta={item.location}
              />
              {item.summary.trim() ? <p className="mt-[0.2em]">{renderInline(item.summary)}</p> : null}
              <Bullets items={item.bullets} theme={theme} />
            </div>
          ))}
        </div>
      )

    default:
      return (
        <div className="space-y-[0.4em]">
          {printable(section, section.items).map((item) => (
            <div key={item.id} className={`rf-entry gap-[0.5em] ${narrow ? '' : 'flex items-baseline justify-between'}`}>
              <div className="min-w-0">
                <span className="font-semibold">{item.title}</span>
                {item.subtitle.trim() ? <span className="opacity-85"> · {item.subtitle}</span> : null}
                {item.link.trim() ? (
                  <>
                    {' '}
                    <a href={href(item.link)} className="rf-link text-[0.88em] opacity-70">
                      {displayUrl(item.link)}
                    </a>
                  </>
                ) : null}
                {item.description.trim() ? <div className="opacity-90">{renderInline(item.description)}</div> : null}
              </div>
              {item.date.trim() ? (
                narrow ? <div className="text-[0.92em] opacity-75">{item.date}</div> : <Meta>{item.date}</Meta>
              ) : null}
            </div>
          ))}
        </div>
      )
  }
}
