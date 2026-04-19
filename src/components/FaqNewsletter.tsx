'use client'

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Mail, CheckCircle, ArrowRight, Zap, Shield, Bell } from 'lucide-react'
import { useLanguage } from '@/lib/language'

// ── FAQ Item ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={`border rounded-xl overflow-hidden transition-all duration-200
                  ${open ? 'border-amber-300 shadow-sm shadow-amber-500/10' : 'border-gray-200 hover:border-gray-300'}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white"
      >
        <span className={`font-semibold text-sm transition-colors ${open ? 'text-amber-600' : 'text-gray-800'}`}>
          {q}
        </span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all
                          ${open ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
          {open ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden bg-white"
          >
            <p className="px-5 pb-4 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-3">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  contentTr: Record<string, string>
  contentEn: Record<string, string>
}

export default function FaqNewsletter({ contentTr, contentEn }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const { lang } = useLanguage()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const c = lang === 'tr' ? contentTr : contentEn
  const v = (key: string, fallback = '') => c[key] || contentTr[key] || fallback

  // Build FAQ categories from DB (dynamic structure)
  const catCount = parseInt(contentTr['faq.cat_count'] || '0')
  let faqs: { category: string; items: { q: string; a: string }[] }[] = []

  if (catCount > 0) {
    // New dynamic structure: cat_count, cat1, cat1_count, cat1_q1, cat1_a1 etc.
    for (let ci = 1; ci <= catCount; ci++) {
      const catName = v(`faq.cat${ci}`, `Kategori ${ci}`)
      const faqCount = parseInt(contentTr[`faq.cat${ci}_count`] || '0')
      const items: { q: string; a: string }[] = []
      for (let qi = 1; qi <= faqCount; qi++) {
        const q = v(`faq.cat${ci}_q${qi}`)
        const a = v(`faq.cat${ci}_a${qi}`)
        if (q && a) items.push({ q, a })
      }
      if (items.length > 0) faqs.push({ category: catName, items })
    }
  } else {
    // Fallback: old fixed structure
    const catNames = [v('faq.cat1', 'Taşımacılık'), v('faq.cat2', 'Araç & Kiralama'), v('faq.cat3', 'Seyahat & Ödeme')]
    const catFaqIds = [[1,2,3,4], [5,6,7], [8,9,10]]
    faqs = catNames.map((name, ci) => ({
      category: name,
      items: catFaqIds[ci].map(n => ({ q: v(`faq.faq${n}_q`), a: v(`faq.faq${n}_a`) })).filter(i => i.q && i.a),
    })).filter(cat => cat.items.length > 0)
  }

  const [activeCategory, setActiveCategory] = useState(faqs[0]?.category || '')

  const current = faqs.find(f => f.category === activeCategory) || faqs[0]

  if (!current) return null

  return (
    <section ref={ref} className="bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 py-20 md:py-28">
        <div className="grid lg:grid-cols-[1fr_400px] gap-10 xl:gap-16 items-start">

          {/* ── LEFT: FAQ ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200
                              rounded-full px-4 py-1.5 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-amber-600 text-xs font-bold uppercase tracking-widest">
                  {v('faq.badge', 'SSS')}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                {v('faq.title', 'Sıkça Sorulan Sorular')}
              </h2>
              <p className="text-gray-500 text-sm">
                {v('faq.subtitle', 'Cevabını bulamadığınız sorular için bizimle iletişime geçin.')}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 border border-gray-200 shadow-sm">
              {faqs.map(f => (
                <button key={f.category} onClick={() => setActiveCategory(f.category)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200
                              ${activeCategory === f.category
                                ? 'bg-amber-500 text-white shadow shadow-amber-500/25'
                                : 'text-gray-500 hover:text-gray-800'}`}>
                  {f.category}
                </button>
              ))}
            </div>

            {/* Items */}
            <AnimatePresence mode="wait">
              <motion.div key={activeCategory}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
                className="space-y-2.5"
              >
                {current.items.map((item, i) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* ── RIGHT: Newsletter ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className="lg:sticky lg:top-32"
          >
            <div className="relative bg-amber-500 rounded-3xl overflow-hidden shadow-xl shadow-amber-500/25">
              {/* Dot pattern */}
              <div className="absolute inset-0 opacity-[0.07]"
                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
              {/* Glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

              <div className="relative px-7 py-9">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30
                                rounded-full px-3.5 py-1.5 mb-5">
                  <Bell className="w-3 h-3 text-white" />
                  <span className="text-white text-[11px] font-bold uppercase tracking-widest">
                    {v('newsletter.badge', 'Bülten')}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white leading-tight mb-2">
                  {v('newsletter.title1', 'Haberdar Olun,')}<br />
                  <span className="text-white/75">{v('newsletter.title2', 'Fırsatı Kaçırmayın')}</span>
                </h3>
                <p className="text-white/75 text-sm leading-relaxed mb-6">
                  {v('newsletter.subtitle', 'Kampanyaları, yeni hizmetleri ve özel teklifleri doğrudan e-postanıza alın.')}
                </p>

                {/* Perks */}
                <ul className="space-y-2.5 mb-6">
                  {[
                    { icon: Zap,    label: v('newsletter.perk1', 'Erken kampanya bildirimleri') },
                    { icon: Shield, label: v('newsletter.perk2', 'Özel kurumsal teklifler') },
                    { icon: Bell,   label: v('newsletter.perk3', 'Yeni hizmet duyuruları') },
                  ].map(p => (
                    <li key={p.label} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                        <p.icon className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                      </div>
                      <span className="text-white/90 text-sm">{p.label}</span>
                    </li>
                  ))}
                </ul>

                <div className="h-px bg-white/20 mb-6" />

                {sent ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 bg-white/15 border border-white/25 rounded-2xl px-5 py-4">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{lang === 'tr' ? 'Kaydınız alındı!' : 'You\'re subscribed!'}</p>
                      <p className="text-white/70 text-xs mt-0.5">{lang === 'tr' ? 'En güncel haberler e-postanızda olacak.' : 'You\'ll receive the latest news in your inbox.'}</p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={async e => { e.preventDefault(); if (!email) return; try { await fetch('/api/admin/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); setSent(true) } catch {} }} className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                        placeholder={v('newsletter.placeholder', 'ornek@sirket.com')}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-sm text-gray-800
                                   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/60 transition-all" />
                    </div>
                    <button type="submit"
                      className="group w-full flex items-center justify-center gap-2 bg-gray-900
                                 hover:bg-gray-800 text-white font-bold text-sm py-3.5 rounded-xl
                                 transition-all hover:-translate-y-0.5 shadow-lg shadow-black/25">
                      {v('newsletter.button', 'Ücretsiz Kayıt Ol')}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                )}

                <p className="text-white/40 text-[11px] mt-4 text-center">
                  {v('newsletter.disclaimer', 'Spam yok. İstediğiniz zaman çıkabilirsiniz.')}
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
