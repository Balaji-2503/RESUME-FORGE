import type { ComponentType } from 'react'
import type { TemplateId } from '@/lib/types'
import type { TemplateProps } from './parts'
import Classic from './Classic'
import Compact from './Compact'
import Elegant from './Elegant'
import Modern from './Modern'
import Technical from './Technical'

export interface TemplateMeta {
  id: TemplateId
  name: string
  blurb: string
  component: ComponentType<TemplateProps>
  /** Sensible defaults applied when the template is picked. */
  suggests: { headingFont: string; bodyFont: string; uppercaseHeadings: boolean }
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'classic', name: 'Classic', component: Classic,
    blurb: 'One column, ruled headings. The safest choice for applicant tracking systems.',
    suggests: { headingFont: 'inter', bodyFont: 'inter', uppercaseHeadings: true },
  },
  {
    id: 'modern', name: 'Modern', component: Modern,
    blurb: 'Sidebar for contact and skills, main column for your story.',
    suggests: { headingFont: 'inter', bodyFont: 'inter', uppercaseHeadings: true },
  },
  {
    id: 'compact', name: 'Compact', component: Compact,
    blurb: 'Headings in a left gutter. Buys you vertical space when the page is tight.',
    suggests: { headingFont: 'inter', bodyFont: 'inter', uppercaseHeadings: true },
  },
  {
    id: 'elegant', name: 'Elegant', component: Elegant,
    blurb: 'Centred serif masthead. Suits law, consulting and academia.',
    suggests: { headingFont: 'garamond', bodyFont: 'garamond', uppercaseHeadings: true },
  },
  {
    id: 'technical', name: 'Technical', component: Technical,
    blurb: 'Numbered sections and a dense grid, built for engineering résumés.',
    suggests: { headingFont: 'inter', bodyFont: 'inter', uppercaseHeadings: true },
  },
]

export function templateById(id: TemplateId): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
}
