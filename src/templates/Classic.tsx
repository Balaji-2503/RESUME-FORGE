import { ContactRow } from './contact'
import { SectionBody, isEmptySection, visibleSections, type TemplateProps } from './parts'

/** Single column, ruled headings. The safest thing to put in front of an ATS. */
export default function Classic({ resume }: TemplateProps) {
  const { profile: p, theme } = resume
  const sections = visibleSections(resume)
  const center = theme.headerAlign === 'center'

  return (
    <>
      <header className={`mb-[1.1em] ${center ? 'text-center' : ''}`}>
        <h1 className="text-[2.1em] font-bold tracking-tight">{p.fullName || 'Your Name'}</h1>
        {p.headline.trim() ? (
          <p className="mt-[0.1em] text-[1.08em]" style={{ color: theme.accent }}>{p.headline}</p>
        ) : null}
        <ContactRow profile={p} showIcons={theme.showIcons} align={theme.headerAlign} className="mt-[0.45em] text-[0.95em]" />
      </header>

      {sections.map((s) =>
        isEmptySection(s) ? null : (
          <section key={s.id} className="rf-section">
            <h2
              className={`rf-section-title mb-[0.45em] pb-[0.15em] text-[1.02em] font-bold tracking-[0.08em] ${theme.uppercaseHeadings ? 'uppercase' : ''}`}
              style={{
                color: theme.accent,
                borderBottom: theme.showDividers ? `1px solid ${theme.accent}55` : undefined,
              }}
            >
              {s.title}
            </h2>
            <SectionBody section={s} theme={theme} />
          </section>
        ),
      )}
    </>
  )
}
