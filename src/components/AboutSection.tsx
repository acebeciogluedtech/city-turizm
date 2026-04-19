'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  BusFront, GraduationCap, Car, ArrowRightLeft,
  Compass, Fuel, ArrowRight, Quote,
} from 'lucide-react'
import { useLanguage } from '@/lib/language'

const SERVICE_ICONS = [GraduationCap, Car, ArrowRightLeft, BusFront, Compass, Fuel]
const SERVICE_HREFS = [
  '/hizmetler/ogrenci-tasimacilik',
  '/hizmetler/arac-kiralama',
  '/hizmetler/ozel-transfer',
  '/hizmetler/personel-tasimacilik',
  '/hizmetler/turizm-acenteligi',
  '/hizmetler/akaryakit-istasyonu',
]

interface Props {
  contentTr: Record<string, string>
  contentEn: Record<string, string>
}

export default function AboutSection({ contentTr, contentEn }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const { lang } = useLanguage()
  const c = lang === 'tr' ? contentTr : contentEn
  const v = (key: string, fallback = '') => c[key] || contentTr[key] || fallback

  const services = Array.from({ length: 6 }, (_, i) => ({
    icon: SERVICE_ICONS[i],
    label: v(`services-grid.s${i + 1}_label`),
    desc: v(`services-grid.s${i + 1}_desc`),
    href: SERVICE_HREFS[i],
    image: contentTr[`services-grid.s${i + 1}_img`] || '',
  })).filter(s => s.label)

  return (
    <section ref={ref}>
      <div className="grid lg:grid-cols-2">

        {/* ── LEFT: about text ── */}
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white px-8 md:px-14 xl:px-20 py-16 md:py-24 flex flex-col justify-center"
        >
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200
                          rounded-full px-4 py-1.5 mb-6 self-start">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-amber-600 text-xs font-bold uppercase tracking-widest">
              {v('about.badge', 'Hakkımızda & Hizmetlerimiz')}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl xl:text-[2.75rem] font-black text-gray-900 leading-tight mb-6">
            {(() => {
              const fullTitle = v('about.title', '40 Yılı Aşkın Güven ve Deneyim')
              const accent = v('about.title_accent', 'Güven ve Deneyim')
              if (accent && fullTitle.includes(accent)) {
                const parts = fullTitle.split(accent)
                return <>{parts[0]}<br /><span className="text-amber-500">{accent}</span>{parts[1]}</>
              }
              return fullTitle
            })()}
          </h2>

          <div className="space-y-4 text-gray-600 text-base leading-relaxed mb-8">
            <p>{v('about.para1', 'City Turizm, 40 yılı aşkın süredir ulaşım sektöründe gelişen tüm teknolojik imkânları ve profesyonel hizmet anlayışını bütünleşik olarak kullanarak güvenli ve konforlu hizmet vermeyi amaçlamaktadır.')}</p>
            <p>{v('about.para2', 'Firmamız kuruluş amacında taşıdığı ruhu kaybetmeden; mobil uygulama teknolojileri ve yenilikçi çözümlerle insanların yaşam kalitesini en yüksek seviyede tutmak için çalışmaktadır.')}</p>
          </div>

          <div className="border-l-4 border-amber-500 pl-5 mb-8">
            <Quote className="w-4 h-4 text-amber-300 mb-1" fill="currentColor" />
            <p className="text-gray-800 font-semibold text-base md:text-lg italic leading-snug">
              {v('about.quote', '"Taşıdığımız en önemli şey güveniniz."')}
            </p>
          </div>

          <Link href="/kurumsal/biz-kimiz"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white
                       font-bold text-sm px-7 py-4 rounded-2xl transition-all self-start
                       hover:-translate-y-0.5 shadow-lg shadow-amber-500/25 group">
            {v('about.cta_button', 'Daha Fazla Bilgi')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* ── RIGHT: 2×3 service cards ── */}
        <div className="grid grid-cols-2 gap-0" style={{ gridTemplateRows: 'repeat(3, 1fr)' }}>
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden group h-full min-h-[160px]"
            >
              <Link href={s.href} className="absolute inset-0 z-10" aria-label={s.label} />
              {s.image && (
                <Image src={s.image} alt={s.label} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
              <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/55 transition-all duration-400" />
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300" />
              <div className="relative h-full flex flex-col justify-end p-5">
                <div className="w-11 h-11 rounded-xl bg-amber-500 group-hover:bg-white flex items-center justify-center mb-3 transition-colors duration-300 shadow-lg shadow-black/20">
                  <s.icon className="w-5 h-5 text-white group-hover:text-amber-500 transition-colors duration-300" strokeWidth={1.75} />
                </div>
                <p className="text-white font-bold text-sm leading-snug mb-1">{s.label}</p>
                <p className="text-white/0 group-hover:text-white/85 text-xs leading-snug transition-all duration-300 translate-y-2 group-hover:translate-y-0">{s.desc}</p>
                <div className="flex items-center gap-1 text-white/0 group-hover:text-white text-[11px] font-semibold mt-2 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  {lang === 'tr' ? 'Detaylı Bilgi' : 'Details'} <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Fleet banner — image only ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative w-full overflow-hidden aspect-[21/7] md:aspect-[21/6]"
      >
        <Image
          src={contentTr['fleet-banner.image'] || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&q=80'}
          alt="City Turizm"
          fill
          className="object-cover"
        />
      </motion.div>

    </section>
  )
}
