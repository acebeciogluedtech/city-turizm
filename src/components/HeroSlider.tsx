'use client'

import { createContext, useContext, useRef, useEffect, useId, useState } from 'react'
import ApplicationModal from './ApplicationModal'
import { motion, useTransform, AnimatePresence, useInView, useMotionValue, useMotionValueEvent } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { ChevronRight, ArrowDown, Bus, Briefcase, Shield, Heart, Globe, Compass, Crown, Clock, ShieldCheck, Sparkles, Wallet, MapPinned, Star, Plane, Mountain, Anchor, Camera, Coffee, Flag, Gem, Leaf, Map, Medal, Music, Palmtree, Rocket, Sun, Trophy, Users, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/lib/language'

type ContentMap = Record<string, string>
const ContentCtx = createContext<ContentMap>({})
function useC(key: string, fallback: string): string {
  const c = useContext(ContentCtx)
  return c[key] || fallback
}

const NAV_HEIGHT = 112
const SCROLL_BUDGET = 700 // total wheel-delta px to complete animation

const ICON_MAP: Record<string, LucideIcon> = {
  Globe, Compass, Crown, Clock, ShieldCheck, Sparkles, Wallet, Bus, MapPinned,
  Heart, ArrowDown, Briefcase, Shield, Star, Plane, Mountain, Anchor, Camera,
  Coffee, Flag, Gem, Leaf, Map, Medal, Music, Palmtree, Rocket, Sun, Trophy, Users, Zap,
}
const DEFAULT_TAGS = [
  { text: 'CITY TURİZM', icon: 'Globe' }, { text: 'DÜNYAYI KEŞFET', icon: 'Compass' },
  { text: 'CITY AYRICALIĞI', icon: 'Crown' }, { text: '40 YIL', icon: 'Clock' },
  { text: 'GÜVENLİ YOLCULUK', icon: 'ShieldCheck' }, { text: 'KUSURSUZ HİZMET', icon: 'Sparkles' },
  { text: 'EKONOMİK TATİL', icon: 'Wallet' }, { text: 'GENİŞ FİLO', icon: 'Bus' },
  { text: 'MUTLU ROTALAR', icon: 'MapPinned' }, { text: 'SINIRSIZ KEŞİF', icon: 'Compass' },
]

declare global {
  interface Window { YT: any; onYouTubeIframeAPIReady: () => void; _ytPlayers: Record<string, any> }
}

function loadYTApi() {
  if (typeof window === 'undefined' || document.getElementById('yt-api-script')) return
  const s = document.createElement('script')
  s.id = 'yt-api-script'
  s.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(s)
}

function HeroStats({ dark = false }: { dark?: boolean }) {
  const STATS = [
    { icon: Bus,      value: useC('hero-stats.stat1_value', '1000+'), label: useC('hero-stats.stat1_label', 'Geniş Filo') },
    { icon: Briefcase,value: useC('hero-stats.stat2_value', '100+'),  label: useC('hero-stats.stat2_label', 'Kurumsal Müşteri') },
    { icon: Shield,   value: useC('hero-stats.stat3_value', '20K+'),  label: useC('hero-stats.stat3_label', 'Güvenli Yolcu') },
    { icon: Heart,    value: useC('hero-stats.stat4_value', '500+'),  label: useC('hero-stats.stat4_label', 'Mutlu Ekip') },
  ]
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {STATS.map((s, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl overflow-hidden transition-all duration-300
            ${dark ? 'bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10'
                   : 'bg-gray-50 hover:bg-amber-50 border border-gray-100 hover:border-amber-200'}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300
            ${dark ? 'bg-amber-400/15' : 'bg-amber-100/80'}`}>
            <s.icon className={`w-5 h-5 ${dark ? 'text-amber-400' : 'text-amber-600'}`} strokeWidth={2} />
          </div>
          <div>
            <div className={`text-xl font-black leading-none tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>{s.value}</div>
            <div className={`text-xs mt-0.5 font-medium transition-colors duration-300
              ${dark ? 'text-white/50 group-hover:text-white/70' : 'text-gray-400 group-hover:text-amber-600'}`}>{s.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function RotatingTag({ dark = false }: { dark?: boolean }) {
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
        <motion.div key={idx} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.3 }} className="flex items-center gap-3">
          <TagIcon className={`w-5 h-5 shrink-0 ${dark ? 'text-amber-400' : 'text-amber-500'}`} strokeWidth={2} />
          <span className={`text-base md:text-lg font-extrabold tracking-[0.2em] whitespace-nowrap ${dark ? 'text-amber-400' : 'text-amber-600'}`}>
            {TAGS[idx % TAGS.length].text}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function extractYouTubeId(input: string): string {
  if (!input) return 'Qg5T7fZ3Q_4'
  const m = input.trim().match(/(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (m) return m[1]
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim()
  return input.trim()
}

function VideoFrame({ onPlayerReady }: { onPlayerReady?: (p: any) => void } = {}) {
  const rawVideoId = useC('hero.video_id', 'Qg5T7fZ3Q_4')
  const videoId = extractYouTubeId(rawVideoId)
  const pid = `yt_${useId().replace(/:/g, '_')}`
  const [isReady, setIsReady] = useState(false)

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
          playsinline: 1, start: 15,
        },
        events: {
          onReady: (e: any) => {
            e.target.setPlaybackQuality('hd1080')
            e.target.playVideo()
            onPlayerReady?.(e.target)
          },
          onStateChange: (e: any) => {
            // Only reveal video when it is ACTUALLY playing (state=1)
            // This hides YouTube's thumbnail + play button completely
            if (e.data === 1) setTimeout(() => setIsReady(true), 150)
          },
          onPlaybackQualityChange: (e: any) => {
            if (!['hd1080','hd1440','hd2160'].includes(e.target.getPlaybackQuality()))
              e.target.setPlaybackQuality('hd1080')
          },
        },
      })
    }
    if (window.YT?.Player) create()
    else { const prev = window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady = () => { prev?.(); create() } }
    return () => { window._ytPlayers?.[pid]?.destroy?.(); delete window._ytPlayers?.[pid] }
  }, [pid, videoId])

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Iframe wrapper — visibility:hidden until playing, ensures YouTube UI never shows */}
      <div style={{ position: 'absolute', top: '-8px', right: '-8px', bottom: '-8px', left: '-8px', overflow: 'hidden', pointerEvents: 'none', visibility: isReady ? 'visible' : 'hidden' }}>
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
      {/* Transparent overlay — blocks all mouse interaction (no hover UI from YouTube) */}
      <div className="absolute inset-0 z-10" style={{ cursor: 'default' }} />
      {/* Black cover — hides YouTube's native play button / loading UI until video plays */}
      <div
        suppressHydrationWarning
        className="absolute inset-0 z-20 bg-black transition-opacity duration-500"
        style={{ opacity: isReady ? 0 : 1, pointerEvents: 'none' }}
      />
    </div>
  )
}

