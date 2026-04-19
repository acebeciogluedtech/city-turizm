'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  Leaf, Droplets, Wind, Recycle, Globe, Zap,
  BookOpen, AlertTriangle, TrendingUp, Users, Shield, Eye,
  TreePine, Waves, FlaskConical, Target,
  Star, GraduationCap, Heart, Clock, Cpu,
  ClipboardList, UserCheck, Flame, HardHat, BusFront,
  Car, ArrowRightLeft, Fuel, Handshake, Award, Wrench,
  CheckCircle, Lightbulb, ShieldCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import type { BilingualContent } from '@/lib/content'

const ICON_MAP: Record<string, LucideIcon> = {
  Leaf, Droplets, Wind, Recycle, Globe, Zap,
  BookOpen, AlertTriangle, TrendingUp, Users, Shield, Eye,
  TreePine, Waves, FlaskConical, Target,
  Star, GraduationCap, Heart, Clock, Cpu,
  ClipboardList, UserCheck, Flame, HardHat, BusFront,
  Car, ArrowRightLeft, Fuel, Handshake, Award, Wrench,
  CheckCircle, Lightbulb, ShieldCheck,
}


const categoryColors: Record<string, string> = {
  'Genel': 'bg-gray-100 text-gray-600', 'Su': 'bg-blue-100 text-blue-700',
  'Hava': 'bg-sky-100 text-sky-700', 'Çevre': 'bg-green-100 text-green-700',
  'Kimyasal': 'bg-purple-100 text-purple-700', 'Uyum': 'bg-indigo-100 text-indigo-700',
  'Enerji': 'bg-amber-100 text-amber-700', 'Atık': 'bg-emerald-100 text-emerald-700',
  'Farkındalık': 'bg-rose-100 text-rose-700', 'Yatırım': 'bg-teal-100 text-teal-700',
  'General': 'bg-gray-100 text-gray-600', 'Water': 'bg-blue-100 text-blue-700',
  'Air': 'bg-sky-100 text-sky-700', 'Environment': 'bg-green-100 text-green-700',
  'Chemical': 'bg-purple-100 text-purple-700', 'Compliance': 'bg-indigo-100 text-indigo-700',
  'Energy': 'bg-amber-100 text-amber-700', 'Waste': 'bg-emerald-100 text-emerald-700',
  'Awareness': 'bg-rose-100 text-rose-700', 'Investment': 'bg-teal-100 text-teal-700',
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay },
})

export default function CevreSuPolitikalariClient({ initialContent }: { initialContent: BilingualContent }) {
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

  // Build hero tags
  const heroTags = [1,2,3,4].map(n => ({
    icon: getIcon('hero', `tag${n}_icon`, Globe),
    label: v('hero', `tag${n}`, ''),
  })).filter(t => t.label)

  // Build pillars
  const pillars = [1,2,3,4].map(n => ({
    icon: getIcon('pillars', `pl${n}_icon`, Globe),
    title: v('pillars', `pl${n}_title`, ''),
    desc: v('pillars', `pl${n}_desc`, ''),
  })).filter(p => p.title)

  // Build policy items
  const defaultIcons = [Globe, Droplets, Wind, TrendingUp, Eye, Leaf, Shield, Zap, Recycle, Droplets, Users, BookOpen, AlertTriangle, Droplets, TreePine]
  const policyItems = Array.from({length: 15}, (_, i) => {
    const n = i + 1
    return {
      icon: getIcon('policy', `e${n}_icon`, defaultIcons[i] || Globe),
      category: v('policy', `e${n}_cat`, ''),
      text: v('policy', `e${n}`, ''),
    }
  }).filter(p => p.text)

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <div className="relative bg-gray-900 pt-28 sm:pt-36 pb-20 overflow-hidden" style={{ minHeight: 440 }}>
        {(
          <img
            src={v('hero', 'hero_img', '/cevre-banner.jpg')}
            alt="Çevre & Su Politikaları"
            className="absolute inset-0 w-full h-full object-cover object-center animate-fade-in"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/88 via-gray-900/65 to-gray-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-gray-900/25" />

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
              {v('hero', 'title', lang === 'tr' ? 'Çevre & Su Politikaları' : 'Environmental & Water Policies')}
            </span>
          </div>

          <motion.div {...fadeUp()}>
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-xs font-bold tracking-widest">
                {v('hero', 'badge', lang === 'tr' ? 'Sürdürülebilirlik' : 'Sustainability')}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              {v('hero', 'title', lang === 'tr' ? 'Çevre & Su Politikaları' : 'Environmental & Water Policies')}
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
              {v('hero', 'subtitle', '')}
            </p>
          </motion.div>

          {/* 4 pillar strip */}
          {heroTags.length > 0 && (
            <motion.div {...fadeUp(0.15)} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              {heroTags.map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm hover:bg-white/8 transition-colors">
                    <Icon className="w-5 h-5 text-amber-400 mb-2" strokeWidth={1.5} />
                    <p className="text-sm font-bold text-white">{item.label}</p>
                  </div>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="max-w-5xl mx-auto space-y-16">

          {/* ── 4 Temel Sütun ── */}
          {pillars.length > 0 && (
            <motion.div {...fadeUp()}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {pillars.map((p, i) => {
                  const Icon = p.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      className="border border-gray-100 bg-gray-50 rounded-2xl p-5"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-amber-50">
                        <Icon className="w-5 h-5 text-amber-500" strokeWidth={1.75} />
                      </div>
                      <p className="font-black text-gray-900 text-sm mb-1">{p.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── Politika Maddeleri ── */}
          {policyItems.length > 0 && (
            <motion.div {...fadeUp()}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {v('policy', 'pol_title', lang === 'tr' ? 'Çevre & Su Politikamız' : 'Our Environmental & Water Policy')}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {v('policy', 'pol_desc', '')}
                  </p>
                </div>
              </div>

              <div className="mt-6 mb-8 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5">
                <p className="text-sm text-amber-800 leading-relaxed font-medium">
                  {v('policy', 'pol_intro', '')}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {policyItems.map((item, i) => {
                  const Icon = item.icon
                  const catColor = categoryColors[item.category] ?? 'bg-gray-100 text-gray-600'
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
                      <div className="flex-1 min-w-0">
                        {item.category && (
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider rounded-md px-2 py-0.5 mb-1.5 ${catColor}`}>
                            {item.category}
                          </span>
                        )}
                        <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
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
