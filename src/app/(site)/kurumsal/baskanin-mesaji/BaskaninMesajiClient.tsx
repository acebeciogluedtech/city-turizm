'use client'

import { useState } from 'react'
import Link from 'next/link'

import { motion } from 'framer-motion'
import {
  ChevronRight, Quote, Shield, Award, Users, TrendingUp,
  Star, Handshake, Globe, Heart, Zap, Compass,
  Target, Lightbulb, GraduationCap, Car, Fuel, BusFront,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import type { BilingualContent } from '@/lib/content'

const ICON_MAP: Record<string, LucideIcon> = {
  Shield, Award, Users, TrendingUp, Star, Handshake, Globe, Heart,
  Zap, Compass, Target, Lightbulb, GraduationCap, Car, Fuel, BusFront,
}


const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay },
})

export default function BaskaninMesajiClient({ initialContent }: { initialContent: BilingualContent }) {
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

  // Build values array
  const defaultValIcons = [Shield, Award, TrendingUp, Users, Handshake, Star]
  const defaultValLabels = lang === 'tr'
    ? ['Güvenlik & Emniyet', 'Hizmet Kalitesi', 'Teknoloji Liderliği', 'Profesyonel Ekip', 'Güven & İş Birliği', 'Öncü Marka Hedefi']
    : ['Safety & Security', 'Service Quality', 'Technology Leadership', 'Professional Team', 'Trust & Cooperation', 'Pioneering Brand Goal']
  const defaultValDescs = lang === 'tr'
    ? ['Her hizmetimizin temel önceliği', 'Sektörde fark yaratan standartlar', 'En son teknolojilerle entegrasyon', 'Özverili ve yenilikçi bakış açısı', 'Uzun soluklu ortaklık anlayışı', 'Sektörün gelişimine katkı sağlamak']
    : ['The top priority of every service', 'Standards that make a difference', 'Integration with latest technologies', 'Dedicated innovative perspective', 'Long-term partnership approach', 'Contributing to sector development']

  const values = [1,2,3,4,5,6].map(n => ({
    icon: getIcon('values', `val${n}_icon`, defaultValIcons[n-1]),
    label: v('values', `val${n}`, defaultValLabels[n-1]),
    desc: v('values', `val${n}_desc`, defaultValDescs[n-1]),
  }))

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO BANNER ── */}
      <div className="relative bg-gray-900 pt-36 pb-20 overflow-hidden" style={{ minHeight: 480 }}>
        {(
          <img
            src={v('hero', 'hero_img', '/city-bina.jpeg')}
            alt="City Turizm"
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
            <Link href="/kurumsal/biz-kimiz" className="text-gray-400 hover:text-amber-400 transition-colors">
              {lang === 'tr' ? 'Kurumsal' : 'Corporate'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-amber-400 font-semibold">
              {v('hero', 'title', lang === 'tr' ? 'Başkanın Mesajı' : "Chairman's Message")}
            </span>
          </div>

          <motion.div {...fadeUp()}>
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30
                            rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-xs font-bold tracking-widest">
                {v('hero', 'badge', lang === 'tr' ? 'Kurumsal' : 'Corporate')}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              {v('hero', 'title', lang === 'tr' ? 'Başkanın Mesajı' : "Chairman's Message")}
            </h1>
            <p className="text-gray-300 text-lg max-w-xl leading-relaxed">
              {v('hero', 'subtitle', 'Osman Sarıal — İcra Kurulu Başkanı')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">

          {/* Photo + Message */}
          <div className="grid lg:grid-cols-[380px_1fr] gap-12 mb-20 items-start">

            {/* Photo card */}
            <motion.div {...fadeUp()}>
              <div className="sticky top-28">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-gray-900/20">
                  <img
                    src={v('photo', 'photo_img', '/osman-sarial.png')}
                    alt={v('photo', 'photo_name', 'Osman Sarıal')}
                    className="w-full object-cover object-top animate-fade-in"
                    style={{ minHeight: 380 }}
                  />
                  {/* Name badge */}
                  <div className="absolute bottom-0 left-0 right-0
                                  bg-gradient-to-t from-gray-900/95 to-transparent
                                  px-6 pt-16 pb-6">
                    <p className="text-white font-black text-xl">
                      {v('photo', 'photo_name', 'Osman Sarıal')}
                    </p>
                    <p className="text-amber-400 text-sm font-semibold mt-1">
                      {v('photo', 'photo_role', lang === 'tr' ? 'İcra Kurulu Başkanı' : 'Chairman of the Board')}
                    </p>
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-gray-400 text-xs">
                        {v('photo', 'photo_company', 'City Turizm')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Message text */}
            <motion.div {...fadeUp(0.1)} className="pt-2">
              {/* Opening quote */}
              <div className="mb-8">
                <Quote className="w-10 h-10 text-amber-500/30 mb-4" strokeWidth={1.5} />
                <p className="text-lg font-black text-gray-900 leading-snug">
                  {v('message', 'greeting', lang === 'tr' ? 'Değerli Paydaşlarımız,' : 'Dear Stakeholders,')}
                </p>
              </div>

              <div className="space-y-6 text-gray-600 leading-relaxed text-[15px]">
                <p>{v('message', 'msg_p1', '')}</p>
                <p>{v('message', 'msg_p2', '')}</p>

                <blockquote className="border-l-4 border-amber-500 pl-5 py-3 bg-amber-50/60 rounded-r-2xl my-8">
                  <p className="text-gray-700 font-semibold italic text-base leading-relaxed">
                    &ldquo;{v('message', 'quote', '')}&rdquo;
                  </p>
                </blockquote>

                <p className="text-gray-500">
                  {v('message', 'closing', lang === 'tr' ? 'Saygılarımla.' : 'Best regards.')}
                </p>
              </div>

              {/* Signature area */}
              <div className="mt-10 pt-8 border-t border-gray-100">
                <p className="font-black text-gray-900 text-lg">
                  {v('signature', 'sig_name', 'Osman Sarıal')}
                </p>
                <p className="text-amber-500 font-semibold text-sm mt-1">
                  {v('signature', 'sig_role', lang === 'tr' ? 'İcra Kurulu Başkanı — City Turizm' : 'Chairman of the Board — City Turizm')}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Values grid */}
          <motion.div {...fadeUp(0.1)}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 rounded-full bg-amber-500" />
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  {v('values', 'val_title', lang === 'tr' ? 'Başarımızın Temelleri' : 'Foundations of Our Success')}
                </h2>
                <p className="text-sm text-gray-400">
                  {v('values', 'val_desc', lang === 'tr' ? 'Bizi sektörde öne çıkaran değerlerimiz' : 'Our values that set us apart')}
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
                    className="group flex items-start gap-4 bg-white border border-gray-100
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
                    <div>
                      <p className="text-sm font-bold text-gray-800 group-hover:text-gray-900
                                    transition-colors mb-1">
                        {val.label}
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed">{val.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  )
}
