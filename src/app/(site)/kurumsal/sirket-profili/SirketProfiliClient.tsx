'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronRight, Building2, FileText, Hash, MapPin, Phone, Mail, Clock,
  BusFront, GraduationCap, Car, Compass, Fuel, ArrowRightLeft,
  CheckCircle, Globe, Shield, Award, TrendingUp,
  Star, Heart, Zap, Target, Lightbulb, Handshake, Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import type { BilingualContent } from '@/lib/content'

const ICON_MAP: Record<string, LucideIcon> = {
  Shield, Award, TrendingUp, Globe, Star, Heart, Zap, Target,
  Lightbulb, Handshake, Users, Compass, GraduationCap, Car,
  ArrowRightLeft, BusFront, Fuel, Building2, FileText,
}

const CONTACT_ICONS = [Phone, Phone, Mail, MapPin, Clock, Globe]


const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay },
})

export default function SirketProfiliClient({ initialContent }: { initialContent: BilingualContent }) {
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

  // Build data arrays
  const highlights = [1,2,3,4].map(n => ({
    icon: getIcon('hero', `hl${n}_icon`, [Shield, Award, TrendingUp, Globe][n-1]),
    value: v('hero', `hl${n}_val`, ['ISO Belgeli', '40+ Yıl', '500+', 'Türkiye Geneli'][n-1]),
    label: v('hero', `hl${n}_lbl`, ['Kalite Yönetim Sistemi', 'Sektör Deneyimi', 'Kurumsal Müşteri', 'Hizmet Ağı'][n-1]),
  }))

  const companyInfo = [1,2,3,4].map(n => ({
    icon: [Building2, FileText, Hash, Hash][n-1],
    label: v('company', `c${n}_label`, ''),
    value: v('company', `c${n}_value`, ''),
  }))

  const contactInfo = [1,2,3,4,5,6].map(n => ({
    icon: CONTACT_ICONS[n-1],
    label: v('contact', `ct${n}_label`, ''),
    value: v('contact', `ct${n}_value`, ''),
  }))

  const defaultSrvIcons = [GraduationCap, Car, ArrowRightLeft, BusFront, Compass, Fuel]
  const services = [1,2,3,4,5,6].map(n => ({
    icon: getIcon('services', `srv${n}_icon`, defaultSrvIcons[n-1]),
    label: v('services', `srv${n}`, ''),
  }))

  const milestones = [1,2,3,4,5,6].map(n => ({
    year: v('timeline', `tl${n}_year`, ''),
    title: v('timeline', `tl${n}_title`, ''),
    desc: v('timeline', `tl${n}_desc`, ''),
  })).filter(m => m.year)

  const certs = [1,2,3,4].map(n => v('about', `cert${n}`, '')).filter(Boolean)

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
              {v('hero', 'title', lang === 'tr' ? 'Şirket Profili' : 'Company Profile')}
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
              {v('hero', 'title', lang === 'tr' ? 'Şirket Profili' : 'Company Profile')}
            </h1>
            <p className="text-gray-300 text-lg max-w-xl leading-relaxed">
              {v('hero', 'subtitle', '')}
            </p>
          </motion.div>

          {/* Highlight strip */}
          <motion.div {...fadeUp(0.15)} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {highlights.map((h, i) => {
              const Icon = h.icon
              return (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm">
                  <Icon className="w-5 h-5 text-amber-400 mb-2" strokeWidth={1.5} />
                  <p className="text-xl font-black text-white">{h.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{h.label}</p>
                </div>
              )
            })}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="max-w-5xl mx-auto space-y-16">

          {/* ── Resmi Şirket Bilgileri ── */}
          <motion.div {...fadeUp()}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 rounded-full bg-amber-500" />
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  {v('company', 'sec_title', lang === 'tr' ? 'Resmi Şirket Bilgileri' : 'Official Company Information')}
                </h2>
                <p className="text-sm text-gray-400">
                  {v('company', 'sec_desc', lang === 'tr' ? 'Yasal kayıt ve vergi bilgileri' : 'Legal registration and tax info')}
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {companyInfo.map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    className="flex items-start gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-5"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5 text-amber-500" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-gray-900 leading-snug">{item.value}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* ── Hakkımızda & İletişim ── */}
          <motion.div {...fadeUp()} className="grid lg:grid-cols-2 gap-10">
            {/* Hakkımızda */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <h2 className="text-2xl font-black text-gray-900">
                  {v('about', 'about_title', lang === 'tr' ? 'Hakkımızda' : 'About Us')}
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 leading-relaxed text-[15px]">
                <p>{v('about', 'about_p1', '')}</p>
                <p>{v('about', 'about_p2', '')}</p>
                <p>{v('about', 'about_p3', '')}</p>
                {certs.length > 0 && (
                  <ul className="space-y-2 pt-2">
                    {certs.map((cert, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" strokeWidth={2} />
                        {cert}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* İletişim */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <h2 className="text-2xl font-black text-gray-900">
                  {v('contact', 'contact_title', lang === 'tr' ? 'İletişim Bilgileri' : 'Contact Information')}
                </h2>
              </div>
              <div className="space-y-3">
                {contactInfo.filter(c => c.value).map((item, i) => {
                  const Icon = item.icon
                  return (
                    <div key={i} className="flex items-start gap-3.5 py-3 border-b border-gray-100 last:border-0">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mt-0.5">
                        <Icon className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                        <p className="text-sm text-gray-700 font-medium whitespace-pre-line leading-relaxed">{item.value}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* ── Faaliyet Alanları ── */}
          <motion.div {...fadeUp()}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 rounded-full bg-amber-500" />
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  {v('services', 'srv_title', lang === 'tr' ? 'Faaliyet Alanları' : 'Business Areas')}
                </h2>
                <p className="text-sm text-gray-400">
                  {v('services', 'srv_desc', lang === 'tr' ? 'Hizmet verdiğimiz başlıca sektörler' : 'Major sectors we serve')}
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.filter(s => s.label).map((s, i) => {
                const Icon = s.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    className="group flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm
                               hover:border-amber-200 hover:shadow-md hover:shadow-amber-500/8 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-amber-50 group-hover:bg-amber-500 flex items-center justify-center transition-colors duration-200">
                      <Icon className="w-5 h-5 text-amber-500 group-hover:text-white transition-colors duration-200" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors leading-snug">
                      {s.label}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* ── Tarihsel Gelişim ── */}
          {milestones.length > 0 && (
            <motion.div {...fadeUp()}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {v('timeline', 'tl_title', lang === 'tr' ? 'Tarihsel Gelişim' : 'Historical Development')}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {v('timeline', 'tl_desc', '')}
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gray-100 hidden sm:block" />
                <div className="space-y-6">
                  {milestones.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      className="flex items-start gap-5"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-amber-500 bg-white flex items-center justify-center z-10">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 flex-1 hover:border-amber-200 transition-colors">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-black text-amber-500 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1">
                            {m.year}
                          </span>
                          <p className="font-bold text-gray-900 text-sm">{m.title}</p>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </main>
  )
}
