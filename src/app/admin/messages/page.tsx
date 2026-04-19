'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Trash2, Search, RefreshCw, Mail, Clock, Eye, EyeOff, ChevronDown, ChevronUp, User } from 'lucide-react'

interface Message {
  id: string
  name: string
  email: string
  phone?: string | null
  message: string
  subject?: string | null
  source?: string | null
  is_read?: boolean
  created_at: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/messages')
      const data = await res.json()
      setMessages(data.messages || [])
    } catch { /* */ }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleRead(id: string, current: boolean) {
    await fetch('/api/admin/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_read: !current }),
    })
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: !current } : m))
  }

  async function handleDelete(id: string) {
    await fetch('/api/admin/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  const filtered = messages.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                        m.email.toLowerCase().includes(search.toLowerCase()) ||
                        m.message.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'unread' ? !m.is_read : m.is_read)
    return matchSearch && matchFilter
  })

  const unreadCount = messages.filter(m => !m.is_read).length

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

  const sourceLabel: Record<string, string> = {
    'contact': 'İletişim',
    'homepage': 'Anasayfa',
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900">Mesajlar</h1>
            {unreadCount > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow shadow-amber-500/25">
                {unreadCount} yeni
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-1">İletişim formundan gelen mesajlar</p>
        </div>
        <button onClick={load}
          className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Toplam</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{messages.length}</p>
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
            {messages.filter(m => {
              const d = Date.now() - new Date(m.created_at).getTime()
              return d < 7 * 24 * 60 * 60 * 1000
            }).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="İsim, e-posta veya mesaj ara..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-all" />
        </div>
        <div className="flex gap-1.5">
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

      {/* Messages */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-semibold text-sm">Henüz mesaj yok</p>
            <p className="text-gray-400 text-xs mt-1">İletişim formundan gelen mesajlar burada listelenecek.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map(msg => (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                  !msg.is_read ? 'border-amber-200 shadow-sm shadow-amber-500/5' : 'border-gray-200'
                }`}>
                {/* Header row */}
                <div className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => { setExpanded(expanded === msg.id ? null : msg.id); if (!msg.is_read) toggleRead(msg.id, false) }}>
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    !msg.is_read ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gray-200'
                  }`}>
                    <span className={`text-sm font-bold ${!msg.is_read ? 'text-white' : 'text-gray-500'}`}>
                      {msg.name[0]?.toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold truncate ${!msg.is_read ? 'text-gray-900' : 'text-gray-600'}`}>{msg.name}</p>
                      {!msg.is_read && <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />}
                    </div>
                    <p className="text-gray-500 text-xs truncate">{msg.message}</p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      msg.source === 'contact' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {sourceLabel[msg.source] || msg.source}
                    </span>
                    <span className="text-gray-400 text-xs">{timeAgo(msg.created_at)}</span>
                    {expanded === msg.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {expanded === msg.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden">
                      <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <User className="w-3.5 h-3.5" />
                            <span>{msg.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <Mail className="w-3.5 h-3.5" />
                            <a href={`mailto:${msg.email}`} className="hover:text-amber-500 transition-colors">{msg.email}</a>
                          </div>
                          {msg.phone && (
                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                              <span>📞</span>
                              <a href={`tel:${msg.phone}`} className="hover:text-amber-500 transition-colors">{msg.phone}</a>
                            </div>
                          )}
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{msg.message}</p>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => toggleRead(msg.id, msg.is_read)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-all">
                            {msg.is_read ? <><EyeOff className="w-3 h-3" /> Okunmadı İşaretle</> : <><Eye className="w-3 h-3" /> Okundu İşaretle</>}
                          </button>
                          <button onClick={() => handleDelete(msg.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-all">
                            <Trash2 className="w-3 h-3" /> Sil
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
