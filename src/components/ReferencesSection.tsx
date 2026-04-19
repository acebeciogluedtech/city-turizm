'use client'

import { useRef } from 'react'
import { useInView } from 'framer-motion'
import Image from 'next/image'
import { useLanguage } from '@/lib/language'

interface Props {
  contentTr: Record<string, string>
  contentEn: Record<string, string>
}

function LogoCard({ src }: { src: string }) {
  return (
    <div className="flex-shrink-0 mx-5 group py-2">
      <div className="
        relative w-56 h-28 md:w-60 md:h-32
        bg-white rounded-2xl
        border border-gray-100
        shadow-sm
        flex items-center justify-center
        px-5
        transition-all duration-400
        group-hover:border-amber-200
        group-hover:shadow-lg group-hover:shadow-amber-500/12
        group-hover:-translate-y-2
      ">
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                        bg-gradient-to-br from-amber-50 to-orange-50/40
                        transition-opacity duration-300 pointer-events-none" />
        <Image
          src={src}
          alt="Referans"
          width={160}
          height={80}
          className="object-contain max-h-20 w-auto relative z-10
                     grayscale opacity-45
                     group-hover:grayscale-0 group-hover:opacity-100
                     transition-all duration-400"
        />
      </div>
    </div>
  )
}

function MarqueeRow({ logos, reverse }: { logos: string[]; reverse?: boolean }) {
  if (logos.length === 0) return null
  // Repeat logos enough to fill the strip seamlessly
  const track = [...logos, ...logos, ...logos, ...logos, ...logos, ...logos]
  const animClass = reverse ? 'animate-marquee-reverse' : 'animate-marquee'

  return (
    <div className="flex w-full" style={{ overflowX: 'hidden', overflowY: 'visible' }}>
      <div className={`flex items-center shrink-0 ${animClass} [animation-play-state:running] hover:[animation-play-state:paused] will-change-transform`}>
        {track.map((src, i) => <LogoCard key={i} src={src} />)}
      </div>
      <div aria-hidden className={`flex items-center shrink-0 ${animClass} [animation-play-state:running] hover:[animation-play-state:paused] will-change-transform`}>
        {track.map((src, i) => <LogoCard key={`b-${i}`} src={src} />)}
      </div>
    </div>
  )
}

export default function ReferencesSection({ contentTr, contentEn }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const { lang } = useLanguage()

  // Collect logos from DB
  const logos: string[] = []
  for (let i = 1; i <= 30; i++) {
    const url = contentTr[`references.logo${i}`]
    if (!url) break
    logos.push(url)
  }

  // If no logos uploaded, don't render section
  if (logos.length === 0) return null

  const c = lang === 'tr' ? contentTr : contentEn
  const v = (key: string, fallback = '') => c[key] || contentTr[key] || fallback

  return (
    <section ref={ref} className="bg-gray-50/80 py-16 md:py-20">
      {/* Header */}
      <div className="container mx-auto px-4 md:px-6 mb-12 text-center">
        <div className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20
                          rounded-full px-4 py-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-600 text-xs font-bold uppercase tracking-widest">
              {v('references.badge', 'Güvenilir Markalar')}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
            {v('references.title', 'Referanslarımız')}
          </h2>
          <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
            {v('references.subtitle', "Türkiye'nin önde gelen kurumları ile onlarca yıldır sürdürdüğümüz güvenilir iş ortaklığının gururunu taşıyoruz.")}
          </p>
        </div>
      </div>

      {/* Carousels — both rows show ALL logos, second row reversed */}
      <div
        className={`space-y-5 transition-all duration-700 delay-150 ${inView ? 'opacity-100' : 'opacity-0'}`}
        style={{ overflowY: 'visible' }}
      >
        <MarqueeRow logos={logos} />
        <MarqueeRow logos={logos} reverse />
      </div>
    </section>
  )
}
