'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, Megaphone, Tag, Newspaper, ChevronRight, MapPin, Clock, Building2,
  X, Users, Award, CheckCircle2, Calendar, Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useLanguage } from '@/lib/language'
import type { BilingualContent } from '@/lib/content'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
})

interface Announcement {
  id: string
  category: string
  title: string
  summary: string
  date: string
  badge?: string
  location?: string
  type?: string
  department?: string
  requirements?: string[]
  image?: string
}


/* ── Category definitions (bilingual) ── */
const CAT_KEYS = [
  { tr: 'Tümü',        en: 'All',          icon: Filter,    color: 'bg-gray-100 text-gray-700', isAll: true },
  { tr: 'İş İlanları', en: 'Job Listings', icon: Briefcase, color: 'bg-blue-50 text-blue-700',  isJob: true },
  { tr: 'Haberler',    en: 'News',         icon: Newspaper, color: 'bg-green-50 text-green-700' },
  { tr: 'Kampanyalar', en: 'Campaigns',    icon: Tag,       color: 'bg-amber-50 text-amber-700' },
  { tr: 'Basın',       en: 'Press',        icon: Megaphone, color: 'bg-purple-50 text-purple-700' },
]

// Map CMS Turkish cat values → English display values
const catTrToEn: Record<string, string> = {}
const catEnToTr: Record<string, string> = {}
CAT_KEYS.forEach(c => { catTrToEn[c.tr] = c.en; catEnToTr[c.en] = c.tr })

