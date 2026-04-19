'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Trash2, Search, RefreshCw, Mail, Clock, Eye, EyeOff,
  ChevronDown, ChevronUp, User, Phone, Building2, MapPin,
} from 'lucide-react'

interface Quote {
  id: string
  name: string
  email: string
  phone?: string | null
  company?: string | null
  message?: string | null
  source?: string | null
  is_read?: boolean
  created_at: string
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  'personel-tasimacilik': { label: 'Personel Taşımacılığı', color: 'bg-blue-50 text-blue-600' },
  'ogrenci-tasimacilik':  { label: 'Öğrenci Taşımacılığı',  color: 'bg-purple-50 text-purple-600' },
  'ozel-transfer':        { label: 'Özel Transfer',          color: 'bg-emerald-50 text-emerald-600' },
  'arac-kiralama':        { label: 'Araç Kiralama',          color: 'bg-cyan-50 text-cyan-600' },
  'turizm-acenteligi':    { label: 'Turizm Acenteliği',      color: 'bg-orange-50 text-orange-600' },
  'akaryakit-istasyonu':  { label: 'Akaryakıt İstasyonu',    color: 'bg-red-50 text-red-600' },
}

const FALLBACK_SOURCE = { label: 'Diğer', color: 'bg-gray-100 text-gray-600' }

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/quotes')
      const data = await res.json()
      setQuotes(data.quotes || [])
    } catch { /* */ }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleRead(id: string, current?: boolean) {
    await fetch('/api/admin/quotes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_read: !current }),
    })
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, is_read: !current } : q))
  }

  async function handleDelete(id: string) {
    await fetch('/api/admin/quotes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setQuotes(prev => prev.filter(q => q.id !== id))
  }

  const filtered = quotes.filter(q => {
    const matchSearch = q.name.toLowerCase().includes(search.toLowerCase()) ||
                        q.email.toLowerCase().includes(search.toLowerCase()) ||
                        (q.company || '').toLowerCase().includes(search.toLowerCase()) ||
                        (q.message || '').toLowerCase().includes(search.toLowerCase())
    const matchRead = filter === 'all' || (filter === 'unread' ? !q.is_read : q.is_read)
    const matchSource = sourceFilter === 'all' || q.source === sourceFilter
    return matchSearch && matchRead && matchSource
  })

  const unreadCount = quotes.filter(q => !q.is_read).length

  // Get unique sources from quotes (only known service categories)
  const sources = [...new Set(quotes.map(q => q.source).filter(Boolean))] as string[]

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} dk önce`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} saat önce`
    const days = Math.floor(hrs / 24)
    if (days < 30) return `${days} gün önce`
    return new Date(dateStr).toLocaleDateString('tr-TR')
  }

  function getSourceInfo(source?: string | null) {
    return SOURCE_LABELS[source || ''] || FALLBACK_SOURCE
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900">Teklifler</h1>
            {unreadCount > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow shadow-amber-500/25">
                {unreadCount} yeni
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-1">Hizmet sayfalarından gelen teklif talepleri</p>
        </div>
        <button onClick={load}
          className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Toplam</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{quotes.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Okunmamış</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{unreadCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Bu Hafta</span>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {quotes.filter(q => {
              const d = Date.now() - new Date(q.created_at).getTime()
              return d < 7 * 24 * 60 * 60 * 1000
            }).length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Hizmet</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{sources.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="İsim, e-posta, firma veya mesaj ara..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-all" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'unread', 'read'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                filter === f ? 'bg-amber-500 text-white shadow shadow-amber-500/25' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}>
              {f === 'all' ? 'Tümü' : f === 'unread' ? 'Okunmamış' : 'Okunmuş'}
            </button>
          ))}
        </div>
      </div>

      {/* Source filter */}
      {sources.length > 1 && (
        <div className="flex gap-1.5 flex-wrap mb-4">
          <button onClick={() => setSourceFilter('all')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              sourceFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}>
            Tüm Teklifler
          </button>
          {sources.map(s => {
            const info = getSourceInfo(s)
            return (
              <button key={s} onClick={() => setSourceFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  sourceFilter === s ? 'bg-gray-900 text-white' : `${info.color} border border-transparent hover:opacity-80`
                }`}>
                {info.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Quotes List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-semibold text-sm">Henüz teklif talebi yok</p>
            <p className="text-gray-400 text-xs mt-1">Hizmet sayfalarından gelen teklif talepleri burada listelenecek.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map(q => {
              const info = getSourceInfo(q.source)
              return (
                <motion.div key={q.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                    !q.is_read ? 'border-amber-200 shadow-sm shadow-amber-500/5' : 'border-gray-200'
                  }`}>
                  {/* Header row */}
                  <div className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => { setExpanded(expanded === q.id ? null : q.id); if (!q.is_read) toggleRead(q.id, false) }}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !q.is_read ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gray-200'
                    }`}>
                      <span className={`text-sm font-bold ${!q.is_read ? 'text-white' : 'text-gray-500'}`}>
                        {q.name[0]?.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold truncate ${!q.is_read ? 'text-gray-900' : 'text-gray-600'}`}>{q.name}</p>
                        {!q.is_read && <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />}
                      </div>
                      <p className="text-gray-500 text-xs truncate">
                        {q.company ? `${q.company} · ` : ''}{q.message || q.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${info.color}`}>
                        {info.label}
                      </span>
                      <span className="text-gray-400 text-xs hidden sm:inline">{timeAgo(q.created_at)}</span>
                      {expanded === q.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded */}
                  <AnimatePresence>
                    {expanded === q.id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden">
                        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                              <User className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{q.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                              <a href={`mailto:${q.email}`} className="hover:text-amber-500 transition-colors truncate">{q.email}</a>
                            </div>
                            {q.phone && (
                              <div className="flex items-center gap-2 text-gray-500 text-xs">
                                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                <a href={`tel:${q.phone}`} className="hover:text-amber-500 transition-colors">{q.phone}</a>
                              </div>
                            )}
                            {q.company && (
                              <div className="flex items-center gap-2 text-gray-500 text-xs">
                                <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{q.company}</span>
                              </div>
                            )}
                          </div>

                          {/* Source badge */}
                          <div className="flex items-center gap-2 mb-4">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${info.color}`}>
                              📍 {info.label}
                            </span>
                            <span className="text-gray-400 text-xs">{new Date(q.created_at).toLocaleString('tr-TR')}</span>
                          </div>

                          {q.message && (
                            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{q.message}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => toggleRead(q.id, q.is_read)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-all">
                              {q.is_read ? <><EyeOff className="w-3 h-3" /> Okunmadı İşaretle</> : <><Eye className="w-3 h-3" /> Okundu İşaretle</>}
                            </button>
                            <button onClick={() => handleDelete(q.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-all">
                              <Trash2 className="w-3 h-3" /> Sil
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
