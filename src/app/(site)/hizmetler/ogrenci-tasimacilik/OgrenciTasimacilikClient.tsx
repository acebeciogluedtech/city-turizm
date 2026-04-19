'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, MapPin, Clock, Shield, Users, Cpu, TrendingUp,
  CheckCircle, X, ArrowRight, BusFront, Star, Phone, ZoomIn, ChevronLeft,
  Eye, Target, Lightbulb, Compass, Crown, Sparkles, Wallet, Bus, MapPinned,
  Heart, Briefcase, Zap, Plane, Mountain, Anchor, Camera, Coffee, Flag, Gem,
  Leaf, Map, Medal, Music, Palmtree, Rocket, Sun, Trophy, GraduationCap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import QuoteForm from '@/components/QuoteForm'
import { useLanguage } from '@/lib/language'
import type { BilingualContent } from '@/lib/content'


const ICON_MAP: Record<string, LucideIcon> = {
  MapPin, Clock, Shield, Users, Cpu, TrendingUp, CheckCircle, BusFront, Star, Phone,
  Eye, Target, Lightbulb, Compass, Crown, Sparkles, Wallet, Bus, MapPinned,
  Heart, Briefcase, Zap, Plane, Mountain, Anchor, Camera, Coffee, Flag, Gem,
  Leaf, Map, Medal, Music, Palmtree, Rocket, Sun, Trophy, GraduationCap,
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay },
})

