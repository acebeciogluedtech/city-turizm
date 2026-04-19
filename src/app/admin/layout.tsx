'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Users,
  Settings, LogOut, ChevronRight, Shield, Menu, X,
  Mail as MailListIcon, MessageSquare, ClipboardList, Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminProvider } from '@/lib/admin/store'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    href: '/admin/dashboard' },
  { icon: FileText,        label: 'İçerik Yönetimi', href: '/admin/pages' },
  { icon: Search,          label: 'SEO Yönetimi', href: '/admin/seo' },
  { icon: MessageSquare,   label: 'Mesajlar',     href: '/admin/messages',      badgeKey: 'messages' as const },
  { icon: ClipboardList,   label: 'Teklifler',    href: '/admin/quotes',        badgeKey: 'quotes' as const },
  { icon: Users,           label: 'Başvurular',   href: '/admin/applications',  badgeKey: 'applications' as const },
  { icon: MailListIcon,    label: 'Mail Listesi', href: '/admin/mail-list',     badgeKey: 'subscribers' as const },
  { icon: Settings,        label: 'Ayarlar',      href: '/admin/settings' },
]

// Hook to fetch badge counts
function useBadgeCounts() {
  const [counts, setCounts] = useState<{ messages: number; subscribers: number; quotes: number; applications: number }>({ messages: 0, subscribers: 0, quotes: 0, applications: 0 })

  const fetchCounts = useCallback(async () => {
    try {
      const [msgRes, subRes, quoteRes, appRes] = await Promise.all([
        fetch('/api/admin/messages').then(r => r.json()).catch(() => ({ messages: [] })),
        fetch('/api/admin/newsletter').then(r => r.json()).catch(() => ({ subscribers: [] })),
        fetch('/api/admin/quotes').then(r => r.json()).catch(() => ({ quotes: [] })),
        fetch('/api/admin/applications').then(r => r.json()).catch(() => ({ applications: [] })),
      ])

      const unreadMessages = (msgRes.messages || []).filter((m: { is_read?: boolean }) => !m.is_read).length
      const totalSubscribers = (subRes.subscribers || []).length
      const unreadQuotes = (quoteRes.quotes || []).filter((q: { is_read?: boolean }) => !q.is_read).length
      const unreadApps = (appRes.applications || []).filter((a: { is_read?: boolean }) => !a.is_read).length

      setCounts({ messages: unreadMessages, subscribers: totalSubscribers, quotes: unreadQuotes, applications: unreadApps })
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchCounts()
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [fetchCounts])

  // Dismiss: mark all unread as read and zero the badge count locally
  const dismiss = useCallback((key: string) => {
    if (key === 'subscribers') {
      try { localStorage.setItem('badge_seen_subscribers', String(counts.subscribers)) } catch {}
      setCounts(prev => ({ ...prev }))
    }
    if (key === 'messages') {
      // Mark all unread messages as read via API
      fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      }).catch(() => {})
      setCounts(prev => ({ ...prev, messages: 0 }))
    }
    if (key === 'quotes') {
      fetch('/api/admin/quotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      }).catch(() => {})
      setCounts(prev => ({ ...prev, quotes: 0 }))
    }
    if (key === 'applications') {
      fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      }).catch(() => {})
      setCounts(prev => ({ ...prev, applications: 0 }))
    }
  }, [counts])

  // Subscribers badge: only show if new subscribers since last seen
  function subscribersBadge(): number {
    const total = counts.subscribers
    if (total === 0) return 0
    try {
      const seen = parseInt(localStorage.getItem('badge_seen_subscribers') || '0', 10)
      return total > seen ? total - seen : 0
    } catch { return total }
  }

  return {
    counts: {
      messages: counts.messages,
      subscribers: subscribersBadge(),
      quotes: counts.quotes,
      applications: counts.applications,
    },
    dismiss,
  }
}

function Sidebar({ onClose, badgeCounts, onDismiss }: { onClose?: () => void; badgeCounts: { messages: number; subscribers: number; quotes: number; applications: number }; onDismiss: (key: string) => void }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  function logout() {
    sessionStorage.removeItem('admin_auth')
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('admin_user')
    router.push('/admin')
  }

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
            <Shield className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-gray-900 font-bold text-sm leading-tight">City Turizm</p>
            <p className="text-gray-400 text-xs">Admin Panel</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = mounted && pathname.startsWith(item.href)
          const badgeCount = mounted && item.badgeKey ? badgeCounts[item.badgeKey] : 0
          return (
            <Link key={item.href} href={item.href} onClick={() => { if (item.badgeKey) onDismiss(item.badgeKey); onClose?.() }}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
                active
                  ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              )}>
              <item.icon className={cn('w-4 h-4 flex-shrink-0 transition-colors', active ? 'text-amber-500' : 'text-gray-400 group-hover:text-gray-600')} />
              <span className="flex-1">{item.label}</span>
              {badgeCount > 0 && (
                <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-black px-1.5 shadow-sm transition-all bg-amber-500 text-white shadow-amber-500/30">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
              {active && !badgeCount && <ChevronRight className="w-3 h-3 opacity-50" />}
            </Link>
          )
        })}
      </nav>

      {/* View site link */}
      <div className="px-3 pb-2">
        <Link href="/" target="_blank"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all border border-dashed border-gray-200">
          <span className="text-base">🌐</span>
          <span>Siteyi Görüntüle</span>
          <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
        </Link>
      </div>

      {/* User */}
      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white text-xs font-black">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 text-xs font-semibold truncate">Admin</p>
            <p className="text-gray-400 text-[10px] truncate">admin@cityturizm.com</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isLogin = pathname === '/admin'
  const { counts: badgeCounts, dismiss: dismissBadge } = useBadgeCounts()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return  // Wait for client-side hydration
    if (!isLogin) {
      const auth = sessionStorage.getItem('admin_auth')
      if (!auth) router.replace('/admin')
    }
  }, [mounted, pathname, isLogin, router])

  if (isLogin) return <AdminProvider>{children}</AdminProvider>

  return (
    <AdminProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">

        {/* Desktop sidebar */}
        <div className="hidden lg:flex flex-col h-full">
          <Sidebar badgeCounts={badgeCounts} onDismiss={dismissBadge} />
        </div>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} />
              <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 bottom-0 z-50 w-64 lg:hidden">
                <Sidebar onClose={() => setMobileOpen(false)} badgeCounts={badgeCounts} onDismiss={dismissBadge} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile top bar */}
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
            <button onClick={() => setMobileOpen(true)} className="text-gray-500 hover:text-gray-800 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            {(badgeCounts.messages > 0) && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse -ml-2" />
            )}
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              <span className="text-gray-900 text-sm font-bold">City Turizm Admin</span>
            </div>
          </div>

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminProvider>
  )
}
