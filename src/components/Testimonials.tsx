'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/lib/language'

interface Props {
  contentTr: Record<string, string>
  contentEn: Record<string, string>
}

export default function Testimonials({ contentTr, contentEn }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [current, setCurrent] = useState(0)
  const { lang } = useLanguage()
  const c = lang === 'tr' ? contentTr : contentEn
  const v = (key: string, fallback = '') => c[key] || contentTr[key] || fallback

  // Build reviews from DB content
  const reviews = Array.from({ length: 6 }, (_, i) => ({
    id: String(i + 1),
    name: v(`testimonials.r${i + 1}_name`),
    title: v(`testimonials.r${i + 1}_title`),
    company: v(`testimonials.r${i + 1}_company`),
    service: v(`testimonials.r${i + 1}_service`),
    rating: parseInt(v(`testimonials.r${i + 1}_rating`, '5')) || 5,
    comment: v(`testimonials.r${i + 1}_comment`),
  })).filter(r => r.name && r.comment)

  const next = () => setCurrent(p => (p + 1) % reviews.length)
  const prev = () => setCurrent(p => (p - 1 + reviews.length) % reviews.length)

  if (reviews.length === 0) return null

  return (
    <section ref={ref} className="bg-amber-500 py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30
                          rounded-full px-4 py-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-white text-xs font-bold uppercase tracking-widest">
              {v('testimonials.badge', lang === 'tr' ? 'Görüşler' : 'Reviews')}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            {v('testimonials.title', lang === 'tr' ? 'Paydaşlarımız Neler Düşünüyor?' : 'What Our Partners Think?')}
          </h2>
          <p className="text-white/80 text-base max-w-xl mx-auto">
            {v('testimonials.subtitle', lang === 'tr' ? 'Hizmet verdiğimiz kurumların ve iş ortaklarımızın deneyimleri.' : 'Experiences from our clients and partners.')}
          </p>
        </motion.div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="bg-white/15 hover:bg-white/25 border border-white/20 hover:border-white/40
                         rounded-2xl p-6 transition-all duration-200 flex flex-col"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, si) => (
                  <Star key={si}
                    className={`w-4 h-4 ${si < r.rating ? 'text-white fill-white' : 'text-white/30 fill-white/30'}`} />
                ))}
              </div>
              <Quote className="w-6 h-6 text-white/30 mb-3" fill="currentColor" />
              <p className="text-white/90 text-sm leading-relaxed flex-1 mb-5">{r.comment}</p>
              <div className="border-t border-white/20 pt-4">
                <p className="text-white font-bold text-sm">{r.name}</p>
                <p className="text-white/70 text-xs mt-0.5">{r.title} · {r.company}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden">
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                className="bg-white/15 border border-white/20 rounded-2xl p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si}
                      className={`w-4 h-4 ${si < reviews[current].rating ? 'text-white fill-white' : 'text-white/30 fill-white/30'}`} />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-white/30 mb-3" fill="currentColor" />
                <p className="text-white/90 text-sm leading-relaxed mb-5">{reviews[current].comment}</p>
                <div className="border-t border-white/20 pt-4">
                  <p className="text-white font-bold text-sm">{reviews[current].name}</p>
                  <p className="text-white/70 text-xs mt-0.5">{reviews[current].title} · {reviews[current].company}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={prev}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/40'}`} />
              ))}
            </div>
            <button onClick={next}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}