export default function OgrenciTasimacilikClient({ initialContent }: { initialContent: BilingualContent }) {
  const { lang } = useLanguage()
  const [showModal, setShowModal] = useState(false)
  const [lightbox, setLightbox] = useState<number | null>(null)

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
    value: v('stats', `st${n}_val`, ''),
    label: v('stats', `st${n}_lbl`, ''),
    icon: getIcon('stats', `st${n}_icon`, Star),
  })).filter(s => s.value)

  const features = [1,2,3,4,5,6].map(n => ({
    icon: getIcon('features', `f${n}_icon`, Star),
    title: v('features', `f${n}_title`, ''),
    desc: v('features', `f${n}_desc`, ''),
  })).filter(f => f.title)

  const advantages = [1,2,3,4,5,6].map(n => v('advantages', `adv${n}`, '')).filter(Boolean)

  const galleryImages = Array.from({length: 10}, (_, i) => i + 1).map(n => ({
    src: v('gallery', `img${n}`, ''),
    caption: v('gallery', `cap${n}`, ''),
  })).filter(g => g.src)

  const prevImage = () => setLightbox(i => (i !== null ? (i - 1 + galleryImages.length) % galleryImages.length : null))
  const nextImage = () => setLightbox(i => (i !== null ? (i + 1) % galleryImages.length : null))

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <div className="relative bg-gray-900 pt-36 pb-20 overflow-hidden" style={{ minHeight: 480 }}>
        {v('hero', 'hero_img') && (
          <img src={v('hero', 'hero_img')} alt="" className="absolute inset-0 w-full h-full object-cover object-center animate-fade-in" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/92 via-gray-900/72 to-gray-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/75 via-transparent to-gray-900/20" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex items-center gap-1.5 text-sm mb-8">
            <Link href="/" className="text-gray-400 hover:text-amber-400 transition-colors">{lang === 'tr' ? 'Ana Sayfa' : 'Home'}</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <Link href="/hizmetler" className="text-gray-400 hover:text-amber-400 transition-colors">{'Hizmetler'}</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-amber-400 font-semibold">{v('hero', 'title', lang === 'tr' ? 'Öğrenci Taşımacılığı' : 'Student Transportation')}</span>
          </div>

          <motion.div {...fadeUp()}>
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-xs font-bold tracking-widest">{v('hero', 'badge', lang === 'tr' ? 'Hizmetler' : 'Services')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              {v('hero', 'title', 'Öğrenci Taşımacılığı')}
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
              {v('hero', 'subtitle', '')}
            </p>
          </motion.div>

          {stats.length > 0 && (
            <motion.div {...fadeUp(0.15)} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              {stats.map(s => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm hover:bg-white/8 transition-colors">
                    <Icon className="w-5 h-5 text-amber-400 mb-2" strokeWidth={1.5} />
                    <p className="text-2xl font-black text-white">{s.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="max-w-5xl mx-auto space-y-20">

          {/* ── Ana Metin ── */}
          <motion.div {...fadeUp()} className="grid lg:grid-cols-[1fr_340px] gap-12 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{v('content', 'sec_title', '')}</h2>
                  <p className="text-sm text-gray-400">{v('content', 'sec_desc', '')}</p>
                </div>
              </div>
              <div className="space-y-5 text-gray-600 leading-relaxed text-[15px]">
                <p>{v('content', 'para1', '')}</p>
                <p>{v('content', 'para2', '')}</p>
                <p>{v('content', 'para3', '')}</p>
                {v('content', 'quote') && (
                  <blockquote className="border-l-4 border-amber-500 pl-5 py-3 bg-amber-50/60 rounded-r-2xl">
                    <p className="text-gray-700 font-semibold text-sm leading-relaxed italic flex items-center gap-2">
                      <Heart className="w-4 h-4 text-amber-500 flex-shrink-0" strokeWidth={2} />
                      &ldquo;{v('content', 'quote')}&rdquo;
                    </p>
                  </blockquote>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-6 text-center shadow-lg shadow-amber-500/20">
                <Phone className="w-8 h-8 text-white mx-auto mb-3" strokeWidth={1.5} />
                <h3 className="font-black text-white text-base mb-1">{v('cta', 'cta_title', lang === 'tr' ? 'Hemen Teklif Alın' : 'Get a Quote')}</h3>
                <p className="text-amber-100 text-xs mb-4 leading-relaxed">{v('cta', 'cta_desc', '')}</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-white text-amber-600 font-bold text-sm py-3 rounded-xl hover:bg-amber-50 transition-colors shadow-sm"
                >
                  {v('cta', 'cta_btn', lang === 'tr' ? 'Teklif Al' : 'Get Quote')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {advantages.length > 0 && (
                <div className="bg-gray-50 border border-gray-100 rounded-3xl p-7">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center mb-5">
                    <GraduationCap className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-black text-gray-900 text-base mb-4">{v('advantages', 'adv_title', 'Neden City Turizm?')}</h3>
                  <ul className="space-y-3">
                    {advantages.map(item => (
                      <li key={item} className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
                        <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Özellikler ── */}
          {features.length > 0 && (
            <motion.div {...fadeUp()}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{v('features', 'feat_title', '')}</h2>
                  <p className="text-sm text-gray-400">{v('features', 'feat_desc', '')}</p>
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
                      className="group flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm
                                 hover:border-amber-200 hover:shadow-md hover:shadow-amber-500/8
                                 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-50 group-hover:bg-amber-500 flex items-center justify-center transition-colors duration-200">
                        <Icon className="w-6 h-6 text-amber-500 group-hover:text-white transition-colors duration-200" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm mb-2">{f.title}</p>
                        <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── Galeri ── */}
          {galleryImages.length > 0 && (
            <motion.div {...fadeUp()}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 rounded-full bg-amber-500" />
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{v('gallery', 'gal_title', lang === 'tr' ? 'Fotoğraf Galerisi' : 'Photo Gallery')}</h2>
                  <p className="text-sm text-gray-400">{v('gallery', 'gal_desc', '')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((img, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setLightbox(i)}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-sm border border-gray-100
                               hover:shadow-md hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <Image src={img.src} alt={img.caption} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <p className="text-white text-xs font-semibold leading-snug">{img.caption}</p>
                    </div>
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm">
                      <ZoomIn className="w-4 h-4 text-gray-700" strokeWidth={1.5} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox !== null && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 z-50" onClick={() => setLightbox(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.22 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="relative w-full max-w-4xl pointer-events-auto">
                <button onClick={() => setLightbox(null)} className="absolute -top-12 right-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"><X className="w-5 h-5 text-white" /></button>
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                  <Image src={galleryImages[lightbox].src} alt={galleryImages[lightbox].caption} fill className="object-cover" />
                </div>
                <div className="flex items-center justify-between mt-4">
                  <button onClick={prevImage} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"><ChevronLeft className="w-5 h-5 text-white" /></button>
                  <p className="text-white text-sm font-medium">{galleryImages[lightbox].caption}</p>
                  <button onClick={nextImage} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"><ChevronRight className="w-5 h-5 text-white" /></button>
                </div>
                <p className="text-center text-gray-500 text-xs mt-2">{lightbox + 1} / {galleryImages.length}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Teklif Modal ── */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 24 }} transition={{ duration: 0.28 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 pointer-events-auto relative max-h-[90vh] overflow-y-auto">
                <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"><X className="w-4 h-4 text-gray-600" /></button>
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center mb-5"><Phone className="w-6 h-6 text-white" strokeWidth={1.5} /></div>
                <h3 className="text-xl font-black text-gray-900 mb-1">{lang === 'tr' ? 'Teklif Alın' : 'Get a Quote'}</h3>
                <p className="text-sm text-gray-500 mb-6">{lang === 'tr' ? 'Öğrenci taşımacılığı için kurumunuza özel fiyat teklifi.' : 'Custom quote for student transportation.'}</p>
                <QuoteForm source="ogrenci-tasimacilik" onSuccess={() => setTimeout(() => setShowModal(false), 2500)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </main>
  )
}
