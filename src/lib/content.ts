import { supabaseAdmin } from './supabase-admin'
import { pageDefinitions } from './admin/definitions'
import { unstable_cache } from 'next/cache'

export type SiteContent = Record<string, Record<string, { tr: string; en: string }>>

// ── Cache TTL constants ────────────────────────────────────────────────────────
// Content is cached for 5 minutes on the server — after that, the next request
// triggers a background revalidation (stale-while-revalidate pattern).
// Pages use `revalidate = 300` so Vercel CDN also caches for 5 minutes.
const CONTENT_REVALIDATE = 300  // 5 minutes

// ── Raw Supabase fetcher ───────────────────────────────────────────────────────
async function _fetchPageRows(pageId: string) {
  const { data, error } = await supabaseAdmin
    .from('page_content')
    .select('section_id, field_id, tr, en')
    .eq('page_id', pageId)
  if (error) return []
  return data || []
}

// Cached version — next/cache deduplicates identical calls within one request
// AND caches across requests for `CONTENT_REVALIDATE` seconds.
const fetchPageRowsCached = unstable_cache(
  _fetchPageRows,
  ['page-content-rows'],
  { revalidate: CONTENT_REVALIDATE, tags: ['page-content'] }
)

/**
 * Fetch all content for a page from Supabase (monolingual).
 * Cached via next/cache for 5 minutes — safe for ISR pages.
 */
export async function getPageContent(pageId: string, lang: 'tr' | 'en' = 'tr'): Promise<Record<string, string>> {
  const pageDef = pageDefinitions.find(p => p.id === pageId)
  const defaults: Record<string, string> = {}

  if (pageDef) {
    for (const section of pageDef.sections) {
      for (const field of section.fields) {
        defaults[`${section.id}.${field.id}`] = lang === 'tr' ? field.tr : field.en
      }
    }
  }

  try {
    const rows = await fetchPageRowsCached(pageId)
    for (const row of rows) {
      const key = `${row.section_id}.${row.field_id}`
      const val = lang === 'tr' ? row.tr : row.en
      if (val && val.trim()) defaults[key] = val
    }
  } catch { /* fallback to defaults */ }

  return defaults
}

/**
 * Helper: get a specific field value.
 */
export function getVal(content: Record<string, string>, sectionId: string, fieldId: string, fallback = ''): string {
  return content[`${sectionId}.${fieldId}`] || fallback
}

export type BilingualContent = Record<string, { tr: string; en: string }>

/**
 * Fetch all content for a page — returns BOTH tr and en.
 * Cached via next/cache — avoids duplicate DB calls when used in ISR pages.
 */
export async function getPageContentBilingual(pageId: string): Promise<BilingualContent> {
  const pageDef = pageDefinitions.find(p => p.id === pageId)
  const result: BilingualContent = {}

  if (pageDef) {
    for (const section of pageDef.sections) {
      for (const field of section.fields) {
        result[`${section.id}.${field.id}`] = { tr: field.tr, en: field.en }
      }
    }
  }

  try {
    const rows = await fetchPageRowsCached(pageId)
    for (const row of rows) {
      const key = `${row.section_id}.${row.field_id}`
      const existing = result[key] || { tr: '', en: '' }
      if (row.tr?.trim()) existing.tr = row.tr
      if (row.en?.trim()) existing.en = row.en
      result[key] = existing
    }
  } catch { /* fallback to defaults */ }

  return result
}

// ── Cache tag revalidation helper ─────────────────────────────────────────────
// Call this from admin save APIs to purge the content cache immediately.
// Example: import { revalidatePageContent } from '@/lib/content'
//          await revalidatePageContent()  // called after admin saves content
export { revalidateTag } from 'next/cache'
export const PAGE_CONTENT_TAG = 'page-content'
