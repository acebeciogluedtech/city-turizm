'use client'

import { createContext, useContext, useRef, useEffect, useId, useState } from 'react'
import ApplicationModal from './ApplicationModal'
import { motion, useTransform, AnimatePresence, useInView, useMotionValue, useMotionValueEvent } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { ChevronRight, ArrowDown, Bus, Briefcase, Shield, Heart, Globe, Compass, Crown, Clock, ShieldCheck, Sparkles, Wallet, MapPinned,
  Star, Plane, Mountain, Anchor, Camera, Coffee, Flag, Gem, Leaf, Map, Medal, Music, Palmtree, Rocket, Sun, Trophy, Users, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/lib/language'

// ── Content context so sub-components can read dynamic values ──
type ContentMap = Record<string, string>
const ContentCtx = createContext<ContentMap>({})
function useC(key: string, fallback: string): string {
  const c = useContext(ContentCtx)
  return c[key] || fallback
}

const NAV_HEIGHT = 112

// Icon name → Lucide component map (used by admin-managed tags)
const ICON_MAP: Record<string, LucideIcon> = {
  Globe, Compass, Crown, Clock, ShieldCheck, Sparkles, Wallet, Bus, MapPinned,
  Heart, ArrowDown, Briefcase, Shield, Star, Plane, Mountain, Anchor, Camera,
  Coffee, Flag, Gem, Leaf, Map, Medal, Music, Palmtree, Rocket, Sun, Trophy, Users, Zap,
}

const DEFAULT_TAGS: { text: string; icon: string }[] = [
  { text: 'CITY TURİZM',        icon: 'Globe' },
  { text: 'DÜNYAYI KEŞFET',     icon: 'Compass' },
  { text: 'CITY AYRICALIĞI',    icon: 'Crown' },
  { text: '40 YIL',             icon: 'Clock' },
  { text: 'GÜVENLİ YOLCULUK',  icon: 'ShieldCheck' },
  { text: 'KUSURSUZ HİZMET',   icon: 'Sparkles' },
  { text: 'EKONOMİK TATİL',    icon: 'Wallet' },
  { text: 'GENİŞ FİLO',        icon: 'Bus' },
  { text: 'MUTLU ROTALAR',      icon: 'MapPinned' },
  { text: 'SINIRSIZ KEŞİF',    icon: 'Compass' },
]

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
    _ytPlayers: Record<string, any>
  }
}

function loadYTApi() {
  if (typeof window === 'undefined') return
  if (document.getElementById('yt-api-script')) return
  const s = document.createElement('script')
  s.id  = 'yt-api-script'
  s.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(s)
}

// ── Stats — reads from content context ──
const STAT_ICONS = [Bus, Briefcase, Shield, Heart]

