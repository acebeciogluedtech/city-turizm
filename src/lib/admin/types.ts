export type FieldType = 'text' | 'textarea' | 'image' | 'richtext' | 'url' | 'number'

export interface ContentField {
  id: string
  type: FieldType
  label: string
  tr: string
  en: string
  hint?: string
}

export interface ContentSection {
  id: string
  label: string
  description?: string
  icon: string
  fields: ContentField[]
}

export interface PageDef {
  id: string
  slug: string
  title: string
  path: string
  category: 'ana-sayfa' | 'hizmetler' | 'kurumsal' | 'medya' | 'duyurular' | 'iletisim' | 'diger'
  thumbnail: string
  sections: ContentSection[]
}

export interface EditTarget {
  pageId: string
  sectionId: string
  field: ContentField
}

// contentMap[pageId][sectionId][fieldId] = { tr, en }
export type ContentMap = Record<string, Record<string, Record<string, { tr: string; en: string }>>>

export interface AdminState {
  isAuthenticated: boolean
  content: ContentMap
  unsavedChanges: boolean
}