function JobCard({ a, onClick }: { a: Announcement; onClick: () => void }) {
  return (
    <motion.div {...fadeUp(0)}
      className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
      onClick={onClick}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              <Briefcase className="w-3 h-3" /> {a.department}
            </span>
            {a.badge && (
              <span className="inline-flex items-center bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
                {a.badge}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors mb-1">
            {a.title}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">{a.summary}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
            {a.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {a.location}</span>}
            {a.type && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {a.type}</span>}
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {a.date}</span>
          </div>
        </div>
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
          <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </motion.div>
  )
}

function AnnouncementCard({ a, onClick, categories }: { a: Announcement; onClick: () => void; categories: typeof categoriesTR }) {
  const catMeta = categories.find(c => c.key === a.category)
  const CatIcon = catMeta?.icon ?? Megaphone
  const catColor = catMeta?.color ?? 'bg-gray-100 text-gray-700'
  return (
    <motion.div {...fadeUp(0)}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
      onClick={onClick}>
      {a.image && (
        <div className="relative h-44 overflow-hidden">
          <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full', catColor)}>
            <CatIcon className="w-3 h-3" /> {a.category}
          </span>
          {a.badge && (
            <span className="inline-flex items-center bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
              {a.badge}
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-gray-900 group-hover:text-amber-600 transition-colors mb-2 leading-snug">
          {a.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">{a.summary}</p>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar className="w-3.5 h-3.5" /> {a.date}</span>
          <span className="text-xs font-semibold text-amber-600 group-hover:underline">Devamını Oku →</span>
        </div>
      </div>
    </motion.div>
  )
}

export default function DuyurularClient({ initialContent }: { initialContent: BilingualContent }) {
  const { lang } = useLanguage()
  const en = lang === 'en'

  const categories = CAT_KEYS.map(c => ({ key: en ? c.en : c.tr, icon: c.icon, color: c.color }))
  const allKey = en ? 'All' : 'Tümü'
  const jobKey = en ? 'Job Listings' : 'İş İlanları'

  const [activeCategory, setActiveCategory] = useState<string>(allKey)
  const [selected, setSelected] = useState<Announcement | null>(null)

  // Reset active category when language changes
  useEffect(() => {
    setActiveCategory(allKey)
  }, [lang, allKey])

  function v(sectionId: string, fieldId: string, fallback = ''): string {
    const entry = initialContent[`${sectionId}.${fieldId}`]
    if (!entry) return fallback
    const val = lang === 'tr' ? entry.tr : (entry.en || entry.tr)
    return val || fallback
  }

  // Build announcements from CMS — map category to current language
  const announcements: Announcement[] = Array.from({length: 10}, (_, i) => i + 1).map(n => {
    const rawCat = v('announcements', `a${n}_cat`)
    const title = v('announcements', `a${n}_title`)
    if (!rawCat || !title) return null
    // Map CMS category to current language display key
    const cat = en ? (catTrToEn[rawCat] || rawCat) : rawCat
    const reqs = v('announcements', `a${n}_reqs`)
    return {
      id: `a${n}`,
      category: cat,
      title,
      summary: v('announcements', `a${n}_summary`),
      date: v('announcements', `a${n}_date`),
      badge: v('announcements', `a${n}_badge`) || undefined,
      location: v('announcements', `a${n}_location`) || undefined,
      type: v('announcements', `a${n}_type`) || undefined,
      department: v('announcements', `a${n}_dept`) || undefined,
      requirements: reqs ? reqs.split('|').filter(Boolean) : undefined,
      image: v('announcements', `a${n}_image`) || undefined,
    }
  }).filter(Boolean) as Announcement[]

  const filtered = activeCategory === allKey
    ? announcements
    : announcements.filter(a => a.category === activeCategory)

  const jobListings = filtered.filter(a => a.category === jobKey)
  const others = filtered.filter(a => a.category !== jobKey)

  // Stats from CMS
  const stats = [1,2,3,4].map(n => ({
    val: v('stats', `stat${n}_val`, '—'),
    label: v('stats', `stat${n}_label`, ''),
  })).filter(s => s.label)
  const statIcons = [Briefcase, Megaphone, Newspaper, Users]

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 pt-40 pb-24 overflow-hidden">
        {v('hero', 'hero_img') && (
          <div className="absolute inset-0">
            <img src={v('hero', 'hero_img')} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-amber-900/80" />
          </div>
        )}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #f59e0b 0%, transparent 50%)' }} />
        <div className="container mx-auto px-6 relative">
          <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Megaphone className="w-3.5 h-3.5" /> {v('hero', 'badge', en ? 'Announcements' : 'Duyurular')}
          </motion.div>
          <motion.h1 {...fadeUp(0.1)} className="text-4xl md:text-5xl font-black text-white mb-4">
            {v('hero', 'title', en ? 'News & Announcements' : 'Haberler & Duyurular')}
          </motion.h1>
          <motion.p {...fadeUp(0.2)} className="text-lg text-slate-300 max-w-2xl">
            {v('hero', 'subtitle', en ? 'Job listings, campaigns, company news and more' : 'İş ilanları, kampanyalar, şirket haberleri ve daha fazlası')}
          </motion.p>
        </div>
      </section>

      {/* Stats strip */}
      <div className="bg-amber-500 py-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-8 flex-wrap text-white">
            {stats.map((s, i) => {
              const Icon = statIcons[i] || Users
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 opacity-80" />
                  <span className="font-black text-lg">{s.val}</span>
                  <span className="text-amber-100 text-sm">{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Category filter */}
        <div className="flex items-center gap-2 mb-10 flex-wrap">
          {categories.map(cat => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                activeCategory === cat.key
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300 hover:text-amber-600'
              )}>
              <cat.icon className="w-4 h-4" />
              {cat.key}
              <span className={cn('text-xs rounded-full px-1.5 py-0.5 font-bold',
                activeCategory === cat.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500')}>
                {cat.key === allKey ? announcements.length : announcements.filter(a => a.category === cat.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Job listings */}
        {jobListings.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-xl font-black text-gray-900">{en ? 'Job Listings' : 'İş İlanları'}</h2>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {jobListings.length} {en ? 'open positions' : 'açık pozisyon'}
              </span>
            </div>
            <div className="space-y-4">
              {jobListings.map(a => (
                <JobCard key={a.id} a={a} onClick={() => setSelected(a)} />
              ))}
            </div>
          </div>
        )}

        {/* Other announcements grid */}
        {others.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="text-xl font-black text-gray-900">
                {activeCategory === allKey ? (en ? 'Other Announcements' : 'Diğer Duyurular') : activeCategory}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {others.map(a => (
                <AnnouncementCard key={a.id} a={a} onClick={() => setSelected(a)} categories={categories} />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-gray-500">{en ? 'No announcements in this category.' : 'Bu kategoride duyuru bulunamadı.'}</p>
          </div>
        )}
      </div>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-amber-500 to-amber-600 py-16">
        <div className="container mx-auto px-6 text-center">
          <Award className="w-10 h-10 text-white/80 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
            {v('cta', 'cta_title', en ? 'Join the City Tourism Family' : 'City Turizm Ailesine Katılın')}
          </h2>
          <p className="text-amber-100 mb-8 max-w-xl mx-auto">
            {v('cta', 'cta_desc', en ? 'Apply to build your career with our 40-year legacy.' : '40 yıllık köklü geçmişimizde kariyer yapmak için bize başvurun.')}
          </p>
          <Link href="/basvuru"
            className="inline-flex items-center gap-2 bg-white text-amber-600 font-bold px-8 py-3.5 rounded-xl hover:bg-amber-50 transition-colors shadow-xl">
            <Briefcase className="w-4 h-4" /> {v('cta', 'cta_btn', en ? 'Apply Now' : 'Başvuru Yap')}
          </Link>
        </div>
      </section>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}>

              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <div className="flex items-center gap-2">
                  {selected.category === jobKey && <Briefcase className="w-4 h-4 text-blue-600" />}
                  <span className="text-sm font-semibold text-gray-500">{selected.category}</span>
                  {selected.badge && (
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{selected.badge}</span>
                  )}
                </div>
                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                {selected.image && (
                  <div className="h-48 rounded-xl overflow-hidden mb-6">
                    <img src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <h2 className="text-2xl font-black text-gray-900 mb-2">{selected.title}</h2>
                <p className="text-gray-500 text-sm mb-6 flex items-center gap-2 flex-wrap">
                  <Calendar className="w-3.5 h-3.5" /> {selected.date}
                  {selected.location && <><span>·</span><MapPin className="w-3.5 h-3.5" /> {selected.location}</>}
                  {selected.type && <><span>·</span><Clock className="w-3.5 h-3.5" /> {selected.type}</>}
                </p>

                <p className="text-gray-700 leading-relaxed mb-6">{selected.summary}</p>

                {selected.requirements && selected.requirements.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-5">
                    <p className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> {en ? 'Requirements' : 'Aranan Nitelikler'}
                    </p>
                    <ul className="space-y-2">
                      {selected.requirements.map((r, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-blue-900">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  {selected.category === jobKey && (
                    <Link href="/basvuru"
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-3 rounded-xl text-center transition-colors shadow-lg shadow-amber-500/25">
                      {en ? 'Apply Now' : 'Hemen Başvur'}
                    </Link>
                  )}
                  <button onClick={() => setSelected(null)}
                    className="flex-1 border border-gray-200 text-gray-600 font-semibold text-sm py-3 rounded-xl hover:bg-gray-50 transition-colors">
                    {en ? 'Close' : 'Kapat'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
