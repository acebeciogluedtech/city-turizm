'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, Shield, FileText, Users, Lock, Send, Eye, Database, RefreshCw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import type { BilingualContent } from '@/lib/content'


const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay },
})

const articleIcons: LucideIcon[] = [FileText, Database, Users, RefreshCw, Lock, Send, FileText, RefreshCw, Database, Shield, Eye]

export default function KvkkClient({ initialContent }: { initialContent: BilingualContent }) {
  const { lang } = useLanguage()

  function v(sectionId: string, fieldId: string, fallback = ''): string {
    const entry = initialContent[`${sectionId}.${fieldId}`]
    if (!entry) return fallback
    const val = lang === 'tr' ? entry.tr : (entry.en || entry.tr)
    return val || fallback
  }

  // Build articles
  const articles = Array.from({length: 11}, (_, i) => {
    const n = i + 1
    return {
      number: `${n}`,
      title: v('articles', `a${n}_title`, ''),
      content: v('articles', `a${n}_text`, ''),
      icon: articleIcons[i] || FileText,
    }
  }).filter(a => a.title)

  // Contact methods
  const contactMethods = [1,2,3].map(n => v('contact', `ct${n}`, '')).filter(Boolean)

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <div className="relative bg-gray-900 pt-28 sm:pt-36 pb-20 overflow-hidden" style={{ minHeight: 400 }}>
        {(
          <img
            src={v('hero', 'hero_img', '/city-bina.jpeg')}
            alt="KVKK"
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
              {v('hero', 'title', 'KVKK')}
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
              {v('hero', 'title', lang === 'tr' ? 'Kişisel Verilerin Korunması' : 'Protection of Personal Data')}
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
              {v('hero', 'subtitle', '')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">

          {/* Intro */}
          <motion.div {...fadeUp()} className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-12">
            <p className="text-sm text-gray-700 leading-relaxed">
              {v('intro', 'intro_text', '')}
            </p>
          </motion.div>

          {/* Articles */}
          <div className="space-y-8">
            {articles.map((article, i) => {
              const Icon = article.icon
              return (
                <motion.div
                  key={article.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.04 }}
                  className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-500 tracking-widest">
                        {lang === 'tr' ? 'Madde' : 'Article'} {article.number}
                      </span>
                      <h2 className="text-lg font-black text-gray-900 mt-0.5">{article.title}</h2>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                    {article.content.split('\n\n').map((para, j) => (
                      <div key={j}>
                        {para.includes('\n') ? (
                          <div className="space-y-1.5">
                            {para.split('\n').map((line, k) => {
                              if (line.startsWith('•') || line.startsWith('- ')) {
                                return (
                                  <div key={k} className="flex items-start gap-2.5">
                                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-2" />
                                    <span>{line.replace(/^[•\-]\s*/, '')}</span>
                                  </div>
                                )
                              }
                              if (line.includes(':') && line.indexOf(':') < 40) {
                                const [term, ...rest] = line.split(':')
                                return (
                                  <div key={k} className="flex gap-3">
                                    <span className="font-semibold text-gray-800 flex-shrink-0 min-w-[180px]">{term}:</span>
                                    <span>{rest.join(':')}</span>
                                  </div>
                                )
                              }
                              return <p key={k}>{line}</p>
                            })}
                          </div>
                        ) : (
                          <p>{para}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Contact / Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-10 bg-gray-50 border border-gray-100 rounded-3xl p-8"
          >
            <h3 className="text-lg font-black text-gray-900 mb-4">
              {v('contact', 'ct_title', lang === 'tr' ? 'Haklarınızı Nasıl Kullanabilirsiniz?' : 'How Can You Exercise Your Rights?')}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              {v('contact', 'ct_desc', '')}
            </p>
            <ul className="space-y-3 text-sm text-gray-600">
              {contactMethods.map((method, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                  {method}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-gray-400 leading-relaxed">
              {v('contact', 'ct_note', '')}
            </p>
          </motion.div>

        </div>
      </div>
    </main>
  )
}
