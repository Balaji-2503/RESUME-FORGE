import { ContactStack } from './contact'
import { SectionBody, isEmptySection, visibleSections, type TemplateProps } from './parts'
import type { Section } from '@/lib/types'

/** Two column: a tinted sidebar carries contact and the short sections, the
 *  main column carries the narrative ones. */
const SIDEBAR_KINDS = new Set<Section['kind']>(['skills', 'languages', 'interests', 'certifications', 'awards'])

export default function Modern({ resume }: TemplateProps) {
  const { profile: p, theme } = resume
  const sections = visibleSections(resume).filter((s) => !isEmptySection(s))
  const aside = sections.filter((s) => SIDEBAR_KINDS.has(s.kind))
  const main = sections.filter((s) => !SIDEBAR_KINDS.has(s.kind))

  const heading = (title: string, onDark: boolean) => (
    <h2
      className={`rf-section-title mb-[0.4em] text-[1em] font-bold tracking-[0.09em] ${theme.uppercaseHeadings ? 'uppercase' : ''}`}
      style={{ color: onDark ? theme.accent : theme.accent }}
    >
      {title}
      {theme.showDividers ? (
        <span className="mt-[0.25em] block h-px w-full" style={{ background: `${theme.accent}44` }} />
      ) : null}
    </h2>
  )

  return (
    <div className="flex gap-[1.4em]">
      <aside className="rf-sidebar-band w-[34%] shrink-0">
        <h1 className="text-[1.85em] font-bold leading-[1.1] tracking-tight">{p.fullName || 'Your Name'}</h1>
        {p.headline.trim() ? (
          <p className="mt-[0.2em] text-[1em] font-medium" style={{ color: theme.accent }}>{p.headline}</p>
        ) : null}

        <div className="mt-[0.9em] text-[0.9em]">
          <ContactStack profile={p} showIcons={theme.showIcons} />
        </div>

        {aside.map((s) => (
          <section key={s.id} className="rf-section mt-[1.1em] text-[0.96em]">
            {heading(s.title, true)}
            <SectionBody section={s} theme={theme} narrow />
          </section>
        ))}
      </aside>

      <div
        className="min-w-0 flex-1"
        style={{ borderLeft: theme.showDividers ? `1px solid ${theme.accent}26` : undefined, paddingLeft: theme.showDividers ? '1.3em' : 0 }}
      >
        {main.map((s) => (
          <section key={s.id} className="rf-section">
            {heading(s.title, false)}
            <SectionBody section={s} theme={theme} />
          </section>
        ))}
      </div>
    </div>
  )
}
