'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Mail, CheckCircle, ArrowRight, Zap, Shield, Bell } from 'lucide-react'
import { useLanguage } from '@/lib/language'

const perks = [
  { icon: Zap,    label: 'Erken kampanya bildirimleri' },
  { icon: Shield, label: 'Özel kurumsal teklifler' },
  { icon: Bell,   label: 'Yeni hizmet duyuruları' },
]

export default function NewsletterBanner() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const { lang } = useLanguage()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    try {
      await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch { /* silent */ }
  }

  return (
    <section ref={ref} className="bg-gray-50 px-4 md:px-6 py-20 md:py-28 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="relative bg-amber-500 rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/30">
          {/* Dot pattern */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

          {/* Glow orb */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative px-8 py-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30
                            rounded-full px-3.5 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[11px] font-bold uppercase tracking-widest">Bülten</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">
              Haberdar Olun,<br />
              <span className="text-white/75">Fırsatı Kaçırmayın</span>
            </h2>

            <p className="text-white/80 text-sm leading-relaxed mb-6">
              City Turizm&apos;in kampanyalarını, yeni hizmetlerini ve özel tekliflerini
              doğrudan e-postanıza alın.
            </p>

            {/* Perks */}
            <ul className="space-y-2.5 mb-7">
              {perks.map(p => (
                <li key={p.label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <p.icon className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-white/90 text-sm">{p.label}</span>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div className="h-px bg-white/20 mb-7" />

            {/* Form */}
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-white/15 border border-white/25
                           rounded-2xl px-5 py-4"
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{lang === 'tr' ? 'Kaydınız alındı!' : "You're subscribed!"}</p>
                  <p className="text-white/70 text-xs mt-0.5">{lang === 'tr' ? 'En güncel haberler e-postanızda olacak.' : "You'll receive the latest news in your inbox."}</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="email" required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ornek@sirket.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-sm text-gray-800
                               placeholder-gray-400 focus:outline-none focus:ring-2
                               focus:ring-white/60 transition-all"
                  />
                </div>
                <button type="submit"
                  className="group w-full flex items-center justify-center gap-2
                             bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm
                             py-3.5 rounded-xl transition-all hover:-translate-y-0.5
                             shadow-lg shadow-black/25">
                  Ücretsiz Kayıt Ol
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}

            <p className="text-white/40 text-[11px] mt-4 text-center">
              Spam yok. İstediğiniz zaman çıkabilirsiniz.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
