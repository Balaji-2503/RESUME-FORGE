import type { Section } from './types'

const filled = (...values: string[]) => values.some((v) => v.trim().length > 0)
const anyBullet = (bullets: string[]) => bullets.some((b) => b.trim().length > 0)

/** Whether an entry carries enough to be worth printing. A freshly added row
 *  the user hasn't filled in yet must not put an empty heading on the page. */
export function itemHasContent(section: Section, index: number): boolean {
  switch (section.kind) {
    case 'summary':
      return false
    case 'experience': {
      const i = section.items[index]
      return !!i && (filled(i.role, i.company, i.summary) || anyBullet(i.bullets))
    }
    case 'education': {
      const i = section.items[index]
      return !!i && (filled(i.degree, i.school, i.score) || anyBullet(i.bullets))
    }
    case 'projects': {
      const i = section.items[index]
      return !!i && (filled(i.name, i.role, i.summary, i.link) || anyBullet(i.bullets))
    }
    case 'skills': {
      const g = section.groups[index]
      return !!g && g.skills.length > 0
    }
    case 'custom': {
      const i = section.items[index]
      return !!i && (filled(i.title, i.subtitle, i.summary) || anyBullet(i.bullets))
    }
    default: {
      const i = section.items[index]
      return !!i && filled(i.title, i.subtitle, i.description, i.date)
    }
  }
}

/** True when the section would render something. Templates use it to skip
 *  headings, and the review uses it to tell you a section won't print. */
export function sectionHasContent(section: Section): boolean {
  if (section.kind === 'summary') return section.content.trim().length > 0
  const list: { hidden?: boolean }[] = section.kind === 'skills' ? section.groups : section.items
  return list.some((item, index) => !item.hidden && itemHasContent(section, index))
}
