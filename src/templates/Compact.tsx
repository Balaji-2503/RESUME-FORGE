import { ContactRow } from './contact'
import { SectionBody, isEmptySection, visibleSections, type TemplateProps } from './parts'

/** Headings sit in a narrow left gutter, freeing vertical space. Best when you
 *  are fighting to keep a dense history on one page. */
export default function Compact({ resume }: TemplateProps) {
  const { profile: p, theme } = resume
  const sections = visibleSections(resume)

  return (
    <>
      <header
        className="mb-[1em] pb-[0.6em]"
        style={{ borderBottom: theme.showDividers ? `2px solid ${theme.accent}` : undefined }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-[0.4em]">
          <h1 className="text-[1.9em] font-bold leading-none tracking-tight">{p.fullName || 'Your Name'}</h1>
          {p.headline.trim() ? (
            <p className="text-[1em] font-medium" style={{ color: theme.accent }}>{p.headline}</p>
          ) : null}
        </div>
        <ContactRow profile={p} showIcons={theme.showIcons} className="mt-[0.4em] text-[0.92em]" />
      </header>

      {sections.map((s) =>
        isEmptySection(s) ? null : (
          <section key={s.id} className="rf-section flex gap-[1em]">
            <h2
              // Width is in heading-ems, so the gutter scales with the heading
              // and the longest stock label ("Professional Summary") always fits.
              className={`rf-section-title w-[11em] shrink-0 break-words pr-[0.6em] pt-[0.1em] text-[0.88em] font-bold leading-tight tracking-[0.07em] ${theme.uppercaseHeadings ? 'uppercase' : ''}`}
              style={{ color: theme.accent }}
            >
              {s.title}
            </h2>
            <div className="min-w-0 flex-1">
              <SectionBody section={s} theme={theme} />
            </div>
          </section>
        ),
      )}
    </>
  )
}
