import { store } from './store'
import type { Profile, Resume, Section, SectionKind, Theme } from '@/lib/types'
import { newSection } from '@/lib/factory'

export function move<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export const setProfile = (patch: Partial<Profile>) =>
  store.updateResume((r) => { Object.assign(r.profile, patch) })

export const setTheme = (patch: Partial<Theme>) =>
  store.updateResume((r) => { Object.assign(r.theme, patch) })

export const setResumeName = (name: string) =>
  store.updateResume((r) => { r.name = name })

export const setTargetJob = (targetJob: string) =>
  store.updateResume((r) => { r.targetJob = targetJob })

/** Narrowed mutation on one section; the callback receives the live draft so
 *  callers can edit deeply nested items without rebuilding the tree. */
export function updateSection<T extends Section = Section>(id: string, recipe: (section: T) => void) {
  store.updateResume((r) => {
    const section = r.sections.find((s) => s.id === id) as T | undefined
    if (section) recipe(section)
  })
}

export const addSection = (kind: SectionKind, title?: string) =>
  store.updateResume((r) => { r.sections.push(newSection(kind, title)) })

export const removeSection = (id: string) =>
  store.updateResume((r) => { r.sections = r.sections.filter((s) => s.id !== id) })

export const duplicateSection = (id: string) =>
  store.updateResume((r) => {
    const index = r.sections.findIndex((s) => s.id === id)
    if (index === -1) return
    const copy = JSON.parse(JSON.stringify(r.sections[index])) as Section
    copy.id = `${copy.id}_c${Math.random().toString(36).slice(2, 6)}`
    copy.title = `${copy.title} (copy)`
    r.sections.splice(index + 1, 0, copy)
  })

export const toggleSection = (id: string) =>
  store.updateResume((r) => {
    const s = r.sections.find((x) => x.id === id)
    if (s) s.hidden = !s.hidden
  })

export const moveSection = (from: number, to: number) =>
  store.updateResume((r) => { r.sections = move(r.sections, from, to) })

/** Items live under different keys per section kind; this resolves the array
 *  so list operations can be written once. */
function itemsOf(section: Section): { id: string; hidden?: boolean }[] | null {
  if (section.kind === 'summary') return null
  if (section.kind === 'skills') return section.groups
  return section.items
}

export function moveItem(sectionId: string, from: number, to: number) {
  updateSection(sectionId, (s) => {
    const arr = itemsOf(s)
    if (!arr) return
    const next = move(arr, from, to)
    if (s.kind === 'skills') s.groups = next as typeof s.groups
    else if (s.kind !== 'summary') s.items = next as typeof s.items
  })
}

export function removeItem(sectionId: string, itemId: string) {
  updateSection(sectionId, (s) => {
    if (s.kind === 'summary') return
    if (s.kind === 'skills') s.groups = s.groups.filter((g) => g.id !== itemId)
    else s.items = (s.items as { id: string }[]).filter((i) => i.id !== itemId) as typeof s.items
  })
}

export function toggleItem(sectionId: string, itemId: string) {
  updateSection(sectionId, (s) => {
    const arr = itemsOf(s)
    const item = arr?.find((i) => i.id === itemId)
    if (item) item.hidden = !item.hidden
  })
}

export function exportJson(resume: Resume): string {
  return JSON.stringify({ ...resume, _format: 'resume-forge/1' }, null, 2)
}

export function download(filename: string, contents: string, type = 'application/json') {
  const blob = new Blob([contents], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
