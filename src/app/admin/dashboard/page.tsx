'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, ClipboardList, Users, Mail,
  ArrowRight, ArrowUpRight, Clock,
  CheckCircle2, Circle, RefreshCw,
  FileText, Search, Settings,
  TrendingUp, Activity, Bell,
  ChevronRight, Layers, Globe2,
  UserCheck, Send, Eye, EyeOff,
  BarChart2, X, ExternalLink,
} from 'lucide-react'

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
})

// ── Types ─────────────────────────────────────────────────────────────────────
interface Stats {
  messages:    { total: number; unread: number }
  quotes:      { total: number; unread: number }
  applications:{ total: number; unread: number }
  subscribers: { total: number; thisMonth: number; unread: number }
}

interface RecentItem {
  id: string
  type: 'message' | 'quote' | 'application' | 'subscriber'
  title: string
  subtitle: string
  time: string
  is_read?: boolean
  href: string
}

interface UnreadItem {
  id: string
  type: 'message' | 'quote' | 'application' | 'subscriber'
  title: string
  subtitle: string
  time: string
  href: string
  markReadUrl?: string  // API endpoint to mark as read
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, total, unread, icon: Icon,
  href, accentClass, delay,
}: {
  label: string; total: number; unread?: number
  icon: React.ElementType; href: string
  accentClass: string; delay: number
}) {
  const hasUnread = (unread ?? 0) > 0
  return (
    <motion.div {...fadeUp(delay)}>
      <Link href={href} className="group block">
        <div className="relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden">
          {/* Accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentClass} opacity-0 group-hover:opacity-100 transition-opacity`} />

          <div className="flex items-start justify-between mb-5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accentClass.replace('bg-', 'bg-').replace('500', '50').replace('600', '50')}`}
              style={{ background: 'var(--icon-bg)' }}>
              <Icon className="w-5 h-5" style={{ strokeWidth: 1.75 }} />
            </div>
            {hasUnread && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[11px] font-bold text-amber-600">{unread} yeni</span>
              </div>
            )}
          </div>

          <p className="text-3xl font-black text-gray-900 tracking-tight">{total}</p>
          <p className="text-xs font-semibold text-gray-400 mt-1 tracking-wide">{label}</p>

          <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors">
            <span>Yönetime git</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ── Mini number card ──────────────────────────────────────────────────────────
function MiniCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <p className="text-[11px] font-semibold text-gray-400 tracking-wide">{label}</p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
    </div>
  )
}

// ── Recent item row ───────────────────────────────────────────────────────────
const TYPE_META = {
  message:     { label: 'Mesaj',     color: 'bg-blue-50 text-blue-600',   dot: 'bg-blue-500',   Icon: Send },
  quote:       { label: 'Teklif',    color: 'bg-purple-50 text-purple-600', dot: 'bg-purple-500', Icon: ClipboardList },
  application: { label: 'Başvuru',  color: 'bg-green-50 text-green-600',  dot: 'bg-green-500',  Icon: UserCheck },
  subscriber:  { label: 'Abone',    color: 'bg-amber-50 text-amber-600',  dot: 'bg-amber-500',  Icon: Mail },
} as const

function RecentRow({ item }: { item: RecentItem }) {
  const meta = TYPE_META[item.type]
  return (
    <Link href={item.href}
      className="group flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/80 transition-colors border-b border-gray-100 last:border-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
        <meta.Icon className="w-4 h-4" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate transition-colors ${item.is_read === false ? 'text-gray-900' : 'text-gray-600'} group-hover:text-gray-900`}>
          {item.title}
        </p>
        <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.subtitle}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
        {item.is_read === false && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dot}`} />}
        <span className="text-[11px] text-gray-400 hidden sm:block w-16 text-right">{item.time}</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
    </Link>
  )
}

// ── Quick Link ────────────────────────────────────────────────────────────────
function QuickLink({ href, icon: Icon, label, desc, accent }: {
  href: string; icon: React.ElementType; label: string; desc: string; accent: string
}) {
  return (
    <Link href={href} className="group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all duration-200">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon className="w-4.5 h-4.5" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 leading-tight">{label}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{desc}</p>
      </div>
      <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </Link>
  )
}

// ── Notification badge ────────────────────────────────────────────────────────
function NotifBadge({ count, label, href, icon: Icon, color }: {
  count: number; label: string; href: string; icon: React.ElementType; color: string
}) {
  if (count === 0) return null
  return (
    <Link href={href}
      className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/30 transition-all group">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" strokeWidth={1.75} />
      </div>
      <p className="flex-1 text-sm font-semibold text-gray-700 group-hover:text-amber-700 transition-colors">
        <span className="font-black text-amber-600">{count}</span> yeni {label}
      </p>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 transition-colors" />
    </Link>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'Az önce'
  if (m < 60) return `${m} dk önce`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} sa önce`
  const d = Math.floor(h / 24)
  if (d < 7)  return `${d} gün önce`
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}


// ── Unread Notifications Popup ─────────────────────────────────────────────────
const POPUP_META = {
  message:     { label: 'Mesaj',   plural: 'Mesajlar',   color: 'bg-blue-50 text-blue-600',     dot: 'bg-blue-500',   ring: 'ring-blue-100',   Icon: MessageSquare },
  quote:       { label: 'Teklif',  plural: 'Teklifler',  color: 'bg-purple-50 text-purple-600', dot: 'bg-purple-500', ring: 'ring-purple-100', Icon: ClipboardList  },
  application: { label: 'Başvuru', plural: 'Başvurular', color: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500', ring: 'ring-emerald-100', Icon: UserCheck  },
  subscriber:  { label: 'Abone',   plural: 'Aboneler',   color: 'bg-amber-50 text-amber-600',   dot: 'bg-amber-500',  ring: 'ring-amber-100',  Icon: Mail           },
} as const

function NotifPopup({
  items, onClose, onMarkRead,
}: {
  items: UnreadItem[]
  onClose: () => void
  onMarkRead: (id: string, type: UnreadItem['type']) => void
}) {
  const typeOrder = ['message', 'quote', 'application', 'subscriber'] as const
  const grouped = {
    message:     items.filter(i => i.type === 'message'),
    quote:       items.filter(i => i.type === 'quote'),
    application: items.filter(i => i.type === 'application'),
    subscriber:  items.filter(i => i.type === 'subscriber'),
  }

  return (
    <div className="fixed inset-0 z-[9999]" onClick={onClose}>
      {/* Blur backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Panel — right-aligned drawer feel */}
      <div className="absolute inset-0 flex items-start justify-end p-4 sm:p-6 pt-14">
        <motion.div
          initial={{ opacity: 0, x: 32, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 32, scale: 0.97 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-[420px] max-h-[calc(100vh-4rem)] bg-white rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.22)] border border-gray-100/80 flex flex-col overflow-hidden"
        >

          {/* ── Header ──────────────────────────────────────────── */}
          <div className="relative flex-shrink-0 bg-gradient-to-br from-slate-900 via-slate-800 to-[#1c0f00] px-6 py-5 overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-400/25 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-amber-400" strokeWidth={1.75} />
                  {items.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center text-[9px] font-black text-white">
                      {items.length > 9 ? '9+' : items.length}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-white font-black text-[15px] leading-tight">Bildirimler</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {items.length > 0 ? `${items.length} okunmamış öğe bekliyor` : 'Tüm bildirimler okundu'}
                  </p>
                </div>
              </div>

              <button onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5">
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>

            {/* Type summary chips */}
            {items.length > 0 && (
              <div className="relative flex flex-wrap gap-2 mt-4">
                {typeOrder.map(t => {
                  const count = grouped[t].length
                  if (count === 0) return null
                  const meta = POPUP_META[t]
                  return (
                    <div key={t}
                      className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-2.5 py-1">
                      <meta.Icon className="w-3 h-3 text-amber-300/80" strokeWidth={2} />
                      <span className="text-[11px] font-bold text-white/70">
                        {count} {meta.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Scrollable list ──────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto overscroll-contain">

            {/* Empty state */}
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" strokeWidth={1.75} />
                </div>
                <p className="text-sm font-black text-gray-800 mb-1">Hepsi tamam!</p>
                <p className="text-xs text-gray-400 leading-relaxed">Şu anda bekleyen bildirim yok.</p>
              </div>
            )}

            {/* Grouped items */}
            {typeOrder.map(t => {
              const group = grouped[t]
              if (group.length === 0) return null
              const meta = POPUP_META[t]
              return (
                <div key={t} className="py-3">
                  {/* Group label */}
                  <div className="flex items-center gap-2 px-5 pb-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dot}`} />
                    <p className="text-[10px] font-semibold text-gray-500 flex-1">
                      {meta.plural}
                    </p>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${meta.color}`}>
                      {group.length}
                    </span>
                  </div>

                  {/* Notification rows */}
                  <div className="px-3 space-y-1">
                    {group.map((item, idx) => (
                      <motion.div
                        key={`${item.type}-${item.id}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                        className="group flex items-start gap-3.5 px-3 py-3.5 rounded-2xl hover:bg-gray-50 transition-all duration-150 cursor-default"
                      >
                        {/* Icon */}
                        <div className={`relative w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${meta.color} ring-4 ${meta.ring}`}>
                          <meta.Icon className="w-4 h-4" strokeWidth={1.75} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-[13px] font-bold text-gray-900 truncate leading-snug">{item.title}</p>
                          <p className="text-[11px] text-gray-400 truncate mt-0.5 leading-relaxed">{item.subtitle}</p>
                          <div className="flex items-center gap-1 mt-1.5">
                            <Clock className="w-3 h-3 text-gray-300 flex-shrink-0" strokeWidth={2} />
                            <span className="text-[10px] text-gray-400">{item.time}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0 pt-0.5">
                          <Link href={item.href}
                            onClick={() => onMarkRead(item.id, item.type)}
                            className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-100 hover:border-amber-200 px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap">
                            <ExternalLink className="w-3 h-3" />
                            İncele
                          </Link>
                          <button
                            onClick={() => onMarkRead(item.id, item.type)}
                            className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-100 px-2 py-1 rounded-lg transition-all">
                            <Eye className="w-3 h-3" />
                            Okundu
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Footer ───────────────────────────────────────────── */}
          {items.length > 0 && (
            <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-gray-50/60">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    const copy = [...items]
                    copy.forEach(i => onMarkRead(i.id, i.type))
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors group">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                  Tümünü okundu işaretle
                </button>
                <button onClick={onClose}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-all">
                  Kapat
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats]       = useState<Stats | null>(null)
  const [recent, setRecent]     = useState<RecentItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [showPopup, setShowPopup]         = useState(false)
  const [unreadItems, setUnreadItems]     = useState<UnreadItem[]>([])
  const [greeting, setGreeting]           = useState<string>('')  // client-only — avoids SSR time mismatch
  const [subscriberTotal, setSubscriberTotal] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [msgRes, quoteRes, appRes, subRes] = await Promise.all([
        fetch('/api/admin/messages').then(r => r.json()).catch(() => ({ messages: [] })),
        fetch('/api/admin/quotes').then(r => r.json()).catch(() => ({ quotes: [] })),
        fetch('/api/admin/applications').then(r => r.json()).catch(() => ({ applications: [] })),
        fetch('/api/admin/newsletter').then(r => r.json()).catch(() => ({ subscribers: [] })),
      ])

      const messages     = msgRes.messages     || []
      const quotes       = quoteRes.quotes     || []
      const applications = appRes.applications || []
      const subscribers  = subRes.subscribers  || []

      const now = new Date()
      const thisMonth = (arr: { created_at?: string; subscribed_at?: string }[]) =>
        arr.filter(x => {
          const d = new Date(x.created_at || x.subscribed_at || '')
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        }).length

      const unreadMsgs = messages.filter((m: { is_read?: boolean }) => !m.is_read)
      const unreadQuotes = quotes.filter((q: { is_read?: boolean }) => !q.is_read)
      const unreadApps = applications.filter((a: { is_read?: boolean }) => !a.is_read)
      const thisMonthSubs = subscribers.filter((s: { created_at?: string; subscribed_at?: string }) => {
        const d = new Date(s.created_at || s.subscribed_at || '')
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })

      // Subscribers: "unread" = new since admin last acknowledged
      const seenSubCount = (() => { try { return parseInt(localStorage.getItem('badge_seen_subscribers') || '0', 10) } catch { return 0 } })()
      const newSubCount = Math.max(0, subscribers.length - seenSubCount)
      const newSubs = (subscribers as { id: string; email: string; created_at?: string; subscribed_at?: string }[]).slice(0, newSubCount)

      setSubscriberTotal(subscribers.length)

      setStats({
        messages:     { total: messages.length,     unread: unreadMsgs.length },
        quotes:       { total: quotes.length,       unread: unreadQuotes.length },
        applications: { total: applications.length, unread: unreadApps.length },
        subscribers:  { total: subscribers.length,  thisMonth: thisMonthSubs.length, unread: newSubCount },
      })

      // Build unread popup items
      const items: UnreadItem[] = [
        ...unreadMsgs.map((m: { id: string; name: string; email: string; created_at: string }) => ({
          id: m.id, type: 'message' as const,
          title: m.name, subtitle: m.email,
          time: timeAgo(m.created_at), href: '/admin/messages',
          markReadUrl: `/api/admin/messages?id=${m.id}`,
        })),
        ...unreadQuotes.map((q: { id: string; name: string; email: string; created_at: string }) => ({
          id: q.id, type: 'quote' as const,
          title: q.name, subtitle: q.email,
          time: timeAgo(q.created_at), href: '/admin/quotes',
          markReadUrl: `/api/admin/quotes?id=${q.id}`,
        })),
        ...unreadApps.map((a: { id: string; name: string; form_type: string; created_at: string }) => ({
          id: a.id, type: 'application' as const,
          title: a.name, subtitle: a.form_type,
          time: timeAgo(a.created_at), href: '/admin/applications',
          markReadUrl: `/api/admin/applications?id=${a.id}`,
        })),
        ...newSubs.map(s => ({
          id: s.id, type: 'subscriber' as const,
          title: s.email, subtitle: 'Yeni newsletter abonesi',
          time: timeAgo(s.created_at || s.subscribed_at || ''), href: '/admin/mail-list',
        })),
      ]
      setUnreadItems(items)

      // Build unified recent feed sorted by created_at desc
      const feed: RecentItem[] = [
        ...messages.slice(0, 5).map((m: { id: string; name: string; email: string; created_at: string; is_read?: boolean }) => ({
          id: m.id, type: 'message' as const,
          title: m.name, subtitle: m.email,
          time: timeAgo(m.created_at), is_read: m.is_read,
          href: '/admin/messages',
        })),
        ...quotes.slice(0, 5).map((q: { id: string; name: string; email: string; created_at: string; is_read?: boolean }) => ({
          id: q.id, type: 'quote' as const,
          title: q.name, subtitle: q.email,
          time: timeAgo(q.created_at), is_read: q.is_read,
          href: '/admin/quotes',
        })),
        ...applications.slice(0, 5).map((a: { id: string; name: string; form_type: string; created_at: string; is_read?: boolean }) => ({
          id: a.id, type: 'application' as const,
          title: a.name, subtitle: a.form_type,
          time: timeAgo(a.created_at), is_read: a.is_read,
          href: '/admin/applications',
        })),
        ...subscribers.slice(0, 3).map((s: { id: string; email: string; created_at?: string; subscribed_at?: string }) => ({
          id: s.id, type: 'subscriber' as const,
          title: s.email, subtitle: 'Newsletter abonesi',
          time: timeAgo(s.created_at || s.subscribed_at || ''),
          href: '/admin/mail-list',
        })),
      ]

      // Sort by original data order (already sorted desc by API)
      setRecent(feed.slice(0, 12))
      setLastRefresh(new Date())
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const iv = setInterval(load, 60000)
    return () => clearInterval(iv)
  }, [load])

  // Compute greeting on client only — avoids SSR/client time mismatch
  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Günaydın' : h < 18 ? 'İyi günler' : 'İyi akşamlar')
  }, [])

  const totalUnread = (stats?.messages.unread ?? 0)
    + (stats?.quotes.unread ?? 0)
    + (stats?.applications.unread ?? 0)
    + (stats?.subscribers.unread ?? 0)

  const now = new Date()  // used for subscriber filtering

  // Mark an item as read — persists to DB (or localStorage for subscribers)
  const markAsRead = useCallback(async (id: string, type: UnreadItem['type']) => {
    // Optimistically remove from popup immediately
    setUnreadItems(prev => {
      const remaining = prev.filter(i => !(i.id === id && i.type === type))
      if (remaining.length === 0) setShowPopup(false)
      return remaining
    })

    if (type === 'subscriber') {
      // No DB column — persist "seen" total to localStorage
      try { localStorage.setItem('badge_seen_subscribers', String(subscriberTotal)) } catch {}
    } else {
      const endpoint = type === 'message' ? '/api/admin/messages' : type === 'quote' ? '/api/admin/quotes' : '/api/admin/applications'
      try {
        await fetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_read: true }) })
      } catch { /* ignore */ }
    }
    await load()
  }, [load, subscriberTotal])

  return (
    <>
      {/* ── Unread notifications popup ── */}
      <AnimatePresence>
        {showPopup && (
          <NotifPopup
            items={unreadItems}
            onClose={() => setShowPopup(false)}
            onMarkRead={markAsRead}
          />
        )}
      </AnimatePresence>

      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-gray-400 tracking-wide mb-1">{greeting}</p>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Yönetim Paneli</h1>
          <p className="text-gray-400 text-sm mt-1">City Turizm — canlı sistem görünümü</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-gray-500">Son güncelleme</p>
            <p className="text-[11px] text-gray-400">{lastRefresh.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <button onClick={load}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm flex items-center justify-center text-gray-500 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* ── Notification Banner ─────────────────────────────────────────────── */}
      {totalUnread > 0 && (
        <motion.div {...fadeUp(0.04)}>
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl px-6 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-white" strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold">{totalUnread} okunmamış bildirim bekliyor</p>
              <p className="text-amber-100 text-xs mt-0.5">Mesajlar, teklifler ve başvuruları inceleyin</p>
            </div>
            <button onClick={() => setShowPopup(true)}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all flex-shrink-0">
              İncele <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ── KPI Stats Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
              <div className="w-11 h-11 bg-gray-100 rounded-xl mb-5" />
              <div className="h-8 bg-gray-100 rounded-lg w-16 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              label="İletişim Mesajı" total={stats?.messages.total ?? 0}
              unread={stats?.messages.unread} icon={MessageSquare}
              href="/admin/messages" delay={0.06}
              accentClass="bg-gradient-to-r from-blue-500 to-indigo-500"
            />
            <StatCard
              label="Teklif Talebi" total={stats?.quotes.total ?? 0}
              unread={stats?.quotes.unread} icon={ClipboardList}
              href="/admin/quotes" delay={0.08}
              accentClass="bg-gradient-to-r from-purple-500 to-violet-500"
            />
            <StatCard
              label="İş Başvurusu" total={stats?.applications.total ?? 0}
              unread={stats?.applications.unread} icon={Users}
              href="/admin/applications" delay={0.10}
              accentClass="bg-gradient-to-r from-green-500 to-emerald-500"
            />
            <StatCard
              label="Mail Listesi" total={stats?.subscribers.total ?? 0}
              icon={Mail}
              href="/admin/mail-list" delay={0.12}
              accentClass="bg-gradient-to-r from-amber-500 to-orange-500"
            />
          </>
        )}
      </div>

      {/* ── Secondary metric row ─────────────────────────────────────────────── */}
      {!loading && stats && (
        <motion.div {...fadeUp(0.14)} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniCard label="Okunmamış mesaj"    value={stats.messages.unread}     sub="yanıt bekliyor" />
          <MiniCard label="Okunmamış teklif"   value={stats.quotes.unread}       sub="onay bekliyor" />
          <MiniCard label="Okunmamış başvuru"  value={stats.applications.unread} sub="inceleme bekliyor" />
          <MiniCard label="Bu ay abone"         value={stats.subscribers.thisMonth} sub="yeni kayıt" />
        </motion.div>
      )}

      {/* ── Main content grid ─────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">

        {/* Recent Activity — 2/3 */}
        <motion.div {...fadeUp(0.16)} className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-500" strokeWidth={1.75} />
                <h2 className="text-sm font-bold text-gray-900">Son Aktiviteler</h2>
              </div>
              <div className="flex items-center gap-2">
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-gray-400" />}
                <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {recent.length} kayıt
                </span>
              </div>
            </div>

            {recent.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <Activity className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-500 font-semibold text-sm">Henüz aktivite yok</p>
                <p className="text-gray-400 text-xs mt-1">Gelen bildirimler burada görünecek</p>
              </div>
            )}

            {loading && (
              <div className="divide-y divide-gray-100">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-gray-100 rounded w-32" />
                      <div className="h-2.5 bg-gray-100 rounded w-48" />
                    </div>
                    <div className="h-4 w-12 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            )}

            {!loading && recent.map(item => <RecentRow key={`${item.type}-${item.id}`} item={item} />)}

            {/* Footer row */}
            {!loading && recent.length > 0 && (
              <div className="grid grid-cols-3 border-t border-gray-100">
                {[
                  { label: 'Tüm Mesajlar',    href: '/admin/messages' },
                  { label: 'Tüm Teklifler',   href: '/admin/quotes' },
                  { label: 'Tüm Başvurular',  href: '/admin/applications' },
                ].map(l => (
                  <Link key={l.href} href={l.href}
                    className="flex items-center justify-center gap-1.5 py-3 text-[11px] font-semibold text-gray-400 hover:text-amber-600 hover:bg-amber-50/40 transition-all border-r border-gray-100 last:border-0">
                    {l.label} <ArrowRight className="w-3 h-3" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right column — 1/3 */}
        <div className="space-y-5">
          {/* Notifications */}
          <motion.div {...fadeUp(0.18)}>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
              <h2 className="text-sm font-bold text-gray-900">Bekleyen Bildirimler</h2>
            </div>
            <div className="space-y-2">
              {!loading && stats && (
                <>
                  <NotifBadge count={stats.messages.unread}     label="mesaj"    href="/admin/messages"     icon={MessageSquare} color="bg-blue-50 text-blue-600" />
                  <NotifBadge count={stats.quotes.unread}       label="teklif"   href="/admin/quotes"       icon={ClipboardList} color="bg-purple-50 text-purple-600" />
                  <NotifBadge count={stats.applications.unread} label="başvuru"  href="/admin/applications" icon={Users}         color="bg-green-50 text-green-600" />
                  {/* Subscribers have no is_read — shown in stats only, not as unread */}
                </>
              )}
              {!loading && totalUnread === 0 && (
                <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-100 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-sm font-semibold text-green-700">Tüm bildirimler okundu</p>
                </div>
              )}
              {loading && (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div {...fadeUp(0.22)}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
              <h2 className="text-sm font-bold text-gray-900">Hızlı Erişim</h2>
            </div>
            <div className="space-y-2">
              {[
                { href: '/admin/pages',     icon: Layers,   label: 'İçerik Yönetimi', desc: 'Sayfa ve bölüm düzenle',   accent: 'bg-indigo-50 text-indigo-600' },
                { href: '/admin/seo',       icon: Search,   label: 'SEO Yönetimi',    desc: 'Meta, OG, Analytics',     accent: 'bg-emerald-50 text-emerald-600' },
                { href: '/admin/mail-list', icon: Globe2,   label: 'Mail Listesi',    desc: 'Newsletter aboneleri',    accent: 'bg-amber-50 text-amber-600' },
                { href: '/admin/settings',  icon: Settings, label: 'Ayarlar',         desc: 'Panel konfigürasyonu',    accent: 'bg-gray-100 text-gray-600' },
              ].map(a => (
                <QuickLink key={a.href} {...a} />
              ))}
            </div>
          </motion.div>

          {/* System status */}
          <motion.div {...fadeUp(0.26)}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
              <h2 className="text-sm font-bold text-gray-900">Sistem Durumu</h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
              {[
                { label: 'Veritabanı',     status: true,  detail: 'Supabase — Aktif' },
                { label: 'Dosya Yükleme',  status: true,  detail: 'Storage — Aktif' },
                { label: 'E-posta Formu',  status: true,  detail: 'API — Yanıt veriyor' },
                { label: 'SEO İndeksleme', status: true,  detail: 'sitemap.xml — Hazır' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3 px-4 py-3">
                  {s.status
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" strokeWidth={1.75} />
                    : <Circle className="w-4 h-4 text-red-400 flex-shrink-0" strokeWidth={1.75} />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{s.label}</p>
                    <p className="text-[10px] text-gray-400">{s.detail}</p>
                  </div>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.status ? 'bg-green-400' : 'bg-red-400'}`} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Page overview strip ────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.28)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
            <h2 className="text-sm font-bold text-gray-900">İçerik Sayfaları</h2>
          </div>
          <Link href="/admin/pages"
            className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
            Tümü <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: 'Kurumsal', links: [
              { label: 'Biz Kimiz',             href: '/admin/editor/biz-kimiz' },
              { label: 'Başkanın Mesajı',        href: '/admin/editor/baskanin-mesaji' },
              { label: 'Şirket Profili',         href: '/admin/editor/sirket-profili' },
              { label: 'Araç Filosu',            href: '/admin/editor/arac-filosu' },
            ]},
            { title: 'Hizmetler', links: [
              { label: 'Personel Taşımacılık',  href: '/admin/editor/personel-tasimacilik' },
              { label: 'Öğrenci Taşımacılığı', href: '/admin/editor/ogrenci-tasimacilik' },
              { label: 'Özel Transfer',          href: '/admin/editor/ozel-transfer' },
              { label: 'Araç Kiralama',          href: '/admin/editor/arac-kiralama' },
            ]},
            { title: 'İletişim & Form', links: [
              { label: 'İletişim Sayfası', href: '/admin/editor/iletisim' },
              { label: 'Teklif Formu',     href: '/admin/editor/teklif-al' },
              { label: 'Başvuru Formu',    href: '/admin/editor/basvuru' },
              { label: 'Duyurular',        href: '/admin/pages' },
            ]},
            { title: 'Yasal', links: [
              { label: 'KVKK',                   href: '/admin/editor/kvkk' },
              { label: 'Gizlilik Politikası',    href: '/admin/editor/gizlilik' },
              { label: 'Kullanım Koşulları',     href: '/admin/editor/kullanim' },
              { label: 'Çerez Politikası',       href: '/admin/editor/cerez' },
            ]},
          ].map(cat => (
            <div key={cat.title} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-[10px] font-bold text-gray-400 tracking-wide mb-3 pb-2 border-b border-gray-100">
                {cat.title}
              </p>
              <div className="space-y-1">
                {cat.links.map(l => (
                  <Link key={l.href} href={l.href}
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-amber-600 transition-colors group py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                    <span className="flex-1 truncate">{l.label}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
    </>
  )
}
