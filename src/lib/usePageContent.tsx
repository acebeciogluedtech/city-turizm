'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useLanguage } from '@/lib/language'
import type { BilingualContent } from '@/lib/content'

interface ContentRow { section_id: string; field_id: string; tr: string; en: string }

interface PageContentContextType {
  v: (sectionId: string, fieldId: string, fallback?: string) => string
  lang: string
  en: boolean
}

const PageContentContext = createContext<PageContentContextType>({
  v: (_s, _f, fallback = '') => fallback,
  lang: 'tr',
  en: false,
})

export function usePageContent() {
  return useContext(PageContentContext)
}

/**
 * Provider that wraps a page with server-fetched bilingual content.
 * The v() function picks the right language based on current locale.
 * No flash because data is available on first render.
 */
export function PageContentProvider({
  children,
  initialContent,
  pageId,
}: {
  children: React.ReactNode
  initialContent?: BilingualContent
  pageId?: string
}) {
  const { lang } = useLanguage()
  const en = lang === 'en'

  // If no initialContent, fall back to client-side fetch (legacy support)
  const [clientContent, setClientContent] = useState<ContentRow[]>([])
  
  useEffect(() => {
    if (!initialContent && pageId) {
      fetch(`/api/admin/content?pageId=${pageId}`)
        .then(r => r.json())
        .then(d => setClientContent(d.data || []))
        .catch(() => {})
    }
  }, [initialContent, pageId])

  function v(sectionId: string, fieldId: string, fallback = ''): string {
    // Use server-fetched bilingual content if available
    if (initialContent) {
      const entry = initialContent[`${sectionId}.${fieldId}`]
      if (!entry) return fallback
      const val = lang === 'tr' ? entry.tr : (entry.en || entry.tr)
      return val || fallback
    }
    // Fallback to client-fetched content
    const row = clientContent.find(r => r.section_id === sectionId && r.field_id === fieldId)
    if (!row) return fallback
    const val = lang === 'en' ? (row.en || row.tr) : (row.tr || row.en)
    return val || fallback
  }

  return (
    <PageContentContext.Provider value={{ v, lang, en }}>
      {children}
    </PageContentContext.Provider>
  )
}
