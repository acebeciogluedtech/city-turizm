'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronRight, Users, Target, GraduationCap, Star,
  Shield, Lightbulb, TrendingUp, Heart, CheckCircle,
  ClipboardList, UserCheck, BookOpen, Handshake,
  Zap, Globe, Award, Compass, MapPin, Eye, Clock, Wrench, Cpu,
  BusFront, Car, ArrowRightLeft, Fuel,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import type { BilingualContent } from '@/lib/content'

const ICON_MAP: Record<string, LucideIcon> = {
  Users, Target, GraduationCap, Star, Shield, Lightbulb, TrendingUp, Heart,
  ClipboardList, UserCheck, BookOpen, Handshake, Zap, Globe, Award, Compass,
  MapPin, Eye, Clock, Wrench, Cpu, BusFront, Car, ArrowRightLeft, Fuel,
}


const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay },
})

export default function InsanKaynaklariClient({ initialContent }: { initialContent: BilingualContent }) {
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

  const heroTags = [1,2,3,4].map(n => ({
    icon: getIcon('hero', `tag${n}_icon`, [Users, GraduationCap, Target, BookOpen][n-1]),
    label: v('hero', `tag${n}`, ''),
  })).filter(t => t.label)

  const whyReasons = [1,2,3,4,5].map(n => v('vision', `why${n}`, '')).filter(Boolean)

  const defaultValIcons = [Shield, Star, Lightbulb, TrendingUp, GraduationCap, Heart]
  const values = [1,2,3,4,5,6].map(n => ({
    icon: getIcon('values', `v${n}_icon`, defaultValIcons[n-1]),
    title: v('values', `v${n}_title`, ''),
    desc: v('values', `v${n}_desc`, ''),
  })).filter(val => val.title)

  const defaultHireIcons = [ClipboardList, UserCheck, Users, Handshake]
  const hiringSteps = [1,2,3,4].map(n => ({
    icon: getIcon('hiring', `h${n}_icon`, defaultHireIcons[n-1]),
    step: `0${n}`,
    title: v('hiring', `h${n}_title`, ''),
    desc: v('hiring', `h${n}_desc`, ''),
  })).filter(s => s.title)

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <div className="relative bg-gray-900 pt-28 sm:pt-36 pb-20 overflow-hidden" style={{ minHeight: 480 }}>
        {(
          <img
            src={v('hero', 'hero_img', '/ik-banner.jpg')}
            alt="İnsan Kaynakları"
            className="absolute inset-0 w-full h-full object-cover object-top animate-fade-in"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/88 via-gray-900/65 to-gray-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-gray-900/20" />

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
              {v('hero', 'title', lang === 'tr' ? 'İnsan Kaynakları' : 'Human Resources')}
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
              {v('hero', 'title', lang === 'tr' ? 'İnsan Kaynakları' : 'Human Resources')}
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
              {v('hero', 'subtitle', '')}
            </p>
          </motion.div>

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
        <div className="max-w-5xl mx-auto space-y-20">

          {/* ── Vizyon ── */}
          <motion.div {...fadeUp()} className="grid lg:grid-cols-[1fr_360px] gap-12 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {v('vision', 'vis_title', lang === 'tr' ? 'İnsan Kaynakları Vizyonu' : 'HR Vision')}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {v('vision', 'vis_desc', '')}
                  </p>
                </div>
              </div>
              <div className="space-y-5 text-gray-600 leading-relaxed text-[15px]">
                <p>{v('vision', 'vis_p1', '')}</p>
                <p>{v('vision', 'vis_p2', '')}</p>
                <p>{v('vision', 'vis_p3', '')}</p>
              </div>
            </div>

            {whyReasons.length > 0 && (
              <div className="bg-gray-50 border border-gray-100 rounded-3xl p-7">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center mb-5">
                  <Users className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-4">
                  {v('vision', 'why_title', lang === 'tr' ? 'Neden City Turizm?' : 'Why City Turizm?')}
                </h3>
                <ul className="space-y-3">
                  {whyReasons.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          {/* ── Değerlerimiz ── */}
          {values.length > 0 && (
            <motion.div {...fadeUp()}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {v('values', 'val_title', lang === 'tr' ? 'İK Değerlerimiz' : 'Our HR Values')}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {v('values', 'val_desc', '')}
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {values.map((val, i) => {
                  const Icon = val.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.07 }}
                      className="group flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm
                                 hover:border-amber-200 hover:shadow-md hover:shadow-amber-500/8 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-amber-50 group-hover:bg-amber-500
                                      flex items-center justify-center transition-colors duration-200">
                        <Icon className="w-5 h-5 text-amber-500 group-hover:text-white transition-colors duration-200" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-1">{val.title}</p>
                        <p className="text-xs text-gray-400 leading-relaxed">{val.desc}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── İşe Alım Süreci ── */}
          {hiringSteps.length > 0 && (
            <motion.div {...fadeUp()}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {v('hiring', 'hire_title', lang === 'tr' ? 'İşe Alım Sürecimiz' : 'Our Hiring Process')}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {v('hiring', 'hire_desc', '')}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {hiringSteps.map((s, i) => {
                  const Icon = s.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.09 }}
                      className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm
                                 hover:border-amber-200 hover:shadow-md hover:shadow-amber-500/8
                                 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <span className="absolute top-4 right-4 text-4xl font-black text-gray-100 leading-none select-none">
                        {s.step}
                      </span>
                      <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
                      </div>
                      <p className="font-bold text-gray-900 text-sm mb-2">{s.title}</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
                    </motion.div>
                  )
                })}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div>
                  <h3 className="text-xl font-black text-white mb-1">
                    {v('cta', 'cta_title', lang === 'tr' ? 'Ekibimize Katılın' : 'Join Our Team')}
                  </h3>
                  <p className="text-amber-100 text-sm">
                    {v('cta', 'cta_desc', '')}
                  </p>
                </div>
                <Link
                  href="/basvuru"
                  className="flex-shrink-0 bg-white text-amber-600 font-bold text-sm px-6 py-3 rounded-xl
                             hover:bg-amber-50 transition-colors shadow-lg shadow-amber-700/20"
                >
                  {v('cta', 'cta_btn', lang === 'tr' ? 'Hemen Başvur' : 'Apply Now')}
                </Link>
              </motion.div>
            </motion.div>
          )}

        </div>
      </div>
    </main>
  )
}
