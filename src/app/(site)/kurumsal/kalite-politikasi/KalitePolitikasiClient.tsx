'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, CheckCircle, X, ZoomIn,
  Shield, Award, TrendingUp, Users, AlertTriangle, Wrench, Zap,
  Lightbulb, Star, GraduationCap, Heart, Target, Eye, Clock, Cpu,
  BookOpen, ClipboardList, UserCheck, Flame, HardHat, BusFront,
  Car, ArrowRightLeft, Fuel, Handshake,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import type { BilingualContent } from '@/lib/content'

const ICON_MAP: Record<string, LucideIcon> = {
  Shield, Award, TrendingUp, Users, AlertTriangle, Wrench, Zap,
  CheckCircle, Lightbulb, Star, GraduationCap, Heart, Target,
  Eye, Clock, Cpu, BookOpen, ClipboardList, UserCheck,
  Flame, HardHat, BusFront, Car, ArrowRightLeft, Fuel, Handshake,
}


const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay },
})

export default function KalitePolitikasiClient({ initialContent }: { initialContent: BilingualContent }) {
  const { lang } = useLanguage()
  const [lightbox, setLightbox] = useState<string | null>(null)

  function v(sectionId: string, fieldId: string, fallback = ''): string {
    const entry = initialContent[`${sectionId}.${fieldId}`]
    if (!entry) return fallback
    const val = lang === 'tr' ? entry.tr : (entry.en || entry.tr)
    return val || fallback
  }

  function getIcon(sectionId: string, fieldId: string, fallback: LucideIcon): LucideIcon {
    const name = v(sectionId, fieldId)
    return ICON_MAP[name] || fallback
  }

  // Build policy items dynamically
  const defaultIcons = [TrendingUp, Award, CheckCircle, TrendingUp, AlertTriangle, Shield, CheckCircle, CheckCircle, Shield, TrendingUp, Users, Wrench, Flame, HardHat, Users, Shield, Flame]
  const policyItems = Array.from({length: 17}, (_, i) => {
    const n = i + 1
    return {
      icon: getIcon('policy', `p${n}_icon`, defaultIcons[i]),
      text: v('policy', `p${n}`, ''),
    }
  }).filter(p => p.text)

  // Build certificates dynamically (supports up to 20)
  const certColors = ['from-blue-600 to-blue-500','from-red-600 to-red-500','from-green-600 to-green-500','from-amber-600 to-amber-500','from-indigo-600 to-indigo-500','from-rose-600 to-rose-500','from-teal-600 to-teal-500','from-purple-600 to-purple-500','from-cyan-600 to-cyan-500','from-pink-600 to-pink-500']
  const certificates: { title: string; subtitle: string; issuer: string; scope: string; src: string; color: string }[] = []
  for (let n = 1; n <= 20; n++) {
    const title = v('certs', `c${n}_title`, '')
    if (!title && n > 6) break
    if (title) {
      certificates.push({
        title,
        subtitle: v('certs', `c${n}_sub`, ''),
        issuer: v('certs', `c${n}_issuer`, ''),
        scope: v('certs', `c${n}_scope`, ''),
        src: v('certs', `c${n}_img`, ''),
        color: certColors[(n-1) % certColors.length],
      })
    }
  }

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <div className="relative bg-gray-900 pt-36 pb-20 overflow-hidden" style={{ minHeight: 420 }}>
        {(
          <img
            src={v('hero', 'hero_img', '/otobus-ic.png')}
            alt="Kalite Politikası"
            className="absolute inset-0 w-full h-full object-cover object-center animate-fade-in"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/92 via-gray-900/78 to-gray-900/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-gray-900/30" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex items-center gap-1.5 text-sm mb-8">
            <Link href="/" className="text-gray-400 hover:text-amber-400 transition-colors">
              {lang === 'tr' ? 'Ana Sayfa' : 'Home'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <Link href="/kurumsal/biz-kimiz" className="text-gray-400 hover:text-amber-400 transition-colors">
              {lang === 'tr' ? 'Kurumsal' : 'Corporate'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-amber-400 font-semibold">
              {v('hero', 'title', lang === 'tr' ? 'Kalite Politikası' : 'Quality Policy')}
            </span>
          </div>

          <motion.div {...fadeUp()}>
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-xs font-bold tracking-widest">
                {v('hero', 'badge', lang === 'tr' ? 'Kurumsal' : 'Corporate')}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              {v('hero', 'title', lang === 'tr' ? 'Kalite & İSG Politikası' : 'Quality & OHS Policy')}
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
              {v('hero', 'subtitle', '')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="max-w-5xl mx-auto space-y-20">

          {/* ── Politika Maddeleri ── */}
          {policyItems.length > 0 && (
            <motion.div {...fadeUp()}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {v('policy', 'pol_title', lang === 'tr' ? 'Kalite & İSG Politikamız' : 'Our Quality & OHS Policy')}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {v('policy', 'pol_desc', '')}
                  </p>
                </div>
              </div>

              {/* Intro callout */}
              <div className="mt-6 mb-8 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5">
                <p className="text-sm text-amber-800 leading-relaxed font-medium">
                  {v('policy', 'pol_intro', '')}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {policyItems.map((item, i) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: i * 0.04 }}
                      className="flex items-start gap-3.5 bg-white border border-gray-100 rounded-2xl p-4
                                 hover:border-amber-200 hover:shadow-sm transition-all duration-200 group"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-50 group-hover:bg-amber-500
                                      flex items-center justify-center transition-colors duration-200 mt-0.5">
                        <Icon className="w-4 h-4 text-amber-500 group-hover:text-white transition-colors duration-200" strokeWidth={1.75} />
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── Sertifikalar ── */}
          {certificates.length > 0 && (
            <motion.div {...fadeUp()}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {v('certs', 'cert_title', lang === 'tr' ? 'Kalite Belgelerimiz' : 'Our Quality Certificates')}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {v('certs', 'cert_desc', '')}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {certificates.map((cert, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm
                               hover:shadow-xl hover:shadow-gray-900/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    onClick={() => cert.src && setLightbox(cert.src)}
                  >
                    {/* Certificate image */}
                    <div className="relative h-56 bg-gray-50 overflow-hidden">
                      {cert.src && (
                        <Image
                          src={cert.src}
                          alt={cert.title}
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300
                                      flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center
                                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                          <ZoomIn className="w-4.5 h-4.5 text-gray-700" strokeWidth={2} />
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${cert.color}
                                      rounded-lg px-3 py-1 mb-3`}>
                        <span className="text-white text-xs font-black">{cert.title}</span>
                      </div>
                      <p className="font-bold text-gray-900 text-sm mb-1">{cert.subtitle}</p>
                      <p className="text-xs text-amber-600 font-semibold mb-2">{cert.issuer}</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{cert.scope}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-2xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setLightbox(null)}
                className="absolute -top-4 -right-4 w-9 h-9 rounded-full bg-white shadow-xl
                           flex items-center justify-center z-10 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-700" strokeWidth={2.5} />
              </button>
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={lightbox}
                  alt="Sertifika"
                  width={800}
                  height={1000}
                  className="w-full h-auto object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}
