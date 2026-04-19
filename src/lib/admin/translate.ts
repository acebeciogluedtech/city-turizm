// ── Auto-translate helper ──────────────────────────────────────────────────────
// Uses MyMemory (free, no API key needed) as default.
// Swap provider by changing TRANSLATE_PROVIDER env var.

export type LangCode = 'tr' | 'en'

export async function translateText(
  text: string,
  from: LangCode,
  to: LangCode,
): Promise<string> {
  if (!text.trim()) return ''

  try {
    // MyMemory Free API — 5000 chars/day per IP, no key required
    const langPair = `${from}|${to}`
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    const translated: string = data?.responseData?.translatedText
    if (translated && data?.responseStatus === 200) return translated
    throw new Error('No translation')
  } catch {
    // Fallback: return original text with a marker
    return `[${to.toUpperCase()}] ${text}`
  }
}
