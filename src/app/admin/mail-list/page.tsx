'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Trash2, Download, Search, RefreshCw, Users, Clock } from 'lucide-react'

interface Subscriber {
  id: string
  email: string
  subscribed_at?: string
  created_at?: string
  active?: boolean
}

export default function MailListPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/newsletter')
      const data = await res.json()
      setSubscribers(data.subscribers || [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    setDeleting(id)
    await fetch('/api/admin/newsletter', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setSubscribers(prev => prev.filter(s => s.id !== id))
    setDeleting(null)
  }

  function exportCSV() {
    const rows = ['E-posta,Tarih,Durum']
    filtered.forEach(s => {
      rows.push(`${s.email},${new Date(s.subscribed_at || s.created_at || '').toLocaleDateString('tr-TR')},${s.active !== false ? 'Aktif' : 'Pasif'}`)
    })
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `mail-listesi-${new Date().toISOString().split('T')[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Mail Listesi</h1>
          <p className="text-gray-400 text-sm mt-1">Newsletter abonelerini yönetin</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow shadow-amber-500/25 hover:-translate-y-0.5">
            <Download className="w-4 h-4" /> CSV İndir
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Toplam</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{subscribers.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <Mail className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Aktif</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{subscribers.filter(s => s.active !== false).length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Bu Ay</span>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {subscribers.filter(s => {
              const d = new Date(s.subscribed_at || s.created_at || ''); const now = new Date()
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            }).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="E-posta ara..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-all" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-semibold text-sm">Henüz abone yok</p>
            <p className="text-gray-400 text-xs mt-1">Newsletter formundan gelen e-postalar burada listelenecek.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">E-posta</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Tarih</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Durum</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map(sub => (
                  <motion.tr key={sub.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{sub.email[0].toUpperCase()}</span>
                        </div>
                        <span className="text-gray-900 text-sm font-medium">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-gray-500 text-sm">
                      {new Date(sub.subscribed_at || sub.created_at || '').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        sub.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sub.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {sub.active !== false ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => handleDelete(sub.id)}
                        disabled={deleting === sub.id}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-500 flex items-center justify-center text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
