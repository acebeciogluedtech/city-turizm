'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, X, ChevronLeft, ChevronRight, Images, Video } from 'lucide-react'


import { useLanguage } from '@/lib/language'
import type { BilingualContent } from '@/lib/content'


const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
})

export default function MedyaClient({ initialContent }: { initialContent: BilingualContent }) {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  function v(sectionId: string, fieldId: string, fallback = ''): string {
    const entry = initialContent[`${sectionId}.${fieldId}`]
    if (!entry) return fallback
    const val = lang === 'tr' ? entry.tr : (entry.en || entry.tr)
    return val || fallback
  }

  // Extract YouTube ID from full URL or plain ID
  function extractYoutubeId(url: string): string {
    if (!url) return ''
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match?.[1] || url
  }

  // Build videos from CMS
  const videos = [1,2,3,4,5,6].map(n => ({
    title:    v('videos', `v${n}_title`, ''),
    youtubeId: extractYoutubeId(v('videos', `v${n}_youtube`, '')),
    category: v('videos', `v${n}_category`, ''),
    duration: v('videos', `v${n}_duration`, ''),
  })).filter(vid => !!vid.youtubeId) // Only show videos with a real YouTube ID

  // Build gallery from CMS
  const galleryImages = Array.from({length: 12}, (_, i) => i + 1).map(n => ({
    src: v('gallery', `img${n}`, ''),
    alt: v('gallery', `alt${n}`, ''),
    category: v('gallery', `cat${n}`, ''),
  })).filter(g => g.src)



  function prevImage() {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + galleryImages.length) % galleryImages.length)
  }
  function nextImage() {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % galleryImages.length)
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 pt-40 pb-24 overflow-hidden">
        {v('hero', 'hero_img', '') && (
          <div className="absolute inset-0">
            <img src={v('hero', 'hero_img', '')} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-amber-900/80" />
          </div>
        )}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 80% 20%, #f59e0b 0%, transparent 40%)' }} />
        <div className="container mx-auto px-6 relative">
          <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Images className="w-3.5 h-3.5" /> {v('hero', 'badge', en ? 'Media Center' : 'Medya Merkezi')}
          </motion.div>
          <motion.h1 {...fadeUp(0.1)} className="text-4xl md:text-5xl font-black text-white mb-4">
            {v('hero', 'title', en ? 'Photo & Video Gallery' : 'Görsel & Video Galeri')}
          </motion.h1>
          <motion.p {...fadeUp(0.2)} className="text-lg text-slate-300 max-w-2xl">
            {v('hero', 'subtitle', '')}
          </motion.p>
        </div>
      </section>

      {/* ── VIDEO SECTION ── */}
      {videos.length > 0 && (
        <section className="container mx-auto px-6 py-16">
          <motion.div {...fadeUp(0)} className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Video className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">{v('videos', 'vid_title', en ? 'Videos' : 'Videolar')}</h2>
                <p className="text-sm text-gray-500">{videos.length} {en ? 'videos' : 'video'}</p>
              </div>
            </div>


          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((vid, i) => (
              <motion.div key={i} {...fadeUp(i * 0.06)}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => setActiveVideo(vid.youtubeId)}>
                <div className="relative aspect-video bg-slate-800 overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${vid.youtubeId}/maxresdefault.jpg`}
                    alt={vid.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200">
                      <Play className="w-5 h-5 text-amber-600 ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  {vid.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-md font-mono">{vid.duration}</div>
                  )}
                  {vid.category && (
                    <div className="absolute top-2 left-2 bg-amber-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">{vid.category}</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-amber-700 transition-colors leading-snug">{vid.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Divider */}
      {videos.length > 0 && galleryImages.length > 0 && (
        <div className="container mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>
      )}

      {/* ── GALLERY SECTION ── */}
      {galleryImages.length > 0 && (
        <section className="container mx-auto px-6 py-16">
          <motion.div {...fadeUp(0)} className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Images className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">{v('gallery', 'gal_title', en ? 'Photo Gallery' : 'Fotoğraf Galerisi')}</h2>
                <p className="text-sm text-gray-500">{galleryImages.length} {en ? 'photos' : 'fotoğraf'}</p>
              </div>
            </div>


          </motion.div>

          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {galleryImages.map((img, i) => (
              <motion.div key={i}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="break-inside-avoid group cursor-pointer relative overflow-hidden rounded-xl"
                onClick={() => setLightboxIndex(i)}>
                <img src={img.src} alt={img.alt}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <div>
                    <p className="text-white text-sm font-semibold leading-tight">{img.alt}</p>
                    {img.category && <p className="text-amber-300 text-xs">{img.category}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Video Lightbox */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setActiveVideo(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl aspect-video"
              onClick={e => e.stopPropagation()}>
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                className="w-full h-full rounded-2xl"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
              <button onClick={() => setActiveVideo(null)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white flex items-center gap-2 text-sm transition-colors">
                <X className="w-5 h-5" /> {en ? 'Close' : 'Kapat'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}>
            <button onClick={e => { e.stopPropagation(); prevImage() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10">
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
              className="relative max-w-5xl max-h-[85vh] mx-16"
              onClick={e => e.stopPropagation()}>
              <img src={galleryImages[lightboxIndex].src} alt={galleryImages[lightboxIndex].alt}
                className="max-h-[85vh] max-w-full object-contain rounded-xl" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl p-4">
                <p className="text-white font-semibold">{galleryImages[lightboxIndex].alt}</p>
                {galleryImages[lightboxIndex].category && (
                  <p className="text-amber-300 text-sm">{galleryImages[lightboxIndex].category}</p>
                )}
              </div>
            </motion.div>

            <button onClick={e => { e.stopPropagation(); nextImage() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10">
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            <button onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>

            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
              {lightboxIndex + 1} / {galleryImages.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
