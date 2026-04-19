'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Trash2, Search, RefreshCw, Mail, Clock, Eye, EyeOff,
  ChevronDown, ChevronUp, User, Phone, Briefcase, Car, Map,
  FileText, ImageIcon, X, ExternalLink, Download,
} from 'lucide-react'

interface Application {
  id: string
  form_type: string
  name: string
  email: string
  phone?: string | null
  data?: Record<string, string> | null
  is_read?: boolean
  created_at: string
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  genel:  { label: 'Genel Başvuru',    color: 'bg-blue-50 text-blue-600' },
  surucu: { label: 'Şoför Başvurusu',  color: 'bg-amber-50 text-amber-600' },
  rehber: { label: 'Rehber Başvurusu', color: 'bg-green-50 text-green-600' },
  arac:   { label: 'Araç Başvurusu',   color: 'bg-purple-50 text-purple-600' },
}
const FALLBACK_TYPE = { label: 'Diğer', color: 'bg-gray-100 text-gray-600' }

const DATA_LABELS: Record<string, string> = {
  dogumYili: 'Doğum Yılı',
  ogrenim: 'Öğrenim Durumu',
  adres: 'Adres',
  departman: 'Departman',
  aciklama: 'Açıklama',
  ehliyet: 'Ehliyet Sınıfı',
  topluTasima: 'Toplu Taşıma Belgesi',
  src: 'SRC Belgesi',
  plaka: 'Plaka',
  modelYili: 'Model Yılı',
  aracCinsi: 'Araç Cinsi',
  kapasite: 'Kapasite',
  cv_url: 'CV / Dosya',
  foto_url: 'Fotoğraf',
}

