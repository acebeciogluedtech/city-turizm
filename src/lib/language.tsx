'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type Lang = 'tr' | 'en'

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (tr: string, en: string) => string
}

const LanguageContext = createContext<LangCtx>({
  lang: 'tr',
  setLang: () => {},
  t: (tr) => tr,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('tr')

  const t = useCallback((tr: string, en: string) => {
    if (lang === 'en' && en && en.trim()) return en
    return tr
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
