import { DEFAULT_THEME, SECTION_LABELS, blankResume } from './factory'
import { uid } from './id'
import type {
  CustomItem, EducationItem, ExperienceItem, ProjectItem, Profile, Resume,
  Section, SectionKind, SimpleItem, SkillGroup, Theme,
} from './types'

const KINDS: SectionKind[] = [
  'summary', 'experience', 'education', 'projects', 'skills', 'certifications',
  'awards', 'publications', 'volunteering', 'languages', 'interests', 'custom',
]

const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback)
const bool = (v: unknown, fallback = false): boolean => (typeof v === 'boolean' ? v : fallback)
const num = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const strList = (v: unknown): string[] => list(v).filter((x): x is string => typeof x === 'string')

function profileOf(v: unknown): Profile {
  const p = (v ?? {}) as Record<string, unknown>
  return {
    fullName: str(p.fullName), headline: str(p.headline), email: str(p.email),
    phone: str(p.phone), location: str(p.location), website: str(p.website),
    linkedin: str(p.linkedin), github: str(p.github),
    extras: list(p.extras).map((e) => {
      const x = (e ?? {}) as Record<string, unknown>
      return { id: str(x.id) || uid('lnk'), label: str(x.label), value: str(x.value) }
    }),
  }
}

function themeOf(v: unknown): Theme {
  const t = (v ?? {}) as Record<string, unknown>
  const template = ['classic', 'modern', 'compact', 'elegant', 'technical'].includes(str(t.template))
    ? (t.template as Theme['template'])
    : DEFAULT_THEME.template
  const bullet = ['•', '–', '▸', '·'].includes(str(t.bulletChar))
    ? (t.bulletChar as Theme['bulletChar'])
    : DEFAULT_THEME.bulletChar
  return {
    template,
    accent: str(t.accent, DEFAULT_THEME.accent),
    text: str(t.text, DEFAULT_THEME.text),
    bodyFont: str(t.bodyFont, DEFAULT_THEME.bodyFont),
    headingFont: str(t.headingFont, DEFAULT_THEME.headingFont),
    fontSize: Math.min(14, Math.max(8, num(t.fontSize, DEFAULT_THEME.fontSize))),
    lineHeight: Math.min(2, Math.max(1, num(t.lineHeight, DEFAULT_THEME.lineHeight))),
    sectionGap: Math.min(14, Math.max(0, num(t.sectionGap, DEFAULT_THEME.sectionGap))),
    pageMargin: Math.min(30, Math.max(6, num(t.pageMargin, DEFAULT_THEME.pageMargin))),
    paper: t.paper === 'letter' ? 'letter' : 'a4',
    headerAlign: t.headerAlign === 'center' ? 'center' : 'left',
    showIcons: bool(t.showIcons, DEFAULT_THEME.showIcons),
    showDividers: bool(t.showDividers, DEFAULT_THEME.showDividers),
    uppercaseHeadings: bool(t.uppercaseHeadings, DEFAULT_THEME.uppercaseHeadings),
    bulletChar: bullet,
  }
}

function experienceOf(v: unknown): ExperienceItem {
  const i = (v ?? {}) as Record<string, unknown>
  return {
    id: str(i.id) || uid('exp'), role: str(i.role), company: str(i.company), location: str(i.location),
    start: str(i.start), end: str(i.end), current: bool(i.current), summary: str(i.summary),
    bullets: strList(i.bullets), tags: strList(i.tags), hidden: bool(i.hidden),
  }
}
function educationOf(v: unknown): EducationItem {
  const i = (v ?? {}) as Record<string, unknown>
  return {
    id: str(i.id) || uid('edu'), degree: str(i.degree), school: str(i.school), location: str(i.location),
    start: str(i.start), end: str(i.end), current: bool(i.current), score: str(i.score),
    bullets: strList(i.bullets), hidden: bool(i.hidden),
  }
}
function projectOf(v: unknown): ProjectItem {
  const i = (v ?? {}) as Record<string, unknown>
  return {
    id: str(i.id) || uid('prj'), name: str(i.name), role: str(i.role), link: str(i.link),
    start: str(i.start), end: str(i.end), summary: str(i.summary),
    bullets: strList(i.bullets), tags: strList(i.tags), hidden: bool(i.hidden),
  }
}
function skillGroupOf(v: unknown): SkillGroup {
  const g = (v ?? {}) as Record<string, unknown>
  return { id: str(g.id) || uid('skg'), label: str(g.label), skills: strList(g.skills), hidden: bool(g.hidden) }
}
function simpleOf(v: unknown): SimpleItem {
  const i = (v ?? {}) as Record<string, unknown>
  return {
    id: str(i.id) || uid('itm'), title: str(i.title), subtitle: str(i.subtitle),
    date: str(i.date), link: str(i.link), description: str(i.description), hidden: bool(i.hidden),
  }
}
function customOf(v: unknown): CustomItem {
  const i = (v ?? {}) as Record<string, unknown>
  return {
    id: str(i.id) || uid('cst'), title: str(i.title), subtitle: str(i.subtitle), location: str(i.location),
    start: str(i.start), end: str(i.end), current: bool(i.current), summary: str(i.summary),
    bullets: strList(i.bullets), hidden: bool(i.hidden),
  }
}

function sectionOf(v: unknown): Section | null {
  const s = (v ?? {}) as Record<string, unknown>
  const kind = str(s.kind) as SectionKind
  if (!KINDS.includes(kind)) return null
  const base = { id: str(s.id) || uid('sec'), title: str(s.title) || SECTION_LABELS[kind], hidden: bool(s.hidden) }
  switch (kind) {
    case 'summary': return { ...base, kind, content: str(s.content) }
    case 'experience': return { ...base, kind, items: list(s.items).map(experienceOf) }
    case 'education': return { ...base, kind, items: list(s.items).map(educationOf) }
    case 'projects': return { ...base, kind, items: list(s.items).map(projectOf) }
    case 'skills': return {
      ...base, kind,
      groups: list(s.groups).map(skillGroupOf),
      display: ['chips', 'inline', 'grouped'].includes(str(s.display)) ? (s.display as 'chips' | 'inline' | 'grouped') : 'grouped',
    }
    case 'custom': return { ...base, kind, items: list(s.items).map(customOf) }
    default: return { ...base, kind, items: list(s.items).map(simpleOf) }
  }
}

/** Accepts anything and returns a résumé that satisfies the type contract.
 *  Used for localStorage rehydration and for user-supplied JSON imports. */
export function normaliseResume(v: unknown): Resume {
  const r = (v ?? {}) as Record<string, unknown>
  const sections = list(r.sections).map(sectionOf).filter((s): s is Section => s !== null)
  return {
    id: str(r.id) || uid('res'),
    name: str(r.name) || 'Untitled résumé',
    createdAt: num(r.createdAt, Date.now()),
    updatedAt: num(r.updatedAt, Date.now()),
    targetJob: str(r.targetJob),
    profile: profileOf(r.profile),
    theme: themeOf(r.theme),
    sections: sections.length ? sections : blankResume().sections,
  }
}

export function isResumeLike(v: unknown): boolean {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  return 'profile' in r || 'sections' in r
}
