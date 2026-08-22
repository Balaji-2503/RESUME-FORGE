/** Core data model for Resume Forge. Everything is plain JSON so a résumé can be
 *  exported, versioned, diffed and re-imported without loss. */

export type SectionKind =
  | 'summary'
  | 'experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'certifications'
  | 'awards'
  | 'publications'
  | 'volunteering'
  | 'languages'
  | 'interests'
  | 'custom'

export interface Profile {
  fullName: string
  headline: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
  github: string
  /** Free-form extra contact rows, e.g. "Portfolio · dribbble.com/x". */
  extras: LinkItem[]
}

export interface LinkItem {
  id: string
  label: string
  value: string
}

export interface ExperienceItem {
  id: string
  role: string
  company: string
  location: string
  start: string
  end: string
  current: boolean
  summary: string
  bullets: string[]
  tags: string[]
  hidden?: boolean
}

export interface EducationItem {
  id: string
  degree: string
  school: string
  location: string
  start: string
  end: string
  current: boolean
  score: string
  bullets: string[]
  hidden?: boolean
}

export interface ProjectItem {
  id: string
  name: string
  role: string
  link: string
  start: string
  end: string
  summary: string
  bullets: string[]
  tags: string[]
  hidden?: boolean
}

export interface SkillGroup {
  id: string
  label: string
  /** Stored as a list so templates can render chips or comma runs. */
  skills: string[]
  hidden?: boolean
}

/** Shared shape for the lighter-weight sections
 *  (certifications, awards, publications, volunteering, languages, interests). */
export interface SimpleItem {
  id: string
  title: string
  subtitle: string
  date: string
  link: string
  description: string
  hidden?: boolean
}

export interface CustomItem {
  id: string
  title: string
  subtitle: string
  location: string
  start: string
  end: string
  current: boolean
  summary: string
  bullets: string[]
  hidden?: boolean
}

export interface SectionBase {
  id: string
  kind: SectionKind
  title: string
  hidden: boolean
}

export interface SummarySection extends SectionBase { kind: 'summary'; content: string }
export interface ExperienceSection extends SectionBase { kind: 'experience'; items: ExperienceItem[] }
export interface EducationSection extends SectionBase { kind: 'education'; items: EducationItem[] }
export interface ProjectsSection extends SectionBase { kind: 'projects'; items: ProjectItem[] }
export interface SkillsSection extends SectionBase {
  kind: 'skills'
  groups: SkillGroup[]
  display: 'chips' | 'inline' | 'grouped'
}
export interface SimpleSection extends SectionBase {
  kind: 'certifications' | 'awards' | 'publications' | 'volunteering' | 'languages' | 'interests'
  items: SimpleItem[]
}
export interface CustomSection extends SectionBase { kind: 'custom'; items: CustomItem[] }

export type Section =
  | SummarySection
  | ExperienceSection
  | EducationSection
  | ProjectsSection
  | SkillsSection
  | SimpleSection
  | CustomSection

export type TemplateId = 'classic' | 'modern' | 'compact' | 'elegant' | 'technical'

export interface Theme {
  template: TemplateId
  accent: string
  text: string
  /** Body font stack key, resolved in lib/fonts.ts */
  bodyFont: string
  headingFont: string
  fontSize: number      // pt, applies to body text
  lineHeight: number    // unitless multiplier
  sectionGap: number    // mm between sections
  pageMargin: number    // mm
  paper: 'a4' | 'letter'
  headerAlign: 'left' | 'center'
  showIcons: boolean
  showDividers: boolean
  uppercaseHeadings: boolean
  bulletChar: '•' | '–' | '▸' | '·'
}

export interface Resume {
  id: string
  name: string
  updatedAt: number
  createdAt: number
  profile: Profile
  sections: Section[]
  theme: Theme
  /** Job description used by the match analyser; kept with the résumé so a
   *  tailored variant remembers what it was tailored for. */
  targetJob: string
}

export interface AppState {
  resumes: Resume[]
  activeId: string
  ui: {
    dark: boolean
    zoom: number
    panel: 'content' | 'design' | 'review'
  }
}
