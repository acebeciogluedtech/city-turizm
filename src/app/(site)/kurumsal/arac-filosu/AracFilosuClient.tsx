'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronRight, MapPin, Cpu, Shield, Users, Wrench,
  BusFront, Car, Zap, Eye, Clock, CheckCircle, Star, TrendingUp,
  Globe, Heart, Award, Compass, Target, Lightbulb, Handshake,
  GraduationCap, Fuel, ArrowRightLeft,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import type { BilingualContent } from '@/lib/content'

const ICON_MAP: Record<string, LucideIcon> = {
  MapPin, Cpu, Shield, Users, Wrench, BusFront, Car, Zap, Eye, Clock,
  Star, TrendingUp, Globe, Heart, Award, Compass, Target, Lightbulb,
  Handshake, GraduationCap, Fuel, ArrowRightLeft,
}


const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay },
})

export default function AracFilosuClient({ initialContent }: { initialContent: BilingualContent }) {
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

  const stats = [1,2,3,4].map(n => ({
    icon: getIcon('hero', `st${n}_icon`, [BusFront, Car, Star, Cpu][n-1]),
    value: v('hero', `st${n}_val`, ['300+','1500+','40+','GPS'][n-1]),
    label: v('hero', `st${n}_lbl`, ''),
  }))

  const advantages = [1,2,3,4,5,6].map(n => v('gps', `adv${n}`, '')).filter(Boolean)

  const vehicleTypes = [1,2,3,4].map(n => ({
    label: v('vehicles', `v${n}_label`, ''),
    capacity: v('vehicles', `v${n}_cap`, ''),
    count: v('vehicles', `v${n}_count`, ''),
    desc: v('vehicles', `v${n}_desc`, ''),
    icon: n <= 2 ? BusFront : Car,
  })).filter(vt => vt.label)

  const defaultFeatIcons = [MapPin, Eye, Clock, Shield, Wrench, Zap]
  const features = [1,2,3,4,5,6].map(n => ({
    icon: getIcon('features', `f${n}_icon`, defaultFeatIcons[n-1]),
    title: v('features', `f${n}_title`, ''),
    desc: v('features', `f${n}_desc`, ''),
  })).filter(f => f.title)

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <div className="relative bg-gray-900 pt-36 pb-20 overflow-hidden" style={{ minHeight: 480 }}>
        {(
          <img
            src={v('hero', 'hero_img', '/arac-filosu-banner.jpg')}
            alt="Araç Filosu"
            className="absolute inset-0 w-full h-full object-cover object-center animate-fade-in"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/40" />
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
              {v('hero', 'title', lang === 'tr' ? 'Araç Filosu' : 'Our Fleet')}
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
              {v('hero', 'title', lang === 'tr' ? 'Araç Filosu' : 'Our Fleet')}
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
              {v('hero', 'subtitle', '')}
            </p>
          </motion.div>

          <motion.div {...fadeUp(0.15)} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {stats.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm hover:bg-white/8 transition-colors">
                  <Icon className="w-5 h-5 text-amber-400 mb-2" strokeWidth={1.5} />
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              )
            })}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="max-w-5xl mx-auto space-y-20">

          {/* ── GPS & Ana Metin ── */}
          <motion.div {...fadeUp()} className="grid lg:grid-cols-[1fr_340px] gap-12 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {v('gps', 'gps_title', lang === 'tr' ? 'Size Özel GPS ve Harita Programı' : 'Custom GPS and Map Software')}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {v('gps', 'gps_desc', '')}
                  </p>
                </div>
              </div>
              <div className="space-y-5 text-gray-600 leading-relaxed text-[15px]">
                <p>{v('gps', 'gps_p1', '')}</p>
                <p>{v('gps', 'gps_p2', '')}</p>
                <p>{v('gps', 'gps_p3', '')}</p>
              </div>
            </div>

            {advantages.length > 0 && (
              <div className="bg-gray-50 border border-gray-100 rounded-3xl p-7">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center mb-5">
                  <TrendingUp className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="font-black text-gray-900 text-base mb-4">
                  {v('gps', 'adv_title', lang === 'tr' ? 'Filo Avantajlarımız' : 'Our Fleet Advantages')}
                </h3>
                <ul className="space-y-3">
                  {advantages.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
                      <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          {/* ── Araç Tipleri ── */}
          {vehicleTypes.length > 0 && (
            <motion.div {...fadeUp()}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {v('vehicles', 'veh_title', lang === 'tr' ? 'Araç Tiplerimiz' : 'Our Vehicle Types')}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {v('vehicles', 'veh_desc', '')}
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {vehicleTypes.map((vt, i) => {
                  const Icon = vt.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center
                                 hover:border-amber-200 hover:shadow-md hover:shadow-amber-500/8
                                 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 group-hover:bg-amber-500
                                      flex items-center justify-center mx-auto mb-4 transition-colors duration-200">
                        <Icon className="w-7 h-7 text-amber-500 group-hover:text-white transition-colors duration-200" strokeWidth={1.5} />
                      </div>
                      <p className="font-black text-gray-900 text-sm mb-1">{vt.label}</p>
                      <p className="text-xs font-bold text-amber-500 mb-2">{vt.count} {lang === 'tr' ? 'araç' : 'vehicles'}</p>
                      <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg px-2.5 py-1 mb-3">
                        <Users className="w-3 h-3 text-gray-500" strokeWidth={2} />
                        <span className="text-[11px] font-semibold text-gray-600">{vt.capacity}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{vt.desc}</p>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── Özellikler ── */}
          {features.length > 0 && (
            <motion.div {...fadeUp()}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {v('features', 'feat_title', lang === 'tr' ? 'Filomuzun Özellikleri' : 'Fleet Features')}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {v('features', 'feat_desc', '')}
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((f, i) => {
                  const Icon = f.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.07 }}
                      className="group flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm
                                 hover:border-amber-200 hover:shadow-md hover:shadow-amber-500/8
                                 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-amber-50 group-hover:bg-amber-500
                                      flex items-center justify-center transition-colors duration-200">
                        <Icon className="w-5 h-5 text-amber-500 group-hover:text-white transition-colors duration-200" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-1">{f.title}</p>
                        <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-8
                       flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div>
              <h3 className="text-xl font-black text-white mb-1">
                {v('cta', 'cta_title', lang === 'tr' ? 'Filo Hizmetlerimizden Yararlanın' : 'Take Advantage of Our Fleet Services')}
              </h3>
              <p className="text-amber-100 text-sm">
                {v('cta', 'cta_desc', '')}
              </p>
            </div>
            <Link
              href="/teklif-al"
              className="flex-shrink-0 bg-white text-amber-600 font-bold text-sm px-6 py-3 rounded-xl
                         hover:bg-amber-50 transition-colors shadow-lg shadow-amber-700/20"
            >
              {v('cta', 'cta_btn', lang === 'tr' ? 'Teklif Al' : 'Get a Quote')}
            </Link>
          </motion.div>

        </div>
      </div>
    </main>
  )
}
