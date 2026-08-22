import { uid } from './id'
import type {
  CustomItem, EducationItem, ExperienceItem, ProjectItem, Resume, Section,
  SectionKind, SimpleItem, SkillGroup, Theme,
} from './types'

export const DEFAULT_THEME: Theme = {
  template: 'classic',
  accent: '#1d45f5',
  text: '#1a1d24',
  bodyFont: 'inter',
  headingFont: 'inter',
  fontSize: 10.5,
  lineHeight: 1.42,
  sectionGap: 5,
  pageMargin: 14,
  paper: 'a4',
  headerAlign: 'left',
  showIcons: true,
  showDividers: true,
  uppercaseHeadings: true,
  bulletChar: '•',
}

export const SECTION_LABELS: Record<SectionKind, string> = {
  summary: 'Professional Summary',
  experience: 'Experience',
  education: 'Education',
  projects: 'Projects',
  skills: 'Skills',
  certifications: 'Certifications',
  awards: 'Awards & Honours',
  publications: 'Publications',
  volunteering: 'Volunteering',
  languages: 'Languages',
  interests: 'Interests',
  custom: 'Custom Section',
}

export function newExperience(): ExperienceItem {
  return { id: uid('exp'), role: '', company: '', location: '', start: '', end: '', current: false, summary: '', bullets: [''], tags: [] }
}
export function newEducation(): EducationItem {
  return { id: uid('edu'), degree: '', school: '', location: '', start: '', end: '', current: false, score: '', bullets: [] }
}
export function newProject(): ProjectItem {
  return { id: uid('prj'), name: '', role: '', link: '', start: '', end: '', summary: '', bullets: [''], tags: [] }
}
export function newSkillGroup(): SkillGroup {
  return { id: uid('skg'), label: '', skills: [] }
}
export function newSimple(): SimpleItem {
  return { id: uid('itm'), title: '', subtitle: '', date: '', link: '', description: '' }
}
export function newCustomItem(): CustomItem {
  return { id: uid('cst'), title: '', subtitle: '', location: '', start: '', end: '', current: false, summary: '', bullets: [''] }
}

export function newSection(kind: SectionKind, title?: string): Section {
  const base = { id: uid('sec'), title: title ?? SECTION_LABELS[kind], hidden: false }
  switch (kind) {
    case 'summary': return { ...base, kind, content: '' }
    case 'experience': return { ...base, kind, items: [newExperience()] }
    case 'education': return { ...base, kind, items: [newEducation()] }
    case 'projects': return { ...base, kind, items: [newProject()] }
    case 'skills': return { ...base, kind, groups: [newSkillGroup()], display: 'grouped' }
    case 'custom': return { ...base, kind, items: [newCustomItem()] }
    default: return { ...base, kind, items: [newSimple()] }
  }
}

export function blankResume(name = 'Untitled résumé'): Resume {
  const now = Date.now()
  return {
    id: uid('res'),
    name,
    createdAt: now,
    updatedAt: now,
    targetJob: '',
    theme: { ...DEFAULT_THEME },
    profile: {
      fullName: '', headline: '', email: '', phone: '', location: '',
      website: '', linkedin: '', github: '', extras: [],
    },
    sections: [
      newSection('summary'),
      newSection('experience'),
      newSection('education'),
      newSection('skills'),
      newSection('projects'),
    ],
  }
}
