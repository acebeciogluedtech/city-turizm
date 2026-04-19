'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function AdminLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [focused, setFocused]   = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.')
        setLoading(false)
        return
      }
      sessionStorage.setItem('admin_auth', '1')
      sessionStorage.setItem('admin_token', data.session?.access_token ?? '')
      sessionStorage.setItem('admin_user', JSON.stringify(data.user))
      router.push('/admin/dashboard')
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
      setLoading(false)
    }
  }

  const inputCls = (name: string) => cn(
    'w-full bg-gray-50 border rounded-xl pl-11 pr-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none',
    focused === name
      ? 'border-amber-400 ring-2 ring-amber-100 bg-white'
      : 'border-gray-200 hover:border-gray-300'
  )

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT: Logo only ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 items-center justify-center">
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        {/* Ambient glows */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-orange-700/15 rounded-full blur-3xl pointer-events-none" />

        {/* Logo + title centered */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center gap-8"
        >
          {/* White logo card */}
          <div className="flex items-center justify-center w-64 h-40 rounded-3xl bg-white shadow-2xl shadow-black/20 border border-white/40">
            <img
              src="/images.png"
              alt="City Turizm"
              className="w-48 h-auto object-contain"
            />
          </div>

          {/* Text */}
          <div className="text-center">
            <p className="text-white font-black text-xl tracking-tight drop-shadow">City Turizm</p>
            <p className="text-white/70 text-sm mt-1 font-medium">Web Sitesi Yönetim Paneli</p>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT: Login form ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 relative">

        {/* Mobile logo */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Image src="/images.png" alt="City Turizm" width={100} height={40} className="h-10 w-auto object-contain" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px]"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Hoş Geldiniz</h1>
            <p className="text-gray-400 text-sm mt-1">Yönetim paneline giriş yapın</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 tracking-wide">
                E-Posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="admin@cityturizm.com"
                  className={inputCls('email')}
                  required autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 tracking-wide">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  className={cn(inputCls('password'), 'pr-11')}
                  required autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                  className="overflow-hidden">
                  <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-500 text-xs px-4 py-3 rounded-xl">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className={cn(
                'w-full flex items-center justify-center gap-2.5 font-bold py-3.5 rounded-xl text-sm transition-all duration-200 mt-2',
                loading
                  ? 'bg-amber-300 text-amber-700 cursor-not-allowed'
                  : 'bg-amber-500 text-white hover:bg-amber-400 shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 active:translate-y-0'
              )}>
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span>Giriş Yapılıyor...</span>
                </>
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-300 mt-8">
            © 2026 City Turizm. Tüm hakları saklıdır.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
