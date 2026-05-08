'use client'

import { createContext, useContext, useRef, useEffect, useId, useState } from 'react'
import ApplicationModal from './ApplicationModal'
import { motion, useTransform, AnimatePresence, useInView, useMotionValue, useMotionValueEvent } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { ChevronRight, Bus, Briefcase, Shield, Heart, Globe, Compass, Crown, Clock, ShieldCheck, Sparkles, Wallet, MapPinned, Star, Plane, Mountain, Anchor, Camera, Coffee, Flag, Gem, Leaf, Map, Medal, Music, Rocket, Sun, Trophy, Users, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/lib/language'

// ── Context ───────────────────────────────────────────────────────────────────
type ContentMap = Record<string, string>
const ContentCtx = createContext<ContentMap>({})
function useC(key: string, fallback: string): string {
  const c = useContext(ContentCtx)
  return c[key] || fallback
}

// ── Constants ─────────────────────────────────────────────────────────────────
const NAV_HEIGHT    = 116   // topbar (44) + nav (72)
const SCROLL_BUDGET = 700   // total wheel-delta to complete the animation

// ── Icons / Tags ──────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  Globe, Compass, Crown, Clock, ShieldCheck, Sparkles, Wallet, Bus, MapPinned,
  Heart, Briefcase, Shield, Star, Plane, Mountain, Anchor, Camera, Coffee,
  Flag, Gem, Leaf, Map, Medal, Music, Rocket, Sun, Trophy, Users, Zap,
}
const DEFAULT_TAGS = [
  { text: 'CITY TURİZM',      icon: 'Globe'       },
  { text: 'DÜNYAYI KEŞFET',   icon: 'Compass'     },
  { text: 'CITY AYRICALIĞI',  icon: 'Crown'       },
  { text: '40 YIL',           icon: 'Clock'       },
  { text: 'GÜVENLİ YOLCULUK', icon: 'ShieldCheck' },
  { text: 'KUSURSUZ HİZMET',  icon: 'Sparkles'    },
  { text: 'EKONOMİK TATİL',   icon: 'Wallet'      },
  { text: 'GENİŞ FİLO',       icon: 'Bus'         },
  { text: 'MUTLU ROTALAR',    icon: 'MapPinned'   },
  { text: 'SINIRSIZ KEŞİF',   icon: 'Compass'     },
]

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
    _ytPlayers: Record<string, any>
  }
}

function loadYTApi() {
  if (typeof window === 'undefined' || document.getElementById('yt-api-script')) return
  const s = document.createElement('script')
  s.id  = 'yt-api-script'
  s.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(s)
}

