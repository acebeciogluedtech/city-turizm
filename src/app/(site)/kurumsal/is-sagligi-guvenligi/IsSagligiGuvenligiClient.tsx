'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronRight, Shield, AlertTriangle, Users, TrendingUp,
  Target, BookOpen, CheckCircle, Zap, ClipboardList,
  Heart, HardHat, Eye, Globe, Leaf,
  Star, GraduationCap, Clock, Cpu, Wrench,
  Award, Flame, Lightbulb, Droplets, Wind, Recycle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import type { BilingualContent } from '@/lib/content'

const ICON_MAP: Record<string, LucideIcon> = {
  Shield, AlertTriangle, Users, TrendingUp,
  Target, BookOpen, CheckCircle, Zap, ClipboardList,
  Heart, HardHat, Eye, Globe, Leaf,
  Star, GraduationCap, Clock, Cpu, Wrench,
  Award, Flame, Lightbulb, Droplets, Wind, Recycle,
}


const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay },
})

export default function IsSagligiGuvenligiClient({ initialContent }: { initialContent: BilingualContent }) {
  const { lang } = useLanguage()

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

  // KPIs
  const kpis = [1,2,3,4].map(n => ({
    icon: getIcon('hero', `kpi${n}_icon`, Globe),
    value: v('hero', `kpi${n}_val`, ''),
    label: v('hero', `kpi${n}`, ''),
  })).filter(k => k.label)

  // Goals
  const goals = [1,2,3,4].map(n => ({
    icon: getIcon('goals', `g${n}_icon`, Globe),
    title: v('goals', `g${n}_title`, ''),
    desc: v('goals', `g${n}_desc`, ''),
  })).filter(g => g.title)

  // Principles
  const principles = [1,2,3,4,5,6].map(n => ({
    icon: getIcon('principles', `pr${n}_icon`, Globe),
    label: v('principles', `pr${n}_title`, ''),
    desc: v('principles', `pr${n}_desc`, ''),
  })).filter(p => p.label)

  // ISO items
  const isoItems = [1,2,3,4].map(n => v('policy', `iso${n}`, '')).filter(Boolean)

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <div className="relative bg-gray-900 pt-36 pb-20 overflow-hidden" style={{ minHeight: 440 }}>
        {(
          <img
            src={v('hero', 'hero_img', '/city-bina.jpeg')}
            alt="İş Sağlığı ve Güvenliği"
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
              {v('hero', 'title', lang === 'tr' ? 'İş Sağlığı & Güvenliği' : 'Occupational Health & Safety')}
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
              {v('hero', 'title', lang === 'tr' ? 'İş Sağlığı & Güvenliği' : 'Occupational Health & Safety')}
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
              {v('hero', 'subtitle', '')}
            </p>
          </motion.div>

          {kpis.length > 0 && (
            <motion.div {...fadeUp(0.15)} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              {kpis.map((k, i) => {
                const Icon = k.icon
                return (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm hover:bg-white/8 transition-colors">
                    <Icon className="w-5 h-5 text-amber-400 mb-2" strokeWidth={1.5} />
                    <p className="text-xl font-black text-white whitespace-pre-line leading-tight">{k.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{k.label}</p>
                  </div>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="max-w-5xl mx-auto space-y-20">

          {/* ── Temel Politika ── */}
          <motion.div {...fadeUp()} className="grid lg:grid-cols-[1fr_340px] gap-12 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {v('policy', 'pol_title', lang === 'tr' ? 'İSG Politikamız' : 'Our OHS Policy')}
                  </h2>
                  <p className="text-sm text-gray-400">{v('policy', 'pol_desc', '')}</p>
                </div>
              </div>
              <div className="space-y-5 text-gray-600 leading-relaxed text-[15px]">
                <p>{v('policy', 'pol_p1', '')}</p>
                <blockquote className="border-l-4 border-amber-500 pl-5 py-3 bg-amber-50/60 rounded-r-2xl">
                  <p className="text-gray-700 font-semibold text-sm leading-relaxed italic">
                    &quot;{v('policy', 'pol_quote', '')}&quot;
                  </p>
                </blockquote>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-7">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center mb-5">
                <Eye className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="font-black text-gray-900 text-base mb-4">{v('policy', 'iso_title', '')}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{v('policy', 'iso_desc', '')}</p>
              <ul className="space-y-2.5">
                {isoItems.map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* ── Ana Hedefler ── */}
          {goals.length > 0 && (
            <motion.div {...fadeUp()}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {v('goals', 'goal_title', lang === 'tr' ? 'Ana Hedeflerimiz' : 'Our Main Goals')}
                  </h2>
                  <p className="text-sm text-gray-400">{v('goals', 'goal_desc', '')}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {goals.map((item, i) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.09 }}
                      className="group flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm
                                 hover:border-amber-200 hover:shadow-md hover:shadow-amber-500/8
                                 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-50 group-hover:bg-amber-500
                                      flex items-center justify-center transition-colors duration-200">
                        <Icon className="w-6 h-6 text-amber-500 group-hover:text-white transition-colors duration-200" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm mb-2">{item.title}</p>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── İlkelerimiz ── */}
          {principles.length > 0 && (
            <motion.div {...fadeUp()}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {v('principles', 'pr_title', lang === 'tr' ? 'Temel İlkelerimiz' : 'Our Core Principles')}
                  </h2>
                  <p className="text-sm text-gray-400">{v('principles', 'pr_desc', '')}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {principles.map((p, i) => {
                  const Icon = p.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.07 }}
                      className="group flex items-start gap-3.5 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm
                                 hover:border-amber-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-amber-500
                                      flex items-center justify-center transition-colors duration-200">
                        <Icon className="w-5 h-5 text-amber-500 group-hover:text-white transition-colors duration-200" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm mb-1">{p.label}</p>
                        <p className="text-xs text-gray-400 leading-relaxed">{p.desc}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </main>
  )
}
