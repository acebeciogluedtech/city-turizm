'use client'

import { useState } from 'react'
import Link from 'next/link'

import { motion } from 'framer-motion'
import {
  ChevronRight,
  Users, BusFront, GraduationCap, Car, Compass, Fuel, ArrowRightLeft,
  Target, Lightbulb, Heart, Shield, Star, TrendingUp, Globe, Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import type { BilingualContent } from '@/lib/content'

// Icon map for dynamic icon resolution
const ICON_MAP: Record<string, LucideIcon> = {
  Star, Users, Heart, Globe, Shield, TrendingUp, Zap, Compass,
  GraduationCap, Car, ArrowRightLeft, Fuel, Target, Lightbulb, BusFront,
}


const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay },
})

export default function BizKimizClient({ initialContent }: { initialContent: BilingualContent }) {
  const { lang } = useLanguage()

  // Helper to get field value — falls back to TR if EN empty, then to fallback
  function v(sectionId: string, fieldId: string, fallback = ''): string {
    const entry = initialContent[`${sectionId}.${fieldId}`]
    if (!entry) return fallback
    const val = lang === 'tr' ? entry.tr : (entry.en || entry.tr)
    return val || fallback
  }

  // Get icon component by name
  function getIcon(sectionId: string, fieldId: string, fallback: LucideIcon): LucideIcon {
    const name = v(sectionId, fieldId)
    return ICON_MAP[name] || fallback
  }

  // Build stats array
  const stats = [1, 2, 3, 4].map(n => ({
    value: v('hero', `stat${n}_val`, ['40+', '500+', '98%', '6'][n-1]),
    label: v('hero', `stat${n}_lbl`, ['Yıllık Deneyim', 'Kurumsal Müşteri', 'Müşteri Memnuniyeti', 'Faaliyet Alanı'][n-1]),
    icon: getIcon('hero', `stat${n}_icon`, [Star, Users, Heart, Globe][n-1]),
  }))

  // Build services array
  const defaultSrvIcons = [GraduationCap, Car, ArrowRightLeft, Users, Compass, Fuel]
  const services = [1, 2, 3, 4, 5, 6].map(n => ({
    icon: getIcon('services', `srv${n}_icon`, defaultSrvIcons[n-1]),
    label: v('services', `srv${n}`, ''),
  }))

  // Card items
  const defaultCardIcons = [Star, Shield, TrendingUp, Zap]
  const cardItems = [1, 2, 3, 4].map(n => ({
    icon: getIcon('about', `card_icon${n}`, defaultCardIcons[n-1]),
    text: v('about', `card_item${n}`, ''),
  }))

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO BANNER ── */}
      <div className="relative bg-gray-900 pt-36 pb-20 overflow-hidden" style={{ minHeight: 480 }}>
        {(
          <img
            src={v('hero', 'hero_img', '/city-bina.jpeg')}
            alt="City Turizm Bina"
            className="absolute inset-0 w-full h-full object-cover object-center animate-fade-in"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/75 to-gray-900/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-gray-900/30" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm mb-8">
            <Link href="/" className="text-gray-400 hover:text-amber-400 transition-colors">
              {lang === 'tr' ? 'Ana Sayfa' : 'Home'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-gray-400">{lang === 'tr' ? 'Kurumsal' : 'Corporate'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-amber-400 font-semibold">{lang === 'tr' ? 'Biz Kimiz' : 'About Us'}</span>
          </div>

          <motion.div {...fadeUp()}>
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30
                            rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-xs font-bold tracking-widest">
                {v('hero', 'badge', lang === 'tr' ? 'Kurumsal' : 'Corporate')}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
              {lang === 'tr' ? (
                <>Biz <span className="text-amber-400">Kimiz?</span></>
              ) : (
                <>Who <span className="text-amber-400">We Are?</span></>
              )}
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
              {v('hero', 'subtitle', lang === 'tr'
                ? '40 yılı aşkın deneyimle ulaşım sektöründe güvenin ve kalitenin adresi olan City Turizm\'i daha yakından tanıyın.'
                : 'Discover City Turizm, the benchmark of trust and quality in the transportation industry with over 40 years of experience.'
              )}
            </p>
          </motion.div>

          {/* Stats strip */}
          <motion.div {...fadeUp(0.15)}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {stats.map(s => {
              const Icon = s.icon
              return (
                <div key={s.label}
                  className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4
                             backdrop-blur-sm hover:bg-white/8 transition-colors">
                  <Icon className="w-5 h-5 text-amber-400 mb-2" strokeWidth={1.5} />
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              )
            })}
          </motion.div>
        </div>
      </div>


      {/* ── CONTENT ── */}
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">

          {/* Intro text */}
          <div className="grid lg:grid-cols-[1fr_340px] gap-12 mb-20">
            <motion.div {...fadeUp()}>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 leading-snug">
                {(() => {
                  const raw = v('about', 'about_title', lang === 'tr' ? 'City Turizm Hakkımızda' : 'About City Turizm')
                  if (raw.includes('Hakkımızda')) {
                    const parts = raw.split('Hakkımızda')
                    return <>{parts[0]}<span className="text-amber-500">Hakkımızda</span>{parts[1]}</>
                  }
                  if (raw.includes('About')) {
                    const parts = raw.split('About')
                    return <><span className="text-amber-500">About</span>{parts[1]}</>
                  }
                  return raw
                })()}
              </h2>
              <div className="space-y-5 text-gray-600 leading-relaxed">
                <p>
                  {v('about', 'about_p1', '')}
                </p>
                <p>
                  {v('about', 'about_p2', '')}
                </p>
                <blockquote className="border-l-4 border-amber-500 pl-5 py-2 bg-amber-50/50 rounded-r-xl">
                  <p className="text-gray-700 font-medium italic">
                    &quot;{v('about', 'quote', lang === 'tr' ? 'Taşıdığımız en önemli şey güveniniz' : 'The most important thing we carry is your trust')}&quot;
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {v('about', 'quote_desc', '')}
                  </p>
                </blockquote>
              </div>
            </motion.div>

            {/* Side info card */}
            <motion.div {...fadeUp(0.1)}>
              <div className="bg-gray-50 rounded-3xl border border-gray-100 p-7 h-full">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center mb-5">
                  <BusFront className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2">
                  {v('about', 'card_title', 'City Turizm')}
                </h3>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                  {v('about', 'card_desc', lang === 'tr'
                    ? 'İstanbul merkezli, Türkiye genelinde hizmet veren köklü ulaşım firması.'
                    : 'Istanbul-based, established transportation company serving across Turkey.'
                  )}
                </p>
                <ul className="space-y-3">
                  {cardItems.map((item, idx) => {
                    const Icon = item.icon
                    return (
                      <li key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.75} />
                        </div>
                        {item.text}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Faaliyet Alanları */}
          <motion.div {...fadeUp()} className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 rounded-full bg-amber-500" />
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  {v('services', 'srv_title', lang === 'tr' ? 'Faaliyet Alanlarımız' : 'Our Business Areas')}
                </h2>
                <p className="text-sm text-gray-400">
                  {v('services', 'srv_desc', lang === 'tr' ? '40 yılı aşkın süredir hizmet verdiğimiz alanlar' : 'Areas we have been serving for over 40 years')}
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((s, i) => {
                const Icon = s.icon
                return (
                  <motion.div
                    key={s.label || i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    className="group flex items-center gap-4 bg-white border border-gray-100
                               rounded-2xl p-5 shadow-sm
                               hover:border-amber-200 hover:shadow-md hover:shadow-amber-500/8
                               hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-amber-50
                                    group-hover:bg-amber-500 flex items-center justify-center
                                    transition-colors duration-200">
                      <Icon className="w-5 h-5 text-amber-500 group-hover:text-white
                                       transition-colors duration-200" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900
                                  transition-colors leading-snug">
                      {s.label}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Vizyon & Misyon */}
          <motion.div {...fadeUp()}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 rounded-full bg-amber-500" />
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  {v('vision', 'vm_title', lang === 'tr' ? 'Vizyon & Misyon' : 'Vision & Mission')}
                </h2>
                <p className="text-sm text-gray-400">
                  {v('vision', 'vm_desc', lang === 'tr' ? 'Geleceğe bakışımız ve temel değerlerimiz' : 'Our outlook and core values')}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Vizyon */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                className="relative bg-gradient-to-br from-amber-500 to-amber-600
                           rounded-3xl p-8 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full
                                bg-white/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full
                                bg-black/5 translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
                    {(() => { const VizIcon = getIcon('vision', 'viz_icon', Target); return <VizIcon className="w-6 h-6 text-white" strokeWidth={1.5} /> })()}
                  </div>
                  <p className="text-white/70 text-xs font-bold tracking-widest mb-2">
                    {v('vision', 'viz_label', lang === 'tr' ? 'Vizyonumuz' : 'Our Vision')}
                  </p>
                  <h3 className="text-xl font-black text-white mb-4">
                    {v('vision', 'viz_title', lang === 'tr' ? 'Sektörde Liderlik' : 'Industry Leadership')}
                  </h3>
                  <p className="text-white/85 text-sm leading-relaxed">
                    {v('vision', 'viz_text', '')}
                  </p>
                </div>
              </motion.div>

              {/* Misyon */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                className="relative bg-gray-900 rounded-3xl p-8 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full
                                bg-amber-500/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full
                                bg-amber-500/5 translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-5">
                    {(() => { const MisIcon = getIcon('vision', 'mis_icon', Lightbulb); return <MisIcon className="w-6 h-6 text-amber-400" strokeWidth={1.5} /> })()}
                  </div>
                  <p className="text-gray-500 text-xs font-bold tracking-widest mb-2">
                    {v('vision', 'mis_label', lang === 'tr' ? 'Misyonumuz' : 'Our Mission')}
                  </p>
                  <h3 className="text-xl font-black text-white mb-4">
                    {v('vision', 'mis_title', lang === 'tr' ? 'Örnek Hizmet Anlayışı' : 'Exemplary Service')}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {v('vision', 'mis_text', '')}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  )
}