function HeroStats({ dark = false }: { dark?: boolean }) {
  const STATS = [
    { icon: STAT_ICONS[0], value: useC('hero-stats.stat1_value', '1000+'), label: useC('hero-stats.stat1_label', 'Geniş Filo') },
    { icon: STAT_ICONS[1], value: useC('hero-stats.stat2_value', '100+'),  label: useC('hero-stats.stat2_label', 'Kurumsal Müşteri') },
    { icon: STAT_ICONS[2], value: useC('hero-stats.stat3_value', '20K+'),  label: useC('hero-stats.stat3_label', 'Güvenli Yolcu') },
    { icon: STAT_ICONS[3], value: useC('hero-stats.stat4_value', '500+'),  label: useC('hero-stats.stat4_label', 'Mutlu Ekip') },
  ]
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <div ref={ref} className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 ${dark ? '' : ''}`}>
      {STATS.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl overflow-hidden
                       ${dark ? 'bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10'
                               : 'bg-gray-50 hover:bg-amber-50 border border-gray-100 hover:border-amber-200'}
                       transition-all duration-300`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                            ${dark ? 'bg-amber-400/15' : 'bg-amber-100/80'}
                            transition-colors duration-300`}>
            <s.icon
              className={`w-4.5 h-4.5 ${dark ? 'text-amber-400' : 'text-amber-600'}`}
              strokeWidth={2}
            />
          </div>

          <div>
            <div className={`text-xl font-black leading-none tracking-tight
                             ${dark ? 'text-white' : 'text-gray-900'}`}>
              {s.value}
            </div>
            <div className={`text-xs mt-0.5 font-medium
                             ${dark ? 'text-white/50 group-hover:text-white/70' : 'text-gray-400 group-hover:text-amber-600'}
                             transition-colors duration-300`}>
              {s.label}
            </div>
          </div>

          <div className={`absolute -bottom-3 -right-3 w-10 h-10 rounded-full opacity-0
                           group-hover:opacity-100 transition-all duration-300 blur-xl
                           ${dark ? 'bg-amber-400/30' : 'bg-amber-400/40'}`} />
        </motion.div>
      ))}
    </div>
  )
}

// ── Dönen tag — dynamic count + icons from content ──
function RotatingTag({ dark = false }: { dark?: boolean }) {
  const c = useContext(ContentCtx)

  // Dynamically build tag list from content, falling back to defaults
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
        <motion.div
          key={idx}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <TagIcon
            className={`w-5 h-5 shrink-0 ${dark ? 'text-amber-400' : 'text-amber-500'}`}
            strokeWidth={2}
          />
          <span className={`text-base md:text-lg font-extrabold tracking-[0.2em] whitespace-nowrap
                      ${dark ? 'text-amber-400' : 'text-amber-600'}`}>
            {TAGS[idx % TAGS.length].text}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── YouTube URL → ID parser ──
function extractYouTubeId(input: string): string {
  if (!input) return 'Qg5T7fZ3Q_4'
  const trimmed = input.trim()
  // Full URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = trimmed.match(p)
    if (m) return m[1]
  }
  // Already a plain ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed
  return trimmed
}

// ── YouTube Player ──
function VideoFrame({ onPlayerReady }: { onPlayerReady?: (player: any) => void } = {}) {
  const rawVideoId = useC('hero.video_id', 'Qg5T7fZ3Q_4')
  const videoId = extractYouTubeId(rawVideoId)
  const divId = useId().replace(/:/g, '_')
  const pid   = `yt_${divId}`

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window._ytPlayers) window._ytPlayers = {}
    loadYTApi()

    const create = () => {
      if (window._ytPlayers[pid]) return
      window._ytPlayers[pid] = new window.YT.Player(pid, {
        videoId: videoId,
        playerVars: {
          autoplay: 1, mute: 1, loop: 1, playlist: videoId,
          controls: 0, showinfo: 0, rel: 0, modestbranding: 1,
          playsinline: 1, iv_load_policy: 3, disablekb: 1, start: 15,
        },
        events: {
          onReady: (e: any) => {
            e.target.setPlaybackQuality('hd1080')
            e.target.playVideo()
            onPlayerReady?.(e.target)
          },
          onPlaybackQualityChange: (e: any) => {
            const q = e.target.getPlaybackQuality()
            if (!['hd1080','hd1440','hd2160'].includes(q)) e.target.setPlaybackQuality('hd1080')
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
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div
        id={pid}
        className="absolute border-0"
        style={{
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100vw', height: '56.25vw',
          minHeight: '100%', minWidth: '177.78%',
          pointerEvents: 'none',
        }}
      />
      <div className="absolute inset-0 z-10" />
    </div>
  )
}

// ══════════════════════════════════════════
// MOBİL HERO
// ══════════════════════════════════════════
function MobileHero({ onApply }: { onApply: () => void }) {
  const title = useC('hero.main_title', 'Yolculuk Bizim İşimiz.')
  const desc  = useC('hero.description', "1985'ten bu yana binlerce yolcuya eşlik eden City Turizm, yurt içi ve yurt dışı turlardan balayı paketlerine kadar geniş portföyüyle her seyahati özel bir deneyime dönüştürür. Güvenilir hizmet anlayışımız ve uzman rehber kadromuzla sizi dünyanın dört bir yanına taşıyoruz.")
  const cta   = useC('hero.cta_button', 'Hemen Başvur')

  const playerRef   = useRef<any>(null)
  const [isPlaying, setIsPlaying]   = useState(true)
  const [videoReady, setVideoReady] = useState(false)

  function togglePlay() {
    const p = playerRef.current
    if (!p) return
    if (isPlaying) { p.pauseVideo(); setIsPlaying(false) }
    else           { p.playVideo();  setIsPlaying(true)  }
  }

  const showCover = !videoReady || !isPlaying
  const titleParts = title.split(/(?<=\.)\s*/)

  return (
    <section className="lg:hidden bg-white pt-[72px]">
      <div className="relative mx-4 mt-4 rounded-2xl overflow-hidden shadow-xl"
           style={{ height: '56vw', minHeight: 220 }}>
        <VideoFrame onPlayerReady={(p) => { playerRef.current = p; setVideoReady(true) }} />

        {showCover && (
          <div className="absolute inset-0 z-20 bg-black" />
        )}

        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Videoyu durdur' : 'Videoyu oynat'}
          className="absolute bottom-3 right-3 z-30 flex items-center justify-center
                     w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm
                     text-white hover:bg-black/70 active:scale-90 transition-all"
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36A1 1 0 008 5.14z"/>
            </svg>
          )}
        </button>
      </div>

      <div className="px-5 pt-7 pb-6">
        <h1 className="text-3xl font-black text-gray-900 leading-tight mb-3">
          {titleParts.map((p, i) => <span key={i}>{p}{i < titleParts.length - 1 && <br />}</span>)}
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-6">{desc}</p>

        <HeroStats />

        <button
          onClick={onApply}
          className="block w-full text-center bg-amber-500 hover:bg-amber-600
                     text-white font-bold text-sm py-3.5 rounded-xl
                     transition-all shadow-md shadow-amber-500/25"
        >
          {cta}
        </button>
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
    if (v < 0.01) setOpacity(0)
    else if (v < 0.15) setOpacity(v / 0.15)
    else if (v < 0.85) setOpacity(1)
    else setOpacity(1 - (v - 0.85) / 0.15)
  })

  return (
    <div
      style={{ opacity, transition: 'opacity 0.15s ease' }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none"
    >
      <span className="text-white/90 text-xs font-semibold tracking-[0.15em] uppercase drop-shadow-lg">{scrollHint}</span>
      <div className="relative w-9 h-14 rounded-full border-2 border-white/50 flex justify-center pt-2 backdrop-blur-sm bg-white/5">
        <motion.div
          className="w-1.5 h-3.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50"
          animate={{ y: [0, 16, 0], opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-amber-400/30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        />
      </div>
    </div>
  )
}

// ══════════════════════════════════════════
// DESKTOP HERO
// ══════════════════════════════════════════
function DesktopHero({ onApply }: { onApply: () => void }) {
  const title      = useC('hero.main_title', 'Yolculuk Bizim İşimiz.')
  const desc       = useC('hero.description', "1985'ten bu yana binlerce yolcuya eşlik eden City Turizm, yurt içi ve yurt dışı turlardan balayı paketlerine kadar geniş portföyüyle her seyahati özel bir deneyime dönüştürür. Güvenilir hizmet anlayışımız ve uzman rehber kadromuzla sizi dünyanın dört bir yanına taşıyoruz.")
  const cta        = useC('hero.cta_button', 'Hemen Başvur')
  const scrollHint = useC('hero.scroll_hint', 'Aşağı kaydır')
  const titleParts = title.split(/(?<=\.)\s*/)

  const containerRef = useRef<HTMLDivElement>(null)

  // ── Rock-solid manual scroll progress tracking ──
  // getBoundingClientRect is 100% reliable regardless of scroll container (html vs body).
  // progress = 0: container top just hit viewport top (animation starts)
  // progress = 1: container has been scrolled through completely
  // Container is h-[500vh]. Animation plays 0→35% (= first 175vh of scroll).
  // The sticky div stays pinned the entire 500vh; after 35% video is full-screen and holds.
  const scrollYProgress = useMotionValue(0)

  useEffect(() => {
    // Disable smooth scroll — required so sticky doesn't "drift" during fast scroll
    document.documentElement.style.scrollBehavior = 'auto'

    const update = () => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      // rect.top starts at 0 (container top at viewport top) and goes negative as we scroll down
      const scrolledIntoContainer = -rect.top
      // Total distance user must scroll to move from start to end of container (minus one viewport)
      const totalScrollable = el.offsetHeight - window.innerHeight
      const p = totalScrollable > 0
        ? Math.max(0, Math.min(1, scrolledIntoContainer / totalScrollable))
        : 0
      scrollYProgress.set(p)
    }

    window.addEventListener('scroll', update, { passive: true })
    update() // set initial value

    return () => {
      window.removeEventListener('scroll', update)
      document.documentElement.style.scrollBehavior = ''
    }
  }, [scrollYProgress])

  // ── Animation transforms ──
  // Video card starts at right side, ~57% width (left=43%).
  // As progress goes 0→0.35 (first 175vh of scroll):
  //   - left: 43% → 0%  (video expands to cover full width)
  //   - top/bottom insets shrink to 0
  //   - border-radius goes from 24px → 0px
  // After 0.35: all values are clamped at final state, video stays full-screen.
  const cardLeft   = useTransform(scrollYProgress, [0, 0.35], ['43%', '0%'])
  const cardTop    = useTransform(scrollYProgress, [0, 0.35], ['70px', '0px'])
  const cardBottom = useTransform(scrollYProgress, [0, 0.35], ['40px', '0px'])
  const cardRight  = useTransform(scrollYProgress, [0, 0.35], ['1.5%', '0%'])
  const cardRadius = useTransform(scrollYProgress, [0, 0.28], ['24px', '0px'])

  // Left text fades out and slides left while video expands (first 18% = ~63vh)
  const textOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0])
  const textX       = useTransform(scrollYProgress, [0, 0.18], [0, -50])

  // Overlay content on video fades in after video fully expands
  const overlayOp   = useTransform(scrollYProgress, [0.35, 0.45], [0, 1])

  return (
    // h-[500vh]: the sticky child (h-screen) stays pinned as user scrolls through all 500vh.
    // Animation plays in first 35% (175vh), then holds. Section unpins after all 500vh.
    <div ref={containerRef} className="relative h-[500vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-white">

        {/* Sol metin — video genişledikçe sola kayarak kaybolur */}
        <motion.div
          style={{ opacity: textOpacity, x: textX, paddingTop: NAV_HEIGHT }}
          className="absolute inset-y-0 left-0 z-10 flex flex-col justify-center
                     w-[43%] px-16 xl:px-20 pointer-events-none"
        >
          <RotatingTag />

          <h1 className="text-5xl xl:text-[3.5rem] 2xl:text-6xl font-black text-gray-900
                         leading-[1.05] mb-5">
            {titleParts.map((p, i) => <span key={i}>{p}{i < titleParts.length - 1 && <br />}</span>)}
          </h1>

          <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-sm">{desc}</p>

          <HeroStats />

          <div className="pointer-events-auto">
            <button
              onClick={onApply}
              className="group inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600
                         text-white font-bold text-sm px-7 py-4 rounded-2xl
                         transition-all shadow-lg shadow-amber-500/25 hover:-translate-y-0.5"
            >
              {cta}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* Sağ video kart — sağ kenara sabit, left 43%→0% ile sola açılır */}
        <motion.div
          style={{
            left: cardLeft,
            right: cardRight,
            top: cardTop,
            bottom: cardBottom,
            borderRadius: cardRadius,
          }}
          className="absolute z-20 overflow-hidden shadow-2xl shadow-black/15"
        >
          <VideoFrame />

          <div className="absolute inset-x-0 bottom-0 h-40
                          bg-gradient-to-t from-black/60 to-transparent z-20 pointer-events-none" />

          <motion.div
            style={{ opacity: overlayOp }}
            className="absolute bottom-12 left-12 right-12 z-30 pointer-events-none"
          >
            <RotatingTag dark />
            <h2 className="text-5xl lg:text-6xl font-black text-white leading-tight mb-3">
              {titleParts.map((p, i) => <span key={i}>{p}{i < titleParts.length - 1 && <br />}</span>)}
            </h2>
            <p className="text-white/70 text-base mb-6">{desc}</p>
            <button
              onClick={onApply}
              className="pointer-events-auto inline-flex items-center gap-2
                         bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm
                         px-7 py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/30"
            >
              {cta}
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <ScrollIndicator progress={scrollYProgress} scrollHint={scrollHint} />
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════
// ANA EXPORT
// ══════════════════════════════════════════════
export default function HeroSlider({ contentTr = {}, contentEn = {} }: { contentTr?: Record<string, string>; contentEn?: Record<string, string> }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { lang } = useLanguage()

  // Pick the right content map based on active language
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
