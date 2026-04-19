'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronRight, Cookie, Eye, FileText, Trash2, RefreshCw, CheckCircle,
  Shield, Users, Database, Lock, Target,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import type { BilingualContent } from '@/lib/content'


const ICON_MAP: Record<string, LucideIcon> = {
  Eye, FileText, Trash2, RefreshCw, CheckCircle, Cookie,
  Shield, Users, Database, Lock, Target,
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay },
})



export default function CerezPolitikasiClient({ initialContent }: { initialContent: BilingualContent }) {
  const { lang } = useLanguage()

  function v(sectionId: string, fieldId: string, fallback = ''): string {
    const entry = initialContent[`${sectionId}.${fieldId}`]
    if (!entry) return fallback
    const val = lang === 'tr' ? entry.tr : (entry.en || entry.tr)
    return val || fallback
  }

  function getIcon(fieldId: string, fallback: LucideIcon): LucideIcon {
    const name = v('purposes', fieldId)
    return ICON_MAP[name] || fallback
  }

  const purposes = [1,2,3,4,5,6].map(n => ({
    icon: getIcon(`p${n}_icon`, Eye),
    title: v('purposes', `p${n}_title`, ''),
    desc: v('purposes', `p${n}_desc`, ''),
  })).filter(p => p.title)

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <div className="relative bg-gray-900 pt-28 sm:pt-36 pb-20 overflow-hidden" style={{ minHeight: 400 }}>
        {(
          <img
            src={v('hero', 'hero_img', '/city-bina.jpeg')}
            alt="Çerez Politikası"
            className="absolute inset-0 w-full h-full object-cover object-center animate-fade-in"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/92 via-gray-900/75 to-gray-900/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-gray-900/25" />

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
              {v('hero', 'title', lang === 'tr' ? 'Çerez Politikası' : 'Cookie Policy')}
            </span>
          </div>

          <motion.div {...fadeUp()}>
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-xs font-bold tracking-widest">
                {v('hero', 'badge', lang === 'tr' ? 'Yasal Bilgilendirme' : 'Legal Notice')}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              {v('hero', 'title', lang === 'tr' ? 'Çerez Politikası' : 'Cookie Policy')}
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
              {v('hero', 'subtitle', '')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="max-w-4xl mx-auto space-y-16">

          {/* Intro */}
          <motion.div {...fadeUp()}>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <p className="text-sm text-gray-700 leading-relaxed">
                {v('intro', 'intro_text', '')}
              </p>
            </div>
          </motion.div>

          {/* Purposes */}
          {purposes.length > 0 && (
            <motion.div {...fadeUp()}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {v('purposes', 'pur_title', lang === 'tr' ? 'Amaç ve Kapsam' : 'Purpose and Scope')}
                  </h2>
                  <p className="text-sm text-gray-400">{v('purposes', 'pur_desc', '')}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {purposes.map((p, i) => {
                  const Icon = p.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.07 }}
                      className="group flex items-start gap-3.5 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm
                                 hover:border-amber-200 hover:shadow-md hover:shadow-amber-500/8 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-amber-500
                                      flex items-center justify-center transition-colors duration-200">
                        <Icon className="w-5 h-5 text-amber-500 group-hover:text-white transition-colors duration-200" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm mb-1">{p.title}</p>
                        <p className="text-xs text-gray-400 leading-relaxed">{p.desc}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Removal */}
          <motion.div {...fadeUp()}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 rounded-full bg-amber-500" />
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  {v('removal', 'rm_title', lang === 'tr' ? 'Çerezleri Kaldırma Prosedürü' : 'Cookie Removal Procedure')}
                </h2>
                <p className="text-sm text-gray-400">{v('removal', 'rm_desc', '')}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm">
              <div className="flex items-start gap-4 mb-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">
                    {lang === 'tr' ? 'Tarayıcıdan Çerez Silme' : 'Deleting Cookies from Browser'}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {v('removal', 'rm_text', '')}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {[1,2,3,4].map(n => {
                  const name = v('removal', `b${n}_name`, '')
                  const url = v('removal', `b${n}_url`, '')
                  if (!name) return null
                  return (
                    <a
                      key={n}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all duration-150 group"
                    >
                      <Cookie className="w-4 h-4 text-amber-500 flex-shrink-0" strokeWidth={1.5} />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors">{name}</span>
                    </a>
                  )
                })}
              </div>

              <p className="mt-5 text-xs text-gray-400 leading-relaxed">
                {v('removal', 'rm_note', '')}
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  )
}