// ── File Viewer Modal ─────────────────────────────────────────────────────────
function FileViewer({ url, fileType, onClose }: { url: string; fileType: 'image' | 'pdf' | 'other'; onClose: () => void }) {
  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-4"
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 25 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              {fileType === 'image'
                ? <ImageIcon className="w-4 h-4 text-amber-500" />
                : <FileText className="w-4 h-4 text-blue-500" />}
              <span className="text-sm font-semibold text-gray-700">
                {fileType === 'image' ? 'Fotoğraf Görüntüleyici' : fileType === 'pdf' ? 'PDF Görüntüleyici' : 'Dosya'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-amber-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-amber-50">
                <ExternalLink className="w-3.5 h-3.5" /> Yeni Sekme
              </a>
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors px-2.5 py-1.5 rounded-lg">
                <Download className="w-3.5 h-3.5" /> İndir
              </a>
              <button onClick={onClose}
                className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center min-h-0" style={{ minHeight: '60vh' }}>
            {fileType === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="Yüklenen fotoğraf" className="max-w-full max-h-full object-contain" />
            ) : fileType === 'pdf' ? (
              <iframe src={url} className="w-full h-full" style={{ minHeight: '70vh' }} title="PDF Görüntüleyici" />
            ) : (
              <div className="text-center p-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold mb-2">Bu dosya önizlenemiyor</p>
                <a href={url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold text-sm">
                  <ExternalLink className="w-4 h-4" /> Yeni sekmede aç
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── File Badge Button ─────────────────────────────────────────────────────────
function FileBadge({ url, fileType }: { url: string; fileType: 'image' | 'pdf' | 'other' }) {
  const [viewerOpen, setViewerOpen] = useState(false)

  const btnLabel = fileType === 'pdf'
    ? "CV'yi Görüntüle"
    : fileType === 'image'
    ? 'Resmi Görüntüle'
    : 'Dosyayı Görüntüle'

  return (
    <>
      <button
        onClick={() => setViewerOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold
                   bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100
                   transition-all hover:-translate-y-0.5 shadow-sm"
      >
        {fileType === 'image' ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
        {btnLabel}
        <Eye className="w-3.5 h-3.5 opacity-60" />
      </button>
      {viewerOpen && <FileViewer url={url} fileType={fileType} onClose={() => setViewerOpen(false)} />}
    </>
  )
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/applications')
      const data = await res.json()
      setApplications(data.applications || [])
    } catch { /* */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleRead(id: string, current?: boolean) {
    await fetch('/api/admin/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_read: !current }),
    })
    setApplications(prev => prev.map(a => a.id === id ? { ...a, is_read: !current } : a))
  }

  async function handleDelete(id: string) {
    await fetch('/api/admin/applications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setApplications(prev => prev.filter(a => a.id !== id))
  }

  const filtered = applications.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
                        a.email.toLowerCase().includes(search.toLowerCase())
    const matchRead = filter === 'all' || (filter === 'unread' ? !a.is_read : a.is_read)
    const matchType = typeFilter === 'all' || a.form_type === typeFilter
    return matchSearch && matchRead && matchType
  })

  const unreadCount = applications.filter(a => !a.is_read).length
  const types = [...new Set(applications.map(a => a.form_type).filter(Boolean))] as string[]

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

  function getTypeInfo(type?: string | null) {
    return TYPE_LABELS[type || ''] || FALLBACK_TYPE
  }

  const TypeIcon: Record<string, React.ElementType> = {
    genel: Briefcase, surucu: Car, rehber: Map, arac: Car,
  }

  // ── File URL fields extracted from data (dynamic — scans all keys) ───────────
  function getFileType(key: string, url: string): 'image' | 'pdf' | 'other' {
    if (key === 'foto_url' || key.endsWith('_img') || key.endsWith('_photo')) return 'image'
    if (key === 'cv_url' || key.endsWith('_cv') || key.endsWith('_doc')) return 'pdf'
    const lower = url.toLowerCase().split('?')[0]
    if (/\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)/.test(lower)) return 'image'
    if (/\.pdf/.test(lower)) return 'pdf'
    if (/\.(doc|docx)/.test(lower)) return 'pdf'
    return 'other'
  }

  function getFileFields(data?: Record<string, string> | null): { key: string; url: string; fileType: 'image' | 'pdf' | 'other' }[] {
    if (!data) return []
    const results: { key: string; url: string; fileType: 'image' | 'pdf' | 'other' }[] = []
    for (const [key, val] of Object.entries(data)) {
      if (!val || typeof val !== 'string') continue
      if ((val.startsWith('http') || val.startsWith('/')) && val.length > 10) {
        results.push({ key, url: val, fileType: getFileType(key, val) })
      }
    }
    return results
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900">Başvurular</h1>
            {unreadCount > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow shadow-amber-500/25">
                {unreadCount} yeni
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-1">Başvuru sayfasından gelen iş başvuruları</p>
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
              <Users className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Toplam</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{applications.length}</p>
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
            {applications.filter(a => {
              const d = Date.now() - new Date(a.created_at).getTime()
              return d < 7 * 24 * 60 * 60 * 1000
            }).length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Tür</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{types.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="İsim veya e-posta ara..."
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

      {/* Type filter */}
      {types.length > 1 && (
        <div className="flex gap-1.5 flex-wrap mb-4">
          <button onClick={() => setTypeFilter('all')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}>
            Tüm Başvurular
          </button>
          {types.map(t => {
            const info = getTypeInfo(t)
            return (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  typeFilter === t ? 'bg-gray-900 text-white' : `${info.color} border border-transparent hover:opacity-80`
                }`}>
                {info.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-semibold text-sm">Henüz başvuru yok</p>
            <p className="text-gray-400 text-xs mt-1">Başvuru sayfasından gelen başvurular burada listelenecek.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map(a => {
              const info = getTypeInfo(a.form_type)
              const Icon = TypeIcon[a.form_type] || Briefcase
              const fileFields = getFileFields(a.data)
              return (
                <motion.div key={a.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                    !a.is_read ? 'border-amber-200 shadow-sm shadow-amber-500/5' : 'border-gray-200'
                  }`}>
                  {/* Header row */}
                  <div className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => { setExpanded(expanded === a.id ? null : a.id); if (!a.is_read) toggleRead(a.id, false) }}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !a.is_read ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gray-200'
                    }`}>
                      <span className={`text-sm font-bold ${!a.is_read ? 'text-white' : 'text-gray-500'}`}>
                        {a.name[0]?.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold truncate ${!a.is_read ? 'text-gray-900' : 'text-gray-600'}`}>{a.name}</p>
                        {!a.is_read && <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />}
                      </div>
                      <p className="text-gray-500 text-xs truncate">{a.email}</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* File attachment indicator */}
                      {fileFields.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <FileText className="w-3 h-3" /> {fileFields.length} dosya
                        </span>
                      )}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${info.color}`}>
                        {info.label}
                      </span>
                      <span className="text-gray-400 text-xs hidden sm:inline">{timeAgo(a.created_at)}</span>
                      {expanded === a.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded */}
                  <AnimatePresence>
                    {expanded === a.id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden">
                        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                              <User className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{a.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                              <a href={`mailto:${a.email}`} className="hover:text-amber-500 transition-colors truncate">{a.email}</a>
                            </div>
                            {a.phone && (
                              <div className="flex items-center gap-2 text-gray-500 text-xs">
                                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                <a href={`tel:${a.phone}`} className="hover:text-amber-500 transition-colors">{a.phone}</a>
                              </div>
                            )}
                          </div>

                          {/* Type badge */}
                          <div className="flex items-center gap-2 mb-4">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${info.color}`}>
                              <Icon className="w-3 h-3" /> {info.label}
                            </span>
                            <span className="text-gray-400 text-xs">{new Date(a.created_at).toLocaleString('tr-TR')}</span>
                          </div>

                          {/* ── File Attachments ── */}
                          {fileFields.length > 0 && (
                            <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4 mb-4">
                              <p className="text-xs font-bold text-amber-700 mb-3 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" /> Yüklenen Dosyalar
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {fileFields.map(f => (
                                  <FileBadge key={f.key} url={f.url} fileType={f.fileType} />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Details */}
                          {a.data && Object.entries(a.data).filter(([k, v]) => v && !['cv_url','foto_url','file_url','attachment_url'].includes(k)).length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                              <p className="text-xs font-bold text-gray-500 mb-3">Başvuru Detayları</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(a.data)
                                  .filter(([k, v]) => v && !['cv_url','foto_url','file_url','attachment_url'].includes(k))
                                  .map(([key, val]) => (
                                    <div key={key} className="flex items-start gap-2 text-xs">
                                      <span className="font-semibold text-gray-400 min-w-[100px]">{DATA_LABELS[key] || key}:</span>
                                      <span className="text-gray-700">{val}</span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2 justify-end">
                            <a href={`mailto:${a.email}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-all">
                              <Mail className="w-3 h-3" /> E-posta Gönder
                            </a>
                            <button onClick={() => toggleRead(a.id, a.is_read)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-all">
                              {a.is_read ? <><EyeOff className="w-3 h-3" /> Okunmadı İşaretle</> : <><Eye className="w-3 h-3" /> Okundu İşaretle</>}
                            </button>
                            <button onClick={() => handleDelete(a.id)}
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