// ══════════════════════════════════════════
// MOBİL HERO
// ══════════════════════════════════════════
function MobileHero({ onApply }: { onApply: () => void }) {
  const title = useC('hero.main_title', 'Yolculuk Bizim İşimiz.')
  const desc  = useC('hero.description', "1985'ten bu yana binlerce yolcuya eşlik eden City Turizm.")
  const cta   = useC('hero.cta_button', 'Hemen Başvur')
  const playerRef = useRef<any>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [videoReady, setVideoReady] = useState(false)
  const titleParts = title.split(/(?<=\.)\s*/)
  return (
    <section className="lg:hidden bg-white pt-[72px]">
      <div className="relative mx-4 mt-4 rounded-2xl overflow-hidden shadow-xl" style={{ height: '56vw', minHeight: 220 }}>
        <VideoFrame onPlayerReady={(p) => { playerRef.current = p; setVideoReady(true) }} />
        {(!videoReady || !isPlaying) && <div className="absolute inset-0 z-20 bg-black" />}
        <button onClick={() => { const p = playerRef.current; if (!p) return; if (isPlaying) { p.pauseVideo(); setIsPlaying(false) } else { p.playVideo(); setIsPlaying(true) } }}
          aria-label={isPlaying ? 'Videoyu durdur' : 'Videoyu oynat'}
          className="absolute bottom-3 right-3 z-30 flex items-center justify-center w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 active:scale-90 transition-all">
          {isPlaying ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                     : <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36A1 1 0 008 5.14z"/></svg>}
        </button>
      </div>
      <div className="px-5 pt-7 pb-6">
        <h1 className="text-3xl font-black text-gray-900 leading-tight mb-3">
          {titleParts.map((p, i) => <span key={i}>{p}{i < titleParts.length - 1 && <br />}</span>)}
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">{desc}</p>
        <HeroStats />
        <button onClick={onApply} className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-amber-500/25">{cta}</button>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════
// SCROLL INDICATOR
// ══════════════════════════════════════════════
function ScrollIndicator({ progress, scrollHint }: { progress: MotionValue<number>; scrollHint: string }) {
  const [opacity, setOpacity] = useState(0)
  useMotionValueEvent(progress, 'change', (v) => {
    if (v <= 0)        setOpacity(0)                      // başta gizli
    else if (v < 0.3)  setOpacity(v / 0.3)               // yavaşça belirir
    else if (v < 0.85) setOpacity(1)                     // tamamen görünür
    else               setOpacity(1 - (v - 0.85) / 0.15) // azalarak kaybolur
  })
  return (
    <div style={{ opacity, transition: 'opacity 0.2s ease' }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
      {/* İkon üstte */}
      <div className="relative w-9 h-14 rounded-full border-2 border-white/50 flex justify-center pt-2 backdrop-blur-sm bg-white/5">
        <motion.div className="w-1.5 h-3.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" animate={{ y: [0, 16, 0], opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }} />
        <motion.div className="absolute inset-0 rounded-full border-2 border-amber-400/30" animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }} />
      </div>
      {/* Metin altta */}
      <span className="text-white/90 text-xs font-semibold tracking-[0.15em] uppercase drop-shadow-lg">{scrollHint}</span>
    </div>
  )
}

// ══════════════════════════════════════════
// DESKTOP HERO
// Wheel event interception: page does NOT scroll while video is expanding.
// Wheel delta drives the animation directly. When progress=1 (video full-screen),
// wheel events pass through and normal page scroll resumes.
// ══════════════════════════════════════════
function DesktopHero({ onApply }: { onApply: () => void }) {
  const title      = useC('hero.main_title', 'Yolculuk Bizim İşimiz.')
  const desc       = useC('hero.description', "1985'ten bu yana binlerce yolcuya eşlik eden City Turizm, yurt içi ve yurt dışı turlardan balayı paketlerine kadar geniş portföyüyle her seyahati özel bir deneyime dönüştürür. Güvenilir hizmet anlayışımız ve uzman rehber kadromuzla sizi dünyanın dört bir yanına taşıyoruz.")
  const cta        = useC('hero.cta_button', 'Hemen Başvur')
  const scrollHint = useC('hero.scroll_hint', 'Aşağı kaydır')
  const titleParts = title.split(/(?<=\.)\s*/)

  const scrollYProgress = useMotionValue(0)
  const progressRef  = useRef(0)
  const unlockedRef  = useRef(false) // true once animation is complete

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'auto'

    const onWheel = (e: WheelEvent) => {
      // Re-lock: user scrolled back to top and is scrolling UP → reverse animation
      if (unlockedRef.current && window.scrollY < 5 && e.deltaY < 0) {
        unlockedRef.current = false
        // Fall through to handle as locked (animation reverses)
      }

      // If unlocked (animation done, page is free to scroll), let browser handle normally
      if (unlockedRef.current) return

      e.preventDefault()

      // Normalize delta across deltaMode values
      let delta = e.deltaY
      if (e.deltaMode === 1) delta *= 40          // lines → px
      if (e.deltaMode === 2) delta *= window.innerHeight // pages → px

      const newP = Math.max(0, Math.min(1, progressRef.current + delta / SCROLL_BUDGET))
      progressRef.current = newP
      scrollYProgress.set(newP)

      // Animation complete → release scroll lock so page can scroll down
      if (newP >= 1) unlockedRef.current = true
    }

    // { passive: false } required to be able to call e.preventDefault()
    window.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      window.removeEventListener('wheel', onWheel)
      document.documentElement.style.scrollBehavior = ''
    }
  }, [scrollYProgress])

  // Video card: right edge anchored, left edge moves 43% → 0%
  const cardLeft   = useTransform(scrollYProgress, [0, 1], ['43%', '0%'])
  const cardTop    = useTransform(scrollYProgress, [0, 1], ['320px', '0px'])
  const cardBottom = useTransform(scrollYProgress, [0, 1], ['220px', '0px'])
  const cardRight  = useTransform(scrollYProgress, [0, 1], ['1.5%', '0%'])
  const cardRadius = useTransform(scrollYProgress, [0, 0.8], ['24px', '0px'])

  // Left text fades out in first half of animation
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const textX       = useTransform(scrollYProgress, [0, 0.5], [0, -50])

  // Overlay text on video fades in near the end
  const overlayOp   = useTransform(scrollYProgress, [0.8, 1], [0, 1])

  return (
    <div className="relative h-screen bg-white">

      {/* Sol metin */}
      <motion.div
        style={{ opacity: textOpacity, x: textX, paddingTop: NAV_HEIGHT }}
        className="absolute inset-y-0 left-0 z-10 flex flex-col justify-center w-[43%] px-16 xl:px-20 pointer-events-none"
      >
        <RotatingTag />
        <h1 className="text-5xl xl:text-[3.5rem] 2xl:text-6xl font-black text-gray-900 leading-[1.05] mb-5">
          {titleParts.map((p, i) => <span key={i}>{p}{i < titleParts.length - 1 && <br />}</span>)}
        </h1>
        <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-sm">{desc}</p>
        <HeroStats />
        <div className="pointer-events-auto">
          <button onClick={onApply} className="group inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-7 py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/25 hover:-translate-y-0.5">
            {cta}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>

      {/* Sağ video kart — sağa sabit, left 43%→0% ile sola açılır */}
      <motion.div
        style={{ left: cardLeft, right: cardRight, top: cardTop, bottom: cardBottom, borderRadius: cardRadius }}
        className="absolute z-20 overflow-hidden shadow-2xl shadow-black/15"
      >
        <VideoFrame />
      </motion.div>

      <ScrollIndicator progress={scrollYProgress} scrollHint={scrollHint} />
    </div>
  )
}

// ══════════════════════════════════════════════
// ANA EXPORT
// ══════════════════════════════════════════════
export default function HeroSlider({ contentTr = {}, contentEn = {} }: { contentTr?: Record<string, string>; contentEn?: Record<string, string> }) {
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
