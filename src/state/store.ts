import { useCallback, useSyncExternalStore } from 'react'
import { blankResume } from '@/lib/factory'
import { normaliseResume } from '@/lib/schema'
import type { AppState, Resume } from '@/lib/types'

const STORAGE_KEY = 'resume-forge:v1'
const HISTORY_LIMIT = 60

function initialState(): AppState {
  const first = blankResume('My résumé')
  return {
    resumes: [first],
    activeId: first.id,
    ui: { dark: false, zoom: 1, panel: 'content' },
  }
}

function load(): AppState {
  if (typeof localStorage === 'undefined') return initialState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    const resumes = Array.isArray(parsed.resumes) ? parsed.resumes.map(normaliseResume) : []
    if (!resumes.length) return initialState()
    const activeId = resumes.some((r) => r.id === parsed.activeId) ? parsed.activeId! : resumes[0].id
    return {
      resumes,
      activeId,
      ui: {
        dark: Boolean(parsed.ui?.dark),
        zoom: typeof parsed.ui?.zoom === 'number' ? parsed.ui.zoom : 1,
        panel: parsed.ui?.panel ?? 'content',
      },
    }
  } catch {
    return initialState()
  }
}

let state: AppState = load()
let past: AppState[] = []
let future: AppState[] = []
const listeners = new Set<() => void>()

let saveTimer: ReturnType<typeof setTimeout> | undefined
function persist() {
  if (typeof localStorage === 'undefined') return
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* quota or private mode — the app still works, it just won't remember */
    }
  }, 250)
}

function emit() {
  listeners.forEach((l) => l())
  persist()
}

function clone<T>(value: T): T {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T)
}

/** `history: false` for transient UI changes (zoom, panel) that shouldn't
 *  occupy an undo slot. */
function set(next: AppState, history = true) {
  if (history) {
    past.push(state)
    if (past.length > HISTORY_LIMIT) past.shift()
    future = []
  }
  state = next
  emit()
}

export const store = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  /** Mutate the active résumé through a draft copy. */
  updateResume(recipe: (draft: Resume) => void, history = true) {
    const next = clone(state)
    const draft = next.resumes.find((r) => r.id === next.activeId)
    if (!draft) return
    recipe(draft)
    draft.updatedAt = Date.now()
    set(next, history)
  },

  updateUI(patch: Partial<AppState['ui']>) {
    set({ ...state, ui: { ...state.ui, ...patch } }, false)
  },

  setActive(id: string) {
    if (!state.resumes.some((r) => r.id === id)) return
    set({ ...state, activeId: id }, false)
  },

  addResume(resume: Resume) {
    set({ ...state, resumes: [...state.resumes, resume], activeId: resume.id })
  },

  duplicateActive() {
    const active = state.resumes.find((r) => r.id === state.activeId)
    if (!active) return
    const copy = normaliseResume({ ...clone(active), id: undefined, name: `${active.name} (copy)` })
    copy.createdAt = Date.now()
    copy.updatedAt = Date.now()
    set({ ...state, resumes: [...state.resumes, copy], activeId: copy.id })
  },

  removeResume(id: string) {
    const remaining = state.resumes.filter((r) => r.id !== id)
    const resumes = remaining.length ? remaining : [blankResume('My résumé')]
    const activeId = resumes.some((r) => r.id === state.activeId) ? state.activeId : resumes[0].id
    set({ ...state, resumes, activeId })
  },

  replaceActive(resume: Resume) {
    const resumes = state.resumes.map((r) => (r.id === state.activeId ? { ...resume, id: r.id } : r))
    set({ ...state, resumes })
  },

  undo() {
    const prev = past.pop()
    if (!prev) return
    future.push(state)
    state = prev
    emit()
  },

  redo() {
    const next = future.pop()
    if (!next) return
    past.push(state)
    state = next
    emit()
  },

  canUndo: () => past.length > 0,
  canRedo: () => future.length > 0,
}

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    useCallback(() => selector(store.get()), [selector]),
    useCallback(() => selector(store.get()), [selector]),
  )
}

const selectActive = (s: AppState) => s.resumes.find((r) => r.id === s.activeId) ?? s.resumes[0]

export function useResume(): Resume {
  return useStore(selectActive)
}

export function useUI() {
  return useStore((s) => s.ui)
}
