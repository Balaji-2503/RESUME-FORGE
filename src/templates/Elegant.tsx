import { ContactRow } from './contact'
import { SectionBody, isEmptySection, visibleSections, type TemplateProps } from './parts'

/** Centred masthead with letter-spaced small-caps headings. Reads well for
 *  consulting, law, academia and other conservative fields. */
export default function Elegant({ resume }: TemplateProps) {
  const { profile: p, theme } = resume
  const sections = visibleSections(resume)

  return (
    <>
      <header className="mb-[1.3em] text-center">
        <h1 className="text-[2.15em] font-normal tracking-[0.13em] uppercase">{p.fullName || 'Your Name'}</h1>
        {theme.showDividers ? (
          <div className="mx-auto my-[0.5em] h-px w-[38%]" style={{ background: `${theme.accent}88` }} />
        ) : null}
        {p.headline.trim() ? (
          <p className="text-[1.02em] italic tracking-wide" style={{ color: theme.accent }}>{p.headline}</p>
        ) : null}
        <ContactRow profile={p} showIcons={false} align="center" separator="|" className="mt-[0.45em] text-[0.92em]" />
      </header>

      {sections.map((s) =>
        isEmptySection(s) ? null : (
          <section key={s.id} className="rf-section">
            <h2 className="rf-section-title mb-[0.5em] text-center text-[0.95em] font-semibold uppercase tracking-[0.22em]">
              <span className="inline-flex w-full items-center gap-[0.8em]">
                {theme.showDividers ? <span className="h-px flex-1" style={{ background: `${theme.accent}44` }} /> : null}
                <span style={{ color: theme.accent }}>{s.title}</span>
                {theme.showDividers ? <span className="h-px flex-1" style={{ background: `${theme.accent}44` }} /> : null}
              </span>
            </h2>
            <SectionBody section={s} theme={theme} />
          </section>
        ),
      )}
    </>
  )
}