function extractYouTubeId(input: string): string {
  if (!input) return 'Qg5T7fZ3Q_4'
  const m = input.trim().match(/(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (m) return m[1]
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim()
  return input.trim()
}

// ── HeroStats ─────────────────────────────────────────────────────────────────
function HeroStats() {
  const STATS = [
    { icon: Bus,       value: useC('hero-stats.stat1_value', '1000+'), label: useC('hero-stats.stat1_label', 'Geniş Filo') },
    { icon: Briefcase, value: useC('hero-stats.stat2_value', '100+'),  label: useC('hero-stats.stat2_label', 'Kurumsal Müşteri') },
    { icon: Shield,    value: useC('hero-stats.stat3_value', '20K+'),  label: useC('hero-stats.stat3_label', 'Güvenli Yolcu') },
    { icon: Heart,     value: useC('hero-stats.stat4_value', '500+'),  label: useC('hero-stats.stat4_label', 'Mutlu Ekip') },
  ]
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-8">
      {STATS.map((s, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="group flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl bg-gray-50 hover:bg-amber-50 border border-gray-100 hover:border-amber-200 transition-all duration-300"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-100/80">
            <s.icon className="w-4 h-4 md:w-5 md:h-5 text-amber-600" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="text-base md:text-xl font-black leading-none text-gray-900">{s.value}</div>
            <div className="text-[10px] md:text-xs mt-0.5 font-medium truncate text-gray-400 group-hover:text-amber-600 transition-colors">{s.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ── RotatingTag ───────────────────────────────────────────────────────────────
function RotatingTag() {
  const c = useContext(ContentCtx)
  const TAGS: { text: string; icon: LucideIcon }[] = []
  for (let i = 1; i <= 30; i++) {
    const text = c[`hero-tags.tag${i}`] || DEFAULT_TAGS[i - 1]?.text
    if (!text) break
    const iconName = c[`hero-tags.tag${i}_icon`] || DEFAULT_TAGS[i - 1]?.icon || 'Globe'
    TAGS.push({ text, icon: ICON_MAP[iconName] || Globe })
  }
  if (TAGS.length === 0) TAGS.push({ text: 'CITY TURİZM', icon: Globe })
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % TAGS.length), 2500)
    return () => clearInterval(t)
  }, [TAGS.length])
  const TagIcon = TAGS[idx % TAGS.length].icon
  return (
    <div className="flex items-center gap-3 mb-6 h-10 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key={idx}
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <TagIcon className="w-5 h-5 shrink-0 text-amber-500" strokeWidth={2} />
          <span className="text-base md:text-lg font-extrabold tracking-[0.2em] whitespace-nowrap text-amber-600">
            {TAGS[idx % TAGS.length].text}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── VideoFrame ────────────────────────────────────────────────────────────────
// Shared by mobile and desktop. Shows orange+logo loading screen until the
// YouTube player fires state=PLAYING. visibility:hidden on the iframe wrapper
// ensures no YouTube native UI ever appears.
// ─────────────────────────────────────────────────────────────────────────────
function VideoFrame({
  onPlayerReady,
  logoUrl,
}: {
  onPlayerReady?: (p: any) => void
  logoUrl?: string
}) {
  const rawVideoId = useC('hero.video_id', 'Qg5T7fZ3Q_4')
  const videoId    = extractYouTubeId(rawVideoId)
  const pid        = `yt_${useId().replace(/:/g, '_')}`
  const [isReady, setIsReady] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window._ytPlayers) window._ytPlayers = {}
    loadYTApi()
    const create = () => {
      if (window._ytPlayers[pid]) return
      window._ytPlayers[pid] = new window.YT.Player(pid, {
        videoId,
        playerVars: {
          autoplay: 1, mute: 1, loop: 1, playlist: videoId,
          controls: 0, disablekb: 1, fs: 0, rel: 0,
          showinfo: 0, modestbranding: 1, iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onReady: (e: any) => {
            e.target.setPlaybackQuality('hd1080')
            e.target.playVideo()
            onPlayerReady?.(e.target)
          },
          onStateChange: (e: any) => {
            // Reveal only when ACTUALLY playing — hides all YouTube native UI
            if (e.data === 1) setTimeout(() => setIsReady(true), 200)
          },
        },
      })
    }
    if (window.YT?.Player) create()
    else {
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => { prev?.(); create() }
    }
    return () => { window._ytPlayers?.[pid]?.destroy?.(); delete window._ytPlayers?.[pid] }
  }, [pid, videoId])

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#f59e0b 0%,#ea580c 100%)' }}
    >
      {/* iframe — visibility:hidden until PLAYING, so YouTube UI is never shown */}
      <div style={{
        position: 'absolute', top: '-8px', right: '-8px', bottom: '-8px', left: '-8px',
        overflow: 'hidden', pointerEvents: 'none',
        visibility: isReady ? 'visible' : 'hidden',
      }}>
        <div
          id={pid}
          className="absolute border-0"
          style={{
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 'calc(100vw + 16px)', height: '56.25vw',
            minHeight: 'calc(100% + 16px)', minWidth: '177.78%',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Pointer-block overlay — stops any YouTube hover/click UI */}
      <div className="absolute inset-0 z-10" style={{ cursor: 'default' }} />

      {/* Orange loading overlay — fades out once video starts */}
      <div
        suppressHydrationWarning
        className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 transition-opacity duration-700"
        style={{
          opacity: isReady ? 0 : 1,
          pointerEvents: 'none',
          background: 'linear-gradient(135deg,#f59e0b 0%,#ea580c 100%)',
        }}
      >
        {mounted && (
          <>
            <div className="bg-white/25 backdrop-blur-sm rounded-2xl px-8 py-5 shadow-xl">
              <img
                src={logoUrl || '/images.png'}
                alt="City Turizm"
                className="h-14 w-auto object-contain"
              />
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/70"
                  style={{ animation: `pulse 1.4s ease-in-out ${i * 0.25}s infinite` }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── MobileHero ────────────────────────────────────────────────────────────────
// On mobile (portrait phones/tablets), video shows in 16:9 LANDSCAPE ratio.
// Custom play/pause buttons — no YouTube branding.
// ─────────────────────────────────────────────────────────────────────────────
function MobileHero({ onApply }: { onApply: () => void }) {
  const title     = useC('hero.main_title', 'Yolculuk Bizim İşimiz.')
  const desc      = useC('hero.description', "1985'ten bu yana binlerce yolcuya eşlik eden City Turizm.")
  const cta       = useC('hero.cta_button', 'Hemen Başvur')
  const playerRef = useRef<any>(null)
  const [isPlaying,  setIsPlaying]  = useState(true)
  const [videoReady, setVideoReady] = useState(false)
  const titleParts = title.split(/(?<=\.)\s*/)

  const toggle = () => {
    const p = playerRef.current
    if (!p) return
    if (isPlaying) { p.pauseVideo(); setIsPlaying(false) }
    else           { p.playVideo();  setIsPlaying(true)  }
  }

  return (
    <section className="lg:hidden bg-white pt-[72px]">

      {/* 16:9 yatay (landscape) video bandı */}
      <div className="relative mx-4 mt-4 rounded-2xl overflow-hidden shadow-xl" style={{ paddingBottom: '56.25%', height: 0 }}>
        <div className="absolute inset-0">
          <VideoFrame onPlayerReady={p => { playerRef.current = p; setVideoReady(true) }} />

          {/* Hafif karartma: yükleniyor veya duraklatıldıysa */}
          {(!videoReady || !isPlaying) && (
            <div className="absolute inset-0 z-25 bg-black/25" />
          )}

          {/* Özel play/pause — sağ alt köşe, YouTube'u çağrıştırmayan tasarım */}
          <button
            onClick={toggle}
            aria-label={isPlaying ? 'Durdur' : 'Oynat'}
            className="absolute bottom-3 right-3 z-30 w-10 h-10 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 text-white shadow-lg hover:bg-black/60 active:scale-90 transition-all"
          >
            {isPlaying ? (
              // Pause: iki yuvarlak dikdörtgen
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-[15px] h-[15px]">
                <rect x="4"  y="3" width="4" height="14" rx="1.5" />
                <rect x="12" y="3" width="4" height="14" rx="1.5" />
              </svg>
            ) : (
              // Play: sağa bakan üçgen
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-[15px] h-[15px]">
                <path d="M6.5 4.2a1 1 0 011.56-.83l8 5.8a1 1 0 010 1.66l-8 5.8A1 1 0 016.5 15.8V4.2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="px-5 pt-7 pb-6">
        <h1 className="text-3xl font-black text-gray-900 leading-tight mb-3">
          {titleParts.map((p, i) => (
            <span key={i}>{p}{i < titleParts.length - 1 && <br />}</span>
          ))}
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">{desc}</p>
        <HeroStats />
        <button
          onClick={onApply}
          className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-amber-500/25"
        >
          {cta}
        </button>
      </div>
    </section>
  )
}

// ── ScrollIndicator ───────────────────────────────────────────────────────────
function ScrollIndicator({ progress, scrollHint }: { progress: MotionValue<number>; scrollHint: string }) {
  const [opacity, setOpacity] = useState(0)
  useMotionValueEvent(progress, 'change', v => {
    if (v <= 0)        setOpacity(0)
    else if (v < 0.2)  setOpacity(v / 0.2)
    else if (v < 0.45) setOpacity(1)
    else if (v < 0.65) setOpacity(1 - (v - 0.45) / 0.2)
    else               setOpacity(0)
  })
  return (
    <div
      style={{ opacity, transition: 'opacity 0.3s ease' }}
      className="absolute bottom-8 left-[22%] -translate-x-1/2 z-[15] flex flex-col items-center gap-2 pointer-events-none"
    >
      <div className="relative w-9 h-14 rounded-full border-2 border-gray-300/60 flex justify-center pt-2 bg-white/10 backdrop-blur-sm">
        <motion.div
          className="w-1.5 h-3.5 rounded-full bg-amber-500 shadow-sm"
          animate={{ y: [0, 16, 0], opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-amber-400/30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        />
      </div>
      <span className="text-gray-500 text-xs font-semibold tracking-[0.15em] uppercase">{scrollHint}</span>
    </div>
  )
}

// ── DesktopHero ───────────────────────────────────────────────────────────────
// Wheel events are intercepted while animation is in progress (progress 0→1).
// At progress=0: tall square-ish card on the right side.
// At progress=1: video fills the entire viewport (full screen).
// Scrolling UP from page top reverses the animation; video keeps playing.
// ─────────────────────────────────────────────────────────────────────────────
function DesktopHero({ onApply }: { onApply: () => void }) {
  const title      = useC('hero.main_title', 'Yolculuk Bizim İşimiz.')
  const desc       = useC('hero.description', "1985'ten bu yana binlerce yolcuya eşlik eden City Turizm, yurt içi ve yurt dışı turlardan balayı paketlerine kadar geniş portföyüyle her seyahati özel bir deneyime dönüştürür.")
  const cta        = useC('hero.cta_button', 'Hemen Başvur')
  const scrollHint = useC('hero.scroll_hint', 'Aşağı kaydır')
  const titleParts = title.split(/(?<=\.)\s*/)

  // Fetch logo for loading screen
  const [logoUrl, setLogoUrl] = useState('')
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(({ settings }) => { if (settings?.logo_url) setLogoUrl(settings.logo_url) })
      .catch(() => {})
  }, [])

  const progress    = useMotionValue(0)
  const progressRef = useRef(0)
  const unlockedRef = useRef(false)

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'auto'

    const onWheel = (e: WheelEvent) => {
      // At page top + scroll up → re-lock and reverse the animation
      if (unlockedRef.current && window.scrollY < 5 && e.deltaY < 0) {
        unlockedRef.current = false
      }
      if (unlockedRef.current) return

      e.preventDefault()
      let delta = e.deltaY
      if (e.deltaMode === 1) delta *= 40
      if (e.deltaMode === 2) delta *= window.innerHeight

      const newP = Math.max(0, Math.min(1, progressRef.current + delta / SCROLL_BUDGET))
      progressRef.current = newP
      progress.set(newP)

      if (newP >= 1) unlockedRef.current = true
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      document.documentElement.style.scrollBehavior = ''
    }
  }, [progress])

  // ── Card initial dimensions (desktop, square-ish) ──
  // top=132px clears the fixed navbar (116px) with a small gap.
  // bottom=132px gives equal spacing → nearly square aspect ratio.
  const CARD_TOP    = '132px'
  const CARD_BOTTOM = '132px'
  const CARD_LEFT   = '44%'
  const CARD_RIGHT  = '2%'

  const cardLeft   = useTransform(progress, [0, 1], [CARD_LEFT,   '0%'])
  const cardTop    = useTransform(progress, [0, 1], [CARD_TOP,    '0px'])
  const cardBottom = useTransform(progress, [0, 1], [CARD_BOTTOM, '0px'])
  const cardRight  = useTransform(progress, [0, 1], [CARD_RIGHT,  '0%'])
  const cardRadius = useTransform(progress, [0, 0.85], ['20px', '0px'])

  // Left text fades and slides out during the first half of the animation
  const textOpacity = useTransform(progress, [0, 0.45], [1, 0])
  const textX       = useTransform(progress, [0, 0.45], [0, -48])

  return (
    <div className="relative h-screen bg-white">

      {/* Left text content */}
      <motion.div
        style={{ opacity: textOpacity, x: textX, paddingTop: NAV_HEIGHT }}
        className="absolute inset-y-0 left-0 z-10 flex flex-col justify-center w-[44%] px-14 xl:px-20 pointer-events-none"
      >
        <RotatingTag />
        <h1 className="text-5xl xl:text-[3.4rem] 2xl:text-6xl font-black text-gray-900 leading-[1.05] mb-5">
          {titleParts.map((p, i) => (
            <span key={i}>{p}{i < titleParts.length - 1 && <br />}</span>
          ))}
        </h1>
        <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-sm">{desc}</p>
        <HeroStats />
        <div className="pointer-events-auto">
          <button
            onClick={onApply}
            className="group inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-7 py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/25 hover:-translate-y-0.5"
          >
            {cta}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>

      {/* Video card — square-ish on right, expands to full screen on scroll */}
      <motion.div
        style={{
          left: cardLeft, right: cardRight,
          top: cardTop, bottom: cardBottom,
          borderRadius: cardRadius,
        }}
        className="absolute z-20 overflow-hidden shadow-2xl shadow-black/20"
      >
        <VideoFrame logoUrl={logoUrl} />
      </motion.div>

      <ScrollIndicator progress={progress} scrollHint={scrollHint} />
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function HeroSlider({
  contentTr = {},
  contentEn = {},
}: {
  contentTr?: Record<string, string>
  contentEn?: Record<string, string>
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { lang } = useLanguage()
  const content = lang === 'en' ? contentEn : contentTr

  useEffect(() => {
    const handler = () => setIsModalOpen(true)
    window.addEventListener('open-application-modal', handler)
    return () => window.removeEventListener('open-application-modal', handler)
  }, [])

  return (
    <ContentCtx.Provider value={content}>
      <MobileHero onApply={() => setIsModalOpen(true)} />
      <div className="hidden lg:block">
        <DesktopHero onApply={() => setIsModalOpen(true)} />
      </div>
      <ApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </ContentCtx.Provider>
  )
}
