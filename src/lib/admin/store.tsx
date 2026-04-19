'use client'

import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react'
import type { ContentMap } from './types'
import { pageDefinitions } from './definitions'

// ── Build initial content map from definitions ─────────────────────────────────
function buildInitialContent(): ContentMap {
  const map: ContentMap = {}
  for (const page of pageDefinitions) {
    map[page.id] = {}
    for (const section of page.sections) {
      map[page.id][section.id] = {}
      for (const field of section.fields) {
        map[page.id][section.id][field.id] = { tr: field.tr, en: field.en }
      }
    }
  }
  return map
}

// ── State & Actions ─────────────────────────────────────────────────────────────
interface State {
  content: ContentMap
  unsaved: boolean
  loading: boolean
  synced: boolean
}

type Action =
  | { type: 'UPDATE_FIELD'; pageId: string; sectionId: string; fieldId: string; tr: string; en: string }
  | { type: 'MARK_SAVED' }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'LOAD_FROM_DB'; data: Array<{ page_id: string; section_id: string; field_id: string; tr: string; en: string }> }
  | { type: 'RESET' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'UPDATE_FIELD': {
      const { pageId, sectionId, fieldId, tr, en } = action
      return {
        ...state,
        unsaved: true,
        content: {
          ...state.content,
          [pageId]: {
            ...state.content[pageId],
            [sectionId]: {
              ...state.content[pageId]?.[sectionId],
              [fieldId]: { tr, en },
            },
          },
        },
      }
    }
    case 'MARK_SAVED':
      return { ...state, unsaved: false }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    case 'LOAD_FROM_DB': {
      // Merge DB data on top of initial content.
      // Keep the definition default if the stored value is empty — prevents
      // a previous "save before editing" wipe from blanking all content.
      const newContent = { ...state.content }
      for (const row of action.data) {
        if (!newContent[row.page_id]) newContent[row.page_id] = {}
        if (!newContent[row.page_id][row.section_id]) newContent[row.page_id][row.section_id] = {}
        // Use nullish coalescing so empty strings from DB are preserved (for deletions)
        const existing = newContent[row.page_id][row.section_id][row.field_id]
        newContent[row.page_id][row.section_id][row.field_id] = {
          tr: row.tr ?? existing?.tr ?? '',
          en: row.en ?? existing?.en ?? '',
        }
      }
      return { ...state, content: newContent, synced: true, loading: false }
    }
    case 'RESET':
      return { content: buildInitialContent(), unsaved: false, loading: false, synced: false }
    default:
      return state
  }
}

// ── Context ─────────────────────────────────────────────────────────────────────
interface AdminContextValue {
  content: ContentMap
  unsaved: boolean
  loading: boolean
  getField: (pageId: string, sectionId: string, fieldId: string) => { tr: string; en: string }
  updateField: (pageId: string, sectionId: string, fieldId: string, tr: string, en: string) => void
  save: (filterPageId?: string) => Promise<void>
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    content: buildInitialContent(),
    unsaved: false,
    loading: true,
    synced: false,
  }))

  // Load content: try Supabase first, then fall back to localStorage
  useEffect(() => {
    async function loadContent() {
      // 1. Try Supabase API
      try {
        const res = await fetch('/api/admin/content')
        if (res.ok) {
          const { data } = await res.json()
          if (data && data.length > 0) {
            dispatch({ type: 'LOAD_FROM_DB', data })
            return
          }
        }
      } catch {}

      // 2. Fall back to localStorage
      try {
        const raw = localStorage.getItem('admin_content')
        if (raw) {
          const map = JSON.parse(raw) as Record<string, Record<string, Record<string, { tr: string; en: string }>>>
          const data: Array<{ page_id: string; section_id: string; field_id: string; tr: string; en: string }> = []
          for (const [pageId, sections] of Object.entries(map)) {
            for (const [sectionId, fields] of Object.entries(sections)) {
              for (const [fieldId, vals] of Object.entries(fields)) {
                data.push({ page_id: pageId, section_id: sectionId, field_id: fieldId, tr: vals.tr, en: vals.en })
              }
            }
          }
          if (data.length > 0) { dispatch({ type: 'LOAD_FROM_DB', data }); return }
        }
      } catch {}

      dispatch({ type: 'SET_LOADING', loading: false })
    }
    loadContent()
  }, [])

  const getField = useCallback((pageId: string, sectionId: string, fieldId: string) => {
    const stored = state.content[pageId]?.[sectionId]?.[fieldId]
    // If the field exists in the content map (even if empty), return it.
    // This allows intentional deletions (empty values) to work.
    if (stored !== undefined) return stored
    // Fall back to definitions so fields always show their default content
    const pageDef = pageDefinitions.find(p => p.id === pageId)
    const sec = pageDef?.sections.find(s => s.id === sectionId)
    const fld = sec?.fields.find(f => f.id === fieldId)
    return fld ? { tr: fld.tr, en: fld.en } : { tr: '', en: '' }
  }, [state.content])

  const updateField = useCallback((pageId: string, sectionId: string, fieldId: string, tr: string, en: string) => {
    dispatch({ type: 'UPDATE_FIELD', pageId, sectionId, fieldId, tr, en })
  }, [])

  const save = useCallback(async (filterPageId?: string) => {
    // Collect fields — when filterPageId is set, only save that page to avoid
    // overwriting other pages' DB content with stale definition defaults
    const fields: Array<{ page_id: string; section_id: string; field_id: string; tr: string; en: string }> = []

    for (const [pageId, sections] of Object.entries(state.content)) {
      if (filterPageId && pageId !== filterPageId) continue
      for (const [sectionId, fieldMap] of Object.entries(sections)) {
        for (const [fieldId, vals] of Object.entries(fieldMap)) {
          fields.push({
            page_id: pageId,
            section_id: sectionId,
            field_id: fieldId,
            tr: vals.tr,
            en: vals.en,
          })
        }
      }
    }

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      })

      if (res.ok) {
        dispatch({ type: 'MARK_SAVED' })
      } else {
        console.error('Save failed:', await res.json())
        // Fallback to localStorage
        try {
          localStorage.setItem('admin_content', JSON.stringify(state.content))
        } catch {}
        dispatch({ type: 'MARK_SAVED' })
      }
    } catch {
      // Offline fallback
      try {
        localStorage.setItem('admin_content', JSON.stringify(state.content))
      } catch {}
      dispatch({ type: 'MARK_SAVED' })
    }
  }, [state.content])

  return (
    <AdminContext.Provider value={{ content: state.content, unsaved: state.unsaved, loading: state.loading, getField, updateField, save }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
