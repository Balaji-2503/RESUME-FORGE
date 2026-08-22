import { ContactRow } from './contact'
import { SectionBody, isEmptySection, visibleSections, type TemplateProps } from './parts'

/** Numbered headings and a tinted rule; slightly denser leading. Aimed at
 *  engineering résumés with long skills and project lists. */
export default function Technical({ resume }: TemplateProps) {
  const { profile: p, theme } = resume
  const sections = visibleSections(resume).filter((s) => !isEmptySection(s))

  return (
    <>
      <header className="mb-[1.1em]">
        <div
          className="flex flex-wrap items-end justify-between gap-[0.5em] pb-[0.5em]"
          style={{ borderBottom: theme.showDividers ? `1px solid ${theme.text}22` : undefined }}
        >
          <div>
            <h1 className="text-[2em] font-bold leading-none tracking-tight">{p.fullName || 'Your Name'}</h1>
            {p.headline.trim() ? <p className="mt-[0.25em] text-[1em] opacity-80">{p.headline}</p> : null}
          </div>
          <ContactRow profile={p} showIcons={theme.showIcons} className="text-[0.9em]" />
        </div>
      </header>

      {sections.map((s, i) => (
        <section key={s.id} className="rf-section">
          <h2
            className={`rf-section-title mb-[0.45em] flex items-center gap-[0.55em] text-[0.98em] font-bold tracking-[0.06em] ${theme.uppercaseHeadings ? 'uppercase' : ''}`}
          >
            <span
              className="inline-flex h-[1.55em] w-[1.55em] items-center justify-center rounded text-[0.78em] font-bold tabular-nums"
              style={{ background: `${theme.accent}18`, color: theme.accent }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span style={{ color: theme.accent }}>{s.title}</span>
            {theme.showDividers ? <span className="h-px flex-1" style={{ background: `${theme.accent}2e` }} /> : null}
          </h2>
          <SectionBody section={s} theme={theme} />
        </section>
      ))}
    </>
  )
}
