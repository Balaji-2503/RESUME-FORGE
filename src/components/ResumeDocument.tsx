import type { CSSProperties } from 'react'
import { fontStack } from '@/lib/fonts'
import { PAPER } from '@/lib/paper'
import { templateById } from '@/templates'
import type { Resume } from '@/lib/types'

/** Renders the résumé at true page width. `mode` only affects the frame:
 *  the content and its metrics are identical in preview and in print. */
export default function ResumeDocument({
  resume, mode = 'screen', className = '',
}: {
  resume: Resume
  mode?: 'screen' | 'print'
  className?: string
}) {
  const { theme } = resume
  const paper = PAPER[theme.paper]
  const Template = templateById(theme.template).component

  const style = {
    '--rf-text': theme.text,
    '--rf-body-font': fontStack(theme.bodyFont),
    '--rf-heading-font': fontStack(theme.headingFont),
    '--rf-font-size': `${theme.fontSize}pt`,
    '--rf-line-height': String(theme.lineHeight),
    '--rf-section-gap': `${theme.sectionGap}mm`,
    width: mode === 'screen' ? `${paper.w}mm` : '100%',
    minHeight: mode === 'screen' ? `${paper.h}mm` : undefined,
    padding: `${theme.pageMargin}mm`,
  } as CSSProperties

  return (
    <article className={`rf-doc ${className}`} style={style} data-template={theme.template}>
      <Template resume={resume} />
    </article>
  )
}
