'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Save, ExternalLink, CheckCircle2, Globe, ChevronUp, ChevronDown,
  Upload, X, RefreshCw, Pencil, Image as ImageIcon,
  FileText, Languages, Play, Quote, Plus, Trash2, GripVertical,
  Compass, Crown, Clock, ShieldCheck, Sparkles, Wallet, Bus, MapPinned, Heart, Shield, Briefcase, ArrowDown,
  Star, Plane, Mountain, Anchor, Camera, Coffee, Flag, Gem, Leaf, Map, Medal, Music, Palmtree, Rocket, Sun, Trophy, Users, Zap,
  Phone, Mail as MailIcon, MapPin,
  GraduationCap, Car, ArrowRightLeft, Fuel, Target, Lightbulb, TrendingUp, BusFront, Handshake, Award,
  Cpu, Eye, Wrench, BookOpen, ClipboardList, UserCheck,
  AlertTriangle, Flame, HardHat, CheckCircle,
  Droplets, Wind, Recycle, TreePine, Waves, FlaskConical, Cookie,
  MessageSquare, Headphones, Menu,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { getPageDef } from '@/lib/admin/definitions'
import { useAdmin } from '@/lib/admin/store'
import { translateText } from '@/lib/admin/translate'
import type { ContentField, ContentSection } from '@/lib/admin/types'
import { cn } from '@/lib/utils'

type ActiveLang = 'tr' | 'en'
interface LiveEdit { sectionId: string; fieldId: string; tr: string; en: string }
interface SelField { sectionId: string; field: ContentField }
type GetVal = (fieldId: string) => string
type IsSel  = (fieldId: string) => boolean
type OnSel  = (fieldId: string) => void

// ─────────────────────────────────────────────────────────────────────────────
// Editable wrapper — click to select, amber ring + "Düzenleniyor" badge
// ─────────────────────────────────────────────────────────────────────────────
function E({ children, active, onSelect, className = '', inline = false }: {
  children: React.ReactNode; active: boolean; onSelect: () => void; className?: string; inline?: boolean
}) {
  const Tag = inline ? 'span' : 'div'
  return (
    <Tag
      role="button" tabIndex={0}
      onClick={e => { e.stopPropagation(); onSelect() }}
      onKeyDown={e => e.key === 'Enter' && onSelect()}
      className={cn(
        'relative cursor-pointer transition-all duration-150 rounded-xl outline-2 outline-offset-2',
        active
          ? 'outline outline-amber-500 bg-amber-50/30'
          : 'outline outline-transparent hover:outline-amber-300',
        className
      )}
    >
      {children}
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
            className="absolute -top-3 left-2 bg-amber-500 text-white text-sm font-bold px-2 py-0.5 rounded-full z-50 flex items-center gap-1 shadow-md pointer-events-none whitespace-nowrap"
          >
            <Pencil className="w-2 h-2" /> Düzenleniyor
          </motion.span>
        )}
      </AnimatePresence>
    </Tag>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit Panel — TR / EN fields, real-time callback, translate buttons
// ─────────────────────────────────────────────────────────────────────────────
function EditPanel({ field, pageId, sectionId, onClose, onLiveChange }: {
  field: ContentField; pageId: string; sectionId: string
  onClose: () => void; onLiveChange: (tr: string, en: string) => void
}) {
  const { getField, updateField } = useAdmin()
  const current  = getField(pageId, sectionId, field.id)
  const [trVal, setTrVal] = useState(current.tr)
  const [enVal, setEnVal] = useState(current.en)
  const [translating, setTranslating] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const isImageField = field.type === 'image'
  const updateTr = (v: string) => {
    setTrVal(v)
    if (isImageField) { setEnVal(v); onLiveChange(v, v) }
    else onLiveChange(v, enVal)
  }
  const updateEn = (v: string) => { setEnVal(v); onLiveChange(trVal, v) }

  async function handleSave() {
    // 1. Update in-memory store — images are language-independent
    const finalEn = isImageField ? trVal : enVal
    updateField(pageId, sectionId, field.id, trVal, finalEn)

    // 2. Immediately persist to Supabase
    let dbOk = false
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: [{
          page_id: pageId,
          section_id: sectionId,
          field_id: field.id,
          tr: trVal,
          en: finalEn,
        }] }),
      })
      dbOk = res.ok
      if (!res.ok) console.error('DB save failed:', await res.json())
    } catch (err) {
      console.error('DB save failed:', err)
    }

    // 3. Fallback: persist to localStorage so the value isn't lost
    if (!dbOk) {
      try {
        const raw = localStorage.getItem('admin_content')
        const map = raw ? JSON.parse(raw) : {}
        if (!map[pageId]) map[pageId] = {}
        if (!map[pageId][sectionId]) map[pageId][sectionId] = {}
        map[pageId][sectionId][field.id] = { tr: trVal, en: finalEn }
        localStorage.setItem('admin_content', JSON.stringify(map))
      } catch {}
    }

    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 700)
  }

  async function handleTranslate() {
    setTranslating(true)
    try {
      const r = await translateText(trVal, 'tr', 'en')
      updateEn(r)
    } finally { setTranslating(false) }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('folder', `pages/${pageId}`)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd }); const data = await res.json()
      if (res.ok && data.url) {
        updateTr(data.url)
        // Auto-save image to DB immediately
        updateField(pageId, sectionId, field.id, data.url, data.url)
        let imgDbOk = false
        try {
          const saveRes = await fetch('/api/admin/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields: [{
              page_id: pageId, section_id: sectionId, field_id: field.id,
              tr: data.url, en: data.url,
            }] }),
          })
          imgDbOk = saveRes.ok
          if (!saveRes.ok) console.error('Auto-save image failed:', await saveRes.json())
        } catch (err) { console.error('Auto-save image failed:', err) }
        if (!imgDbOk) {
          try {
            const raw = localStorage.getItem('admin_content')
            const lsMap = raw ? JSON.parse(raw) : {}
            if (!lsMap[pageId]) lsMap[pageId] = {}
            if (!lsMap[pageId][sectionId]) lsMap[pageId][sectionId] = {}
            lsMap[pageId][sectionId][field.id] = { tr: data.url, en: data.url }
            localStorage.setItem('admin_content', JSON.stringify(lsMap))
          } catch {}
        }
      }
      else { const r = new FileReader(); r.onload = ev => updateTr(ev.target?.result as string); r.readAsDataURL(file) }
    } catch { const r = new FileReader(); r.onload = ev => updateTr(ev.target?.result as string); r.readAsDataURL(file) }
    finally { setUploading(false) }
  }

  const isImage = field.type === 'image'
  const isArea  = field.type === 'textarea' || field.type === 'richtext'

  return (
    <motion.div
      initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 28 }}
      transition={{ type: 'spring', stiffness: 420, damping: 38 }}
      className="w-[360px] flex-shrink-0 bg-white border-l border-gray-100 flex flex-col shadow-2xl shadow-black/8"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            {isImage ? <ImageIcon className="w-4 h-4 text-amber-500" /> : <Pencil className="w-4 h-4 text-amber-500" />}
          </div>
          <div className="min-w-0">
            <p className="text-gray-900 text-sm font-bold leading-tight truncate">{field.label}</p>
            <p className="text-gray-400 text-base">{isImage ? 'Görsel' : isArea ? 'Uzun metin' : 'Kısa metin'}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors ml-2 flex-shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {isImage ? (
          <>
            {trVal && (
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video group">
                <img src={trVal} alt="" className="w-full h-full object-cover" />
                <button onClick={() => updateTr('')}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center shadow-lg transition-colors opacity-0 group-hover:opacity-100">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className={cn('w-full flex items-center justify-center gap-2 border-2 border-dashed rounded-2xl py-6 text-sm font-semibold transition-all',
                uploading ? 'border-amber-300 bg-amber-50 text-amber-500 cursor-wait'
                  : 'border-gray-200 hover:border-amber-300 bg-gray-50 hover:bg-amber-50/30 text-gray-400 hover:text-amber-500')}>
              {uploading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Yükleniyor...</> : <><Upload className="w-4 h-4" /> Görsel Yükle</>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </>
        ) : (
          <>
            {/* Turkish */}
            <div>
              <label className="text-base font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <span>🇹🇷</span> Türkçe
              </label>
              {isArea
                ? <textarea value={trVal} onChange={e => updateTr(e.target.value)} rows={4}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none leading-relaxed" />
                : <input type="text" value={trVal} onChange={e => updateTr(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
              }
            </div>

            {/* Single TR → EN translate button */}
            <button
              onClick={handleTranslate}
              disabled={translating || !trVal.trim()}
              className={cn(
                'w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold transition-all duration-200',
                translating
                  ? 'bg-amber-100 text-amber-500 cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-md shadow-amber-500/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0'
              )}
            >
              {translating
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Çevriliyor...</>
                : <><span>🇹🇷</span> <Languages className="w-4 h-4" /> TR → EN <span>🇬🇧</span></>}
            </button>

            {/* English */}
            <div>
              <label className="text-base font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <span>🇬🇧</span> English
              </label>
              {isArea
                ? <textarea value={enVal} onChange={e => updateEn(e.target.value)} rows={4}
                    placeholder="Boş — Çevir butonuna bas veya manuel gir"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none leading-relaxed" />
                : <input type="text" value={enVal} onChange={e => updateEn(e.target.value)}
                    placeholder="Boş — Çevir butonuna bas veya manuel gir"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
              }
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
        <button onClick={handleSave}
          className={cn('w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200',
            saved ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/25 hover:-translate-y-0.5 active:translate-y-0')}>
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Kaydedildi!</> : <><Save className="w-4 h-4" /> Kaydet</>}
        </button>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section-specific live preview renderers
// ─────────────────────────────────────────────────────────────────────────────

function HeroPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  const rawVideoId = g('video_id')
  // Extract YouTube ID from full URL or plain ID
  const videoId = rawVideoId ? rawVideoId.trim().match(/(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/)?.[1] || (/^[a-zA-Z0-9_-]{11}$/.test(rawVideoId.trim()) ? rawVideoId.trim() : '') : ''
  return (
    <div className="relative bg-gray-900 overflow-hidden rounded-2xl" style={{ minHeight: 480 }}>
      {videoId ? (
        <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
      {/* Video badge */}
      <div className="absolute top-4 left-4 z-20">
        <E active={isSel('video_id')} onSelect={() => onSel('video_id')}>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-xl px-3 py-1.5">
            <Play className="w-3.5 h-3.5 text-white" />
            <span className="text-white/80 text-xs font-medium">{videoId ? 'Cover Videosu' : 'Video girilmemiş'}</span>
          </div>
        </E>
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-10 py-24 gap-6">
        <E active={isSel('main_title')} onSelect={() => onSel('main_title')}>
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
            {g('main_title') || <span className="opacity-30">Ana Başlık...</span>}
          </h1>
        </E>
        <E active={isSel('description')} onSelect={() => onSel('description')} className="max-w-2xl">
          <p className="text-white/75 text-base leading-relaxed">
            {g('description') || <span className="opacity-30">Açıklama paragrafı...</span>}
          </p>
        </E>
        <E active={isSel('cta_button')} onSelect={() => onSel('cta_button')}>
          <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-amber-500/30">
            {g('cta_button') || 'Buton...'}
          </div>
        </E>
        <E active={isSel('scroll_hint')} onSelect={() => onSel('scroll_hint')}>
          <p className="text-white/40 text-xs">{g('scroll_hint') || 'Scroll hint...'}</p>
        </E>
      </div>
    </div>
  )
}

// Icon options for tag icon picker
const TAG_ICONS: { name: string; icon: LucideIcon }[] = [
  { name: 'Globe', icon: Globe },
  { name: 'Compass', icon: Compass },
  { name: 'Crown', icon: Crown },
  { name: 'Clock', icon: Clock },
  { name: 'ShieldCheck', icon: ShieldCheck },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Wallet', icon: Wallet },
  { name: 'Bus', icon: Bus },
  { name: 'MapPinned', icon: MapPinned },
  { name: 'Heart', icon: Heart },
  { name: 'Shield', icon: Shield },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Star', icon: Star },
  { name: 'Plane', icon: Plane },
  { name: 'Mountain', icon: Mountain },
  { name: 'Anchor', icon: Anchor },
  { name: 'Camera', icon: Camera },
  { name: 'Coffee', icon: Coffee },
  { name: 'Flag', icon: Flag },
  { name: 'Gem', icon: Gem },
  { name: 'Leaf', icon: Leaf },
  { name: 'Map', icon: Map },
  { name: 'Medal', icon: Medal },
  { name: 'Music', icon: Music },
  { name: 'Palmtree', icon: Palmtree },
  { name: 'Rocket', icon: Rocket },
  { name: 'Sun', icon: Sun },
  { name: 'Trophy', icon: Trophy },
  { name: 'Users', icon: Users },
  { name: 'Zap', icon: Zap },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Car', icon: Car },
  { name: 'ArrowRightLeft', icon: ArrowRightLeft },
  { name: 'Fuel', icon: Fuel },
  { name: 'Target', icon: Target },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'BusFront', icon: BusFront },
  { name: 'Phone', icon: Phone },
  { name: 'Handshake', icon: Handshake },
  { name: 'Award', icon: Award },
  { name: 'Cpu', icon: Cpu },
  { name: 'Eye', icon: Eye },
  { name: 'Wrench', icon: Wrench },
  { name: 'Clock', icon: Clock },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'ClipboardList', icon: ClipboardList },
  { name: 'UserCheck', icon: UserCheck },
  { name: 'AlertTriangle', icon: AlertTriangle },
  { name: 'Flame', icon: Flame },
  { name: 'HardHat', icon: HardHat },
  { name: 'CheckCircle', icon: CheckCircle },
  { name: 'Droplets', icon: Droplets },
  { name: 'Wind', icon: Wind },
  { name: 'Recycle', icon: Recycle },
  { name: 'TreePine', icon: TreePine },
  { name: 'Waves', icon: Waves },
  { name: 'FlaskConical', icon: FlaskConical },
]

function HeroTagsPreview({ g, isSel, onSel, pageId, sectionId }: {
  g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string
}) {
  const { getField, updateField } = useAdmin()
  const [iconPicker, setIconPicker] = useState<string | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  // Dynamically count tags from store
  const tags: { id: string; iconId: string }[] = []
  for (let i = 1; i <= 30; i++) {
    const val = g(`tag${i}`)
    if (!val && i > 10) break
    if (val || i <= 10) tags.push({ id: `tag${i}`, iconId: `tag${i}_icon` })
  }
  const lastFilled = tags.reduce((acc, t, i) => (g(t.id) ? i : acc), -1)
  const visibleTags = tags.slice(0, Math.max(lastFilled + 1, 1))

  async function handleAddTag() {
    const nextIdx = visibleTags.length + 1
    const fieldId = `tag${nextIdx}`
    const iconFieldId = `tag${nextIdx}_icon`
    updateField(pageId, sectionId, fieldId, `YENİ ETİKET ${nextIdx}`, '')
    updateField(pageId, sectionId, iconFieldId, 'Globe', '')
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: [
        { page_id: pageId, section_id: sectionId, field_id: fieldId, tr: `YENİ ETİKET ${nextIdx}`, en: '' },
        { page_id: pageId, section_id: sectionId, field_id: iconFieldId, tr: 'Globe', en: '' },
      ] }),
    })
  }

  async function handleDeleteTag(idx: number) {
    const total = visibleTags.length
    for (let i = idx; i < total - 1; i++) {
      const next = getField(pageId, sectionId, `tag${i + 2}`)
      const nextIcon = getField(pageId, sectionId, `tag${i + 2}_icon`)
      updateField(pageId, sectionId, `tag${i + 1}`, next.tr || '', next.en || '')
      updateField(pageId, sectionId, `tag${i + 1}_icon`, nextIcon.tr || 'Globe', nextIcon.en || '')
    }
    updateField(pageId, sectionId, `tag${total}`, '', '')
    updateField(pageId, sectionId, `tag${total}_icon`, '', '')
    const fields = []
    for (let i = idx; i < total; i++) {
      if (i < total - 1) {
        const next = getField(pageId, sectionId, `tag${i + 2}`)
        const nextIcon = getField(pageId, sectionId, `tag${i + 2}_icon`)
        fields.push({ page_id: pageId, section_id: sectionId, field_id: `tag${i + 1}`, tr: next.tr || '', en: next.en || '' })
        fields.push({ page_id: pageId, section_id: sectionId, field_id: `tag${i + 1}_icon`, tr: nextIcon.tr || 'Globe', en: nextIcon.en || '' })
      } else {
        fields.push({ page_id: pageId, section_id: sectionId, field_id: `tag${i + 1}`, tr: '', en: '' })
        fields.push({ page_id: pageId, section_id: sectionId, field_id: `tag${i + 1}_icon`, tr: '', en: '' })
      }
    }
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    })
  }

  async function handleIconChange(tagIdx: number, iconName: string) {
    const fieldId = `tag${tagIdx + 1}_icon`
    const existing = getField(pageId, sectionId, fieldId)
    updateField(pageId, sectionId, fieldId, iconName, iconName)
    setIconPicker(null)
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: [
        { page_id: pageId, section_id: sectionId, field_id: fieldId, tr: iconName, en: existing.en || '' },
      ] }),
    })
  }

  async function handleDrop(fromIdx: number, toIdx: number) {
    if (fromIdx === toIdx) return
    // Collect current order with BOTH languages
    const items = visibleTags.map((_, i) => {
      const tag = getField(pageId, sectionId, `tag${i + 1}`)
      const icon = getField(pageId, sectionId, `tag${i + 1}_icon`)
      return { tr: tag.tr || '', en: tag.en || '', iconTr: icon.tr || 'Globe', iconEn: icon.en || '' }
    })
    // Reorder
    const [moved] = items.splice(fromIdx, 1)
    items.splice(toIdx, 0, moved)
    // Write back preserving both languages
    const fields = []
    for (let i = 0; i < items.length; i++) {
      updateField(pageId, sectionId, `tag${i + 1}`, items[i].tr, items[i].en)
      updateField(pageId, sectionId, `tag${i + 1}_icon`, items[i].iconTr, items[i].iconEn)
      fields.push({ page_id: pageId, section_id: sectionId, field_id: `tag${i + 1}`, tr: items[i].tr, en: items[i].en })
      fields.push({ page_id: pageId, section_id: sectionId, field_id: `tag${i + 1}_icon`, tr: items[i].iconTr, en: items[i].iconEn })
    }
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    })
  }

  return (
    <div className="bg-amber-500 rounded-2xl px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Dönen Etiketler ({visibleTags.length})</p>
        <button onClick={handleAddTag}
          className="flex items-center gap-1.5 text-white/70 hover:text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
          <Plus className="w-3.5 h-3.5" /> Yeni Etiket
        </button>
      </div>
      <div className="space-y-1.5">
        {visibleTags.map((t, i) => {
          const iconName = getField(pageId, sectionId, t.iconId).tr || 'Globe'
          const IconComp = TAG_ICONS.find(ic => ic.name === iconName)?.icon || Globe
          const isDragOver = dragOverIdx === i && dragIdx !== i
          return (
            <div
              key={t.id}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => { e.preventDefault(); setDragOverIdx(i) }}
              onDragLeave={() => setDragOverIdx(null)}
              onDrop={() => { if (dragIdx !== null) handleDrop(dragIdx, i); setDragIdx(null); setDragOverIdx(null) }}
              onDragEnd={() => { setDragIdx(null); setDragOverIdx(null) }}
              className={cn(
                'flex items-center gap-2 group rounded-lg transition-all',
                dragIdx === i && 'opacity-40',
                isDragOver && 'ring-2 ring-white/60 bg-white/10',
              )}
            >
              {/* Drag handle */}
              <div className="cursor-grab active:cursor-grabbing text-white/30 hover:text-white/60 px-0.5">
                <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
                  <circle cx="2" cy="2" r="1.5"/><circle cx="8" cy="2" r="1.5"/>
                  <circle cx="2" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/>
                  <circle cx="2" cy="14" r="1.5"/><circle cx="8" cy="14" r="1.5"/>
                </svg>
              </div>
              {/* Icon picker */}
              <div className="relative">
                <button onClick={() => setIconPicker(iconPicker === t.id ? null : t.id)}
                  className="w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all border border-white/20">
                  <IconComp className="w-4 h-4 text-white" />
                </button>
                {iconPicker === t.id && (
                  <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-2.5 grid grid-cols-6 gap-1 w-56 max-h-48 overflow-y-auto">
                    {TAG_ICONS.map(ic => (
                      <button key={ic.name} onClick={() => handleIconChange(i, ic.name)}
                        className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                          iconName === ic.name ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-400' : 'hover:bg-gray-100 text-gray-600')}>
                        <ic.icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Tag text */}
              <E active={isSel(t.id)} onSelect={() => onSel(t.id)} className="flex-1">
                <div className={cn(
                  'px-4 py-2 rounded-lg text-sm font-extrabold transition-all cursor-pointer',
                  isSel(t.id) ? 'bg-white text-amber-600' : 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                )}>
                  {g(t.id) || `Etiket ${i + 1}`}
                </div>
              </E>
              {/* Delete */}
              {visibleTags.length > 1 && (
                <button onClick={() => handleDeleteTag(i)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-red-500 flex items-center justify-center text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function HeroStatsPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  const stats = [
    { val: 'stat1_value', lbl: 'stat1_label' },
    { val: 'stat2_value', lbl: 'stat2_label' },
    { val: 'stat3_value', lbl: 'stat3_label' },
    { val: 'stat4_value', lbl: 'stat4_label' },
  ]
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-6">
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-5">İnfografik Sayaçlar</p>
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-1.5">
            <E active={isSel(s.val)} onSelect={() => onSel(s.val)}>
              <div className="text-3xl font-black text-amber-500">{g(s.val) || '—'}</div>
            </E>
            <E active={isSel(s.lbl)} onSelect={() => onSel(s.lbl)}>
              <div className="text-xs font-semibold text-gray-500 leading-snug">{g(s.lbl) || '—'}</div>
            </E>
          </div>
        ))}
      </div>
    </div>
  )
}

function AboutPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-8 py-8 space-y-5">
      <E active={isSel('badge')} onSelect={() => onSel('badge')} className="inline-block">
        <div className="inline-flex items-center bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          {g('badge') || 'Rozet...'}
        </div>
      </E>
      <E active={isSel('title')} onSelect={() => onSel('title')}>
        <h2 className="text-3xl font-black text-gray-900 leading-tight">
          {g('title') || <span className="text-gray-300">Başlık...</span>}
        </h2>
      </E>
      <E active={isSel('para1')} onSelect={() => onSel('para1')}>
        <p className="text-gray-600 leading-relaxed">{g('para1') || <span className="text-gray-300">Paragraf 1...</span>}</p>
      </E>
      <E active={isSel('para2')} onSelect={() => onSel('para2')}>
        <p className="text-gray-600 leading-relaxed">{g('para2') || <span className="text-gray-300">Paragraf 2...</span>}</p>
      </E>
      <E active={isSel('quote')} onSelect={() => onSel('quote')}>
        <blockquote className="border-l-4 border-amber-500 pl-5 py-1">
          <p className="text-gray-800 font-semibold italic text-base leading-relaxed">
            {g('quote') || <span className="text-gray-300">Alıntı...</span>}
          </p>
        </blockquote>
      </E>
      <E active={isSel('cta_button')} onSelect={() => onSel('cta_button')} className="inline-block">
        <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-amber-500/20">
          {g('cta_button') || 'Buton...'}
        </div>
      </E>
    </div>
  )
}

function ServicesGridPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  const cards = [
    { label: 's1_label', desc: 's1_desc', img: 's1_img' },
    { label: 's2_label', desc: 's2_desc', img: 's2_img' },
    { label: 's3_label', desc: 's3_desc', img: 's3_img' },
    { label: 's4_label', desc: 's4_desc', img: 's4_img' },
    { label: 's5_label', desc: 's5_desc', img: 's5_img' },
    { label: 's6_label', desc: 's6_desc', img: 's6_img' },
  ]
  return (
    <div className="bg-gray-50 rounded-2xl p-5">
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">Hizmet Kartları (6 adet)</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map((c, i) => (
          <div key={i} className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-200 group/card">
            {g(c.img) && (
              <img src={g(c.img)} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute inset-0 p-3 flex flex-col justify-end gap-1">
              <E active={isSel(c.img)} onSelect={() => onSel(c.img)} className="absolute top-2 right-2">
                <div className="bg-black/50 p-1 rounded-lg"><ImageIcon className="w-3 h-3 text-white" /></div>
              </E>
              <E active={isSel(c.label)} onSelect={() => onSel(c.label)}>
                <p className="text-white font-bold text-sm leading-tight">{g(c.label) || '—'}</p>
              </E>
              <E active={isSel(c.desc)} onSelect={() => onSel(c.desc)}>
                <p className="text-white/60 text-base leading-tight">{g(c.desc) || '—'}</p>
              </E>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FleetBannerPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[21/6]">
      {g('image') && <img src={g('image')} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      <E active={isSel('image')} onSelect={() => onSel('image')} className="absolute inset-0 flex items-center justify-center">
        {!g('image') && <div className="text-gray-300 text-sm font-bold">Görsel Yükle</div>}
      </E>
    </div>
  )
}

function ReferencesLogoPreview({ g, isSel, onSel, pageId, sectionId }: {
  g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string
}) {
  const { getField, updateField } = useAdmin()
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [uploading, setUploading] = useState<string | null>(null)

  // Dynamically count logos
  const logos: { id: string; url: string }[] = []
  for (let i = 1; i <= 30; i++) {
    const url = g(`logo${i}`)
    if (!url && i > 16) break
    if (url) logos.push({ id: `logo${i}`, url })
  }

  async function handleUpload(idx: number, file: File) {
    const fieldId = `logo${idx + 1}`
    setUploading(fieldId)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'references')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        updateField(pageId, sectionId, fieldId, data.url, '')
        await fetch('/api/admin/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: [
            { page_id: pageId, section_id: sectionId, field_id: fieldId, tr: data.url, en: '' },
          ] }),
        })
      }
    } catch {}
    setUploading(null)
  }

  async function handleAddLogo(file: File) {
    const nextIdx = logos.length
    const fieldId = `logo${nextIdx + 1}`
    setUploading(fieldId)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'references')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        updateField(pageId, sectionId, fieldId, data.url, '')
        await fetch('/api/admin/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: [
            { page_id: pageId, section_id: sectionId, field_id: fieldId, tr: data.url, en: '' },
          ] }),
        })
      }
    } catch {}
    setUploading(null)
  }

  async function handleDelete(idx: number) {
    const total = logos.length
    // Shift remaining up
    const fields = []
    for (let i = idx; i < total - 1; i++) {
      const nextUrl = getField(pageId, sectionId, `logo${i + 2}`).tr || ''
      updateField(pageId, sectionId, `logo${i + 1}`, nextUrl, '')
      fields.push({ page_id: pageId, section_id: sectionId, field_id: `logo${i + 1}`, tr: nextUrl, en: '' })
    }
    // Clear last
    updateField(pageId, sectionId, `logo${total}`, '', '')
    fields.push({ page_id: pageId, section_id: sectionId, field_id: `logo${total}`, tr: '', en: '' })
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    })
  }

  async function handleDrop(fromIdx: number, toIdx: number) {
    if (fromIdx === toIdx) return
    const items = logos.map((_, i) => getField(pageId, sectionId, `logo${i + 1}`).tr || '')
    const [moved] = items.splice(fromIdx, 1)
    items.splice(toIdx, 0, moved)
    const fields = []
    for (let i = 0; i < items.length; i++) {
      updateField(pageId, sectionId, `logo${i + 1}`, items[i], '')
      fields.push({ page_id: pageId, section_id: sectionId, field_id: `logo${i + 1}`, tr: items[i], en: '' })
    }
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    })
  }

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 px-6 py-6 space-y-5">
      {/* Editable text section */}
      <div className="text-center space-y-2">
        <E active={isSel('badge')} onSelect={() => onSel('badge')}>
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-amber-600 text-xs font-bold uppercase tracking-widest">{g('badge') || 'Rozet...'}</span>
          </div>
        </E>
        <E active={isSel('title')} onSelect={() => onSel('title')}>
          <h3 className="text-xl font-black text-gray-900">{g('title') || 'Başlık...'}</h3>
        </E>
        <E active={isSel('subtitle')} onSelect={() => onSel('subtitle')}>
          <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">{g('subtitle') || 'Açıklama...'}</p>
        </E>
      </div>

      {/* Logo grid */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Logolar ({logos.length})</p>
        <label className="flex items-center gap-1.5 text-amber-600 hover:text-amber-500 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Logo Ekle
          <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleAddLogo(e.target.files[0]); e.target.value = '' }} />
        </label>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {logos.map((logo, i) => {
          const isDragOver = dragOverIdx === i && dragIdx !== i
          return (
            <div
              key={logo.id}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={e => { e.preventDefault(); setDragOverIdx(i) }}
              onDragLeave={() => setDragOverIdx(null)}
              onDrop={() => { if (dragIdx !== null) handleDrop(dragIdx, i); setDragIdx(null); setDragOverIdx(null) }}
              onDragEnd={() => { setDragIdx(null); setDragOverIdx(null) }}
              className={cn(
                'relative group rounded-xl border bg-white p-2 aspect-[3/2] flex items-center justify-center cursor-grab active:cursor-grabbing transition-all',
                dragIdx === i && 'opacity-30',
                isDragOver ? 'border-amber-400 ring-2 ring-amber-200 bg-amber-50' : 'border-gray-200 hover:border-gray-300',
              )}
            >
              {uploading === logo.id ? (
                <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />
              ) : (
                <img src={logo.url} alt="" className="max-w-full max-h-full object-contain" />
              )}
              {/* Replace */}
              <label className="absolute top-1 left-1 w-6 h-6 rounded-md bg-gray-100 hover:bg-amber-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                <Upload className="w-3 h-3 text-gray-500" />
                <input type="file" accept="image/*" className="hidden"
                  ref={el => { fileRefs.current[logo.id] = el }}
                  onChange={e => { if (e.target.files?.[0]) handleUpload(i, e.target.files[0]); e.target.value = '' }} />
              </label>
              {/* Delete */}
              <button onClick={() => handleDelete(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-md bg-gray-100 hover:bg-red-500 flex items-center justify-center text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-3 h-3" />
              </button>
              {/* Index label */}
              <span className="absolute bottom-1 left-1 text-sm font-bold text-gray-300">{i + 1}</span>
            </div>
          )
        })}
        {logos.length === 0 && (
          <div className="col-span-4 py-8 text-center text-gray-300 text-sm">
            Henüz logo eklenmedi. Yukarıdaki &quot;Logo Ekle&quot; butonunu kullanın.
          </div>
        )}
      </div>
    </div>
  )
}

function TestimonialsPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  const reviews = [
    { name: 'r1_name', title: 'r1_title', comment: 'r1_comment' },
    { name: 'r2_name', title: 'r2_title', comment: 'r2_comment' },
    { name: 'r3_name', title: 'r3_title', comment: 'r3_comment' },
    { name: 'r4_name', title: 'r4_title', comment: 'r4_comment' },
    { name: 'r5_name', title: 'r5_title', comment: 'r5_comment' },
    { name: 'r6_name', title: 'r6_title', comment: 'r6_comment' },
  ]
  return (
    <div className="bg-amber-500 rounded-2xl p-6">
      {/* Editable header */}
      <div className="text-center mb-5 space-y-1.5">
        <E active={isSel('badge')} onSelect={() => onSel('badge')}>
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">{g('badge') || 'Rozet...'}</p>
        </E>
        <E active={isSel('title')} onSelect={() => onSel('title')}>
          <h3 className="text-white font-black text-lg">{g('title') || 'Başlık...'}</h3>
        </E>
        <E active={isSel('subtitle')} onSelect={() => onSel('subtitle')}>
          <p className="text-white/70 text-sm">{g('subtitle') || 'Açıklama...'}</p>
        </E>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {reviews.map((r, i) => (
          <div key={i} className="bg-white/15 border border-white/20 rounded-2xl p-4 space-y-3">
            <Quote className="w-4 h-4 text-white/30" />
            <E active={isSel(r.comment)} onSelect={() => onSel(r.comment)}>
              <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
                {g(r.comment) || <span className="opacity-40">Yorum girilmemiş...</span>}
              </p>
            </E>
            <div className="flex items-center gap-2 pt-1 border-t border-white/20">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {g(r.name).charAt(0) || '?'}
              </div>
              <div className="min-w-0">
                <E active={isSel(r.name)} onSelect={() => onSel(r.name)}>
                  <p className="text-white font-bold text-sm truncate">{g(r.name) || '—'}</p>
                </E>
                {r.title && (
                  <E active={isSel(r.title)} onSelect={() => onSel(r.title)}>
                    <p className="text-white/60 text-base truncate">{g(r.title) || ''}</p>
                  </E>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FaqPreview({ g, isSel, onSel, pageId, sectionId }: {
  g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string
}) {
  const { getField, updateField } = useAdmin()
  const [open, setOpen] = useState<number | null>(0)
  const [activeCat, setActiveCat] = useState(0)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [, forceUpdate] = useState(0)
  const rerender = () => forceUpdate(n => n + 1)

  const gf = (fid: string) => getField(pageId, sectionId, fid)
  const sv = async (fields: { field_id: string; tr: string; en: string }[]) => {
    await fetch('/api/admin/content', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: fields.map(f => ({ page_id: pageId, section_id: sectionId, ...f })) }),
    })
  }

  // Read dynamic structure
  const catCount = parseInt(gf('cat_count').tr) || 3
  const cats: { name: string; fc: number }[] = []
  for (let c = 1; c <= catCount; c++) {
    cats.push({ name: gf(`cat${c}`).tr || `Kategori ${c}`, fc: parseInt(gf(`cat${c}_count`).tr) || 0 })
  }

  // Auto-initialize from old structure if needed
  if (!gf('cat_count').tr) {
    const init = [
      { name: g('cat1') || 'Taşımacılık', ids: [1,2,3,4] },
      { name: g('cat2') || 'Araç & Kiralama', ids: [5,6,7] },
      { name: g('cat3') || 'Seyahat & Ödeme', ids: [8,9,10] },
    ]
    const flds: { field_id: string; tr: string; en: string }[] = [{ field_id: 'cat_count', tr: '3', en: '' }]
    init.forEach((cat, ci) => {
      const cn = ci + 1
      flds.push({ field_id: `cat${cn}`, tr: cat.name, en: gf(`cat${cn}`).en || '' })
      flds.push({ field_id: `cat${cn}_count`, tr: String(cat.ids.length), en: '' })
      cat.ids.forEach((oid, qi) => {
        const qn = qi + 1
        flds.push({ field_id: `cat${cn}_q${qn}`, tr: g(`faq${oid}_q`) || '', en: gf(`faq${oid}_q`).en || '' })
        flds.push({ field_id: `cat${cn}_a${qn}`, tr: g(`faq${oid}_a`) || '', en: gf(`faq${oid}_a`).en || '' })
      })
    })
    flds.forEach(f => updateField(pageId, sectionId, f.field_id, f.tr, f.en))
    sv(flds)
    cats.length = 0
    init.forEach(c => cats.push({ name: c.name, fc: c.ids.length }))
  }

  async function addCategory() {
    const nc = catCount + 1
    updateField(pageId, sectionId, 'cat_count', String(nc), '')
    updateField(pageId, sectionId, `cat${nc}`, 'Yeni Kategori', '')
    updateField(pageId, sectionId, `cat${nc}_count`, '0', '')
    await sv([
      { field_id: 'cat_count', tr: String(nc), en: '' },
      { field_id: `cat${nc}`, tr: 'Yeni Kategori', en: '' },
      { field_id: `cat${nc}_count`, tr: '0', en: '' },
    ])
    setActiveCat(nc - 1); rerender()
  }

  async function removeCategory(ci: number) {
    if (catCount <= 1) return
    const flds: { field_id: string; tr: string; en: string }[] = []
    for (let c = ci + 1; c < catCount; c++) {
      const s = c + 1, d = c
      const sn = gf(`cat${s}`), sc = gf(`cat${s}_count`)
      updateField(pageId, sectionId, `cat${d}`, sn.tr, sn.en)
      updateField(pageId, sectionId, `cat${d}_count`, sc.tr, '')
      flds.push({ field_id: `cat${d}`, tr: sn.tr, en: sn.en }, { field_id: `cat${d}_count`, tr: sc.tr, en: '' })
      for (let q = 1; q <= (parseInt(sc.tr) || 0); q++) {
        const sq = gf(`cat${s}_q${q}`), sa = gf(`cat${s}_a${q}`)
        updateField(pageId, sectionId, `cat${d}_q${q}`, sq.tr, sq.en)
        updateField(pageId, sectionId, `cat${d}_a${q}`, sa.tr, sa.en)
        flds.push({ field_id: `cat${d}_q${q}`, tr: sq.tr, en: sq.en }, { field_id: `cat${d}_a${q}`, tr: sa.tr, en: sa.en })
      }
    }
    updateField(pageId, sectionId, `cat${catCount}`, '', ''); updateField(pageId, sectionId, `cat${catCount}_count`, '', '')
    flds.push({ field_id: `cat${catCount}`, tr: '', en: '' }, { field_id: `cat${catCount}_count`, tr: '', en: '' })
    const nc = catCount - 1
    updateField(pageId, sectionId, 'cat_count', String(nc), '')
    flds.push({ field_id: 'cat_count', tr: String(nc), en: '' })
    await sv(flds)
    if (activeCat >= nc) setActiveCat(nc - 1); rerender()
  }

  async function addQuestion(ci: number) {
    const cn = ci + 1, nq = (cats[ci]?.fc || 0) + 1
    updateField(pageId, sectionId, `cat${cn}_count`, String(nq), '')
    updateField(pageId, sectionId, `cat${cn}_q${nq}`, 'Yeni soru?', '')
    updateField(pageId, sectionId, `cat${cn}_a${nq}`, 'Cevap giriniz.', '')
    await sv([
      { field_id: `cat${cn}_count`, tr: String(nq), en: '' },
      { field_id: `cat${cn}_q${nq}`, tr: 'Yeni soru?', en: '' },
      { field_id: `cat${cn}_a${nq}`, tr: 'Cevap giriniz.', en: '' },
    ])
    rerender()
  }

  async function reorderQuestion(ci: number, fromIdx: number, toIdx: number) {
    if (fromIdx === toIdx) return
    const cn = ci + 1, total = cats[ci]?.fc || 0
    // Collect all Q&A data
    const items: { q: { tr: string; en: string }; a: { tr: string; en: string } }[] = []
    for (let i = 0; i < total; i++) {
      items.push({ q: { ...gf(`cat${cn}_q${i+1}`) }, a: { ...gf(`cat${cn}_a${i+1}`) } })
    }
    // Move item
    const [moved] = items.splice(fromIdx, 1)
    items.splice(toIdx, 0, moved)
    // Write back all
    const flds: { field_id: string; tr: string; en: string }[] = []
    items.forEach((item, i) => {
      const qn = i + 1
      updateField(pageId, sectionId, `cat${cn}_q${qn}`, item.q.tr, item.q.en)
      updateField(pageId, sectionId, `cat${cn}_a${qn}`, item.a.tr, item.a.en)
      flds.push({ field_id: `cat${cn}_q${qn}`, tr: item.q.tr, en: item.q.en })
      flds.push({ field_id: `cat${cn}_a${qn}`, tr: item.a.tr, en: item.a.en })
    })
    await sv(flds); rerender()
  }

  async function removeQuestion(ci: number, qi: number) {
    const cn = ci + 1, total = cats[ci]?.fc || 0
    const flds: { field_id: string; tr: string; en: string }[] = []
    for (let q = qi + 1; q < total; q++) {
      const s = q + 1, d = q
      const sq = gf(`cat${cn}_q${s}`), sa = gf(`cat${cn}_a${s}`)
      updateField(pageId, sectionId, `cat${cn}_q${d}`, sq.tr, sq.en)
      updateField(pageId, sectionId, `cat${cn}_a${d}`, sa.tr, sa.en)
      flds.push({ field_id: `cat${cn}_q${d}`, tr: sq.tr, en: sq.en }, { field_id: `cat${cn}_a${d}`, tr: sa.tr, en: sa.en })
    }
    updateField(pageId, sectionId, `cat${cn}_q${total}`, '', ''); updateField(pageId, sectionId, `cat${cn}_a${total}`, '', '')
    flds.push({ field_id: `cat${cn}_q${total}`, tr: '', en: '' }, { field_id: `cat${cn}_a${total}`, tr: '', en: '' })
    const nc = total - 1
    updateField(pageId, sectionId, `cat${cn}_count`, String(nc), '')
    flds.push({ field_id: `cat${cn}_count`, tr: String(nc), en: '' })
    await sv(flds); rerender()
  }

  const curCat = cats[activeCat]
  const catNum = activeCat + 1

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 space-y-1.5">
        <E active={isSel('badge')} onSelect={() => onSel('badge')}>
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-amber-600 text-base font-bold uppercase tracking-widest">{g('badge') || 'SSS'}</span>
          </div>
        </E>
        <E active={isSel('title')} onSelect={() => onSel('title')}>
          <h3 className="text-lg font-black text-gray-900">{g('title') || 'Başlık...'}</h3>
        </E>
        <E active={isSel('subtitle')} onSelect={() => onSel('subtitle')}>
          <p className="text-gray-400 text-sm">{g('subtitle') || 'Açıklama...'}</p>
        </E>
      </div>

      <div className="flex items-center gap-1.5 px-6 py-3 bg-white border-b border-gray-100 overflow-x-auto">
        {cats.map((cat, ci) => (
          <div key={ci} className="relative group flex-shrink-0">
            <E active={isSel(`cat${ci+1}`)} onSelect={() => onSel(`cat${ci+1}`)}>
              <button onClick={() => { setActiveCat(ci); setOpen(0) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCat === ci ? 'bg-amber-500 text-white shadow shadow-amber-500/25' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                } ${catCount > 1 ? 'pr-6' : ''}`}>
                {cat.name}
              </button>
            </E>
            {catCount > 1 && (
              <button onClick={() => removeCategory(ci)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold leading-none">
                ✕
              </button>
            )}
          </div>
        ))}
        <button onClick={addCategory}
          className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-100 hover:bg-amber-100 flex items-center justify-center text-gray-400 hover:text-amber-600 transition-all">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {curCat && (
        <div className="divide-y divide-gray-100">
          {Array.from({ length: curCat.fc }, (_, qi) => {
            const qn = qi + 1, qF = `cat${catNum}_q${qn}`, aF = `cat${catNum}_a${qn}`
            const isDragOver = dragOverIdx === qi && dragIdx !== qi
            return (
              <div key={qi}
                className={`group/q relative transition-all ${isDragOver ? 'bg-amber-50 border-t-2 border-amber-400' : ''} ${dragIdx === qi ? 'opacity-40' : ''}`}
                draggable
                onDragStart={() => setDragIdx(qi)}
                onDragOver={e => { e.preventDefault(); setDragOverIdx(qi) }}
                onDragLeave={() => setDragOverIdx(null)}
                onDrop={() => { if (dragIdx !== null) reorderQuestion(activeCat, dragIdx, qi); setDragIdx(null); setDragOverIdx(null) }}
                onDragEnd={() => { setDragIdx(null); setDragOverIdx(null) }}
              >
                <div className="px-6 py-3.5 flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setOpen(open === qi ? null : qi)}>
                  <GripVertical className="w-3.5 h-3.5 text-gray-300 cursor-grab flex-shrink-0" />
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{qn}</div>
                  <E active={isSel(qF)} onSelect={() => onSel(qF)} className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{gf(qF).tr || <span className="text-gray-300">Soru girilmemiş...</span>}</p>
                  </E>
                  <button onClick={e => { e.stopPropagation(); removeQuestion(activeCat, qi) }}
                    className="w-5 h-5 rounded-full bg-gray-100 hover:bg-red-500 flex items-center justify-center text-gray-400 hover:text-white opacity-0 group-hover/q:opacity-100 transition-all flex-shrink-0">
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <AnimatePresence>
                  {open === qi && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <E active={isSel(aF)} onSelect={() => onSel(aF)} className="mx-6 mb-4 mt-1">
                        <p className="text-gray-600 text-sm leading-relaxed pl-8">{gf(aF).tr || <span className="text-gray-300">Cevap girilmemiş...</span>}</p>
                      </E>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
          <div className="px-6 py-3">
            <button onClick={() => addQuestion(activeCat)}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-amber-300 rounded-xl py-3 text-xs font-semibold text-gray-400 hover:text-amber-500 transition-all hover:bg-amber-50/30">
              <Plus className="w-3.5 h-3.5" /> Soru Ekle
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function NewsletterPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="bg-amber-500 rounded-2xl p-6 space-y-3 relative overflow-hidden">
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
      <div className="relative space-y-3">
        <E active={isSel('badge')} onSelect={() => onSel('badge')}>
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-3 py-1">
            <span className="text-white text-base font-bold uppercase tracking-widest">{g('badge') || 'Bülten'}</span>
          </div>
        </E>
        <E active={isSel('title1')} onSelect={() => onSel('title1')}>
          <p className="text-white font-black text-lg leading-tight">{g('title1') || 'Başlık 1...'}</p>
        </E>
        <E active={isSel('title2')} onSelect={() => onSel('title2')}>
          <p className="text-white/75 font-black text-lg leading-tight -mt-2">{g('title2') || 'Başlık 2...'}</p>
        </E>
        <E active={isSel('subtitle')} onSelect={() => onSel('subtitle')}>
          <p className="text-white/75 text-sm leading-relaxed">{g('subtitle') || 'Açıklama...'}</p>
        </E>
        <div className="space-y-1.5 py-1">
          {['perk1','perk2','perk3'].map(pk => (
            <E key={pk} active={isSel(pk)} onSelect={() => onSel(pk)}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-white/90 text-sm">{g(pk) || 'Avantaj...'}</span>
              </div>
            </E>
          ))}
        </div>
        <E active={isSel('placeholder')} onSelect={() => onSel('placeholder')}>
          <div className="bg-white rounded-lg px-3 py-2.5 text-gray-400 text-xs">{g('placeholder') || 'ornek@sirket.com'}</div>
        </E>
        <E active={isSel('button')} onSelect={() => onSel('button')}>
          <div className="bg-gray-900 text-white text-center rounded-lg py-2.5 text-xs font-bold">{g('button') || 'Kayıt Ol'}</div>
        </E>
        <E active={isSel('disclaimer')} onSelect={() => onSel('disclaimer')}>
          <p className="text-white/40 text-base text-center">{g('disclaimer') || 'Uyarı...'}</p>
        </E>
      </div>
    </div>
  )
}

function ContactInfoPreview({ section, g, isSel, onSel }: { section: ContentSection; g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-amber-500 rounded-2xl p-6 text-center space-y-1.5">
        <E active={isSel('badge')} onSelect={() => onSel('badge')}>
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-white text-base font-bold uppercase tracking-widest">{g('badge') || 'İletişim'}</span>
          </div>
        </E>
        <E active={isSel('title')} onSelect={() => onSel('title')}>
          <h3 className="text-white font-black text-lg">{g('title') || 'Başlık...'}</h3>
        </E>
        <E active={isSel('subtitle')} onSelect={() => onSel('subtitle')}>
          <p className="text-white/70 text-sm">{g('subtitle') || 'Açıklama...'}</p>
        </E>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Phone */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-2">
            <Phone className="w-4 h-4 text-amber-500" />
          </div>
          <E active={isSel('phone_label')} onSelect={() => onSel('phone_label')}>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{g('phone_label') || 'Telefon'}</p>
          </E>
          <E active={isSel('phone_primary')} onSelect={() => onSel('phone_primary')}>
            <p className="text-gray-900 font-bold text-sm">{g('phone_primary') || '—'}</p>
          </E>
          <E active={isSel('phone_secondary')} onSelect={() => onSel('phone_secondary')}>
            <p className="text-gray-400 text-base whitespace-pre-line">{g('phone_secondary') || '—'}</p>
          </E>
        </div>
        {/* Email */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-2">
            <MailIcon className="w-4 h-4 text-amber-500" />
          </div>
          <E active={isSel('email_label')} onSelect={() => onSel('email_label')}>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{g('email_label') || 'E-posta'}</p>
          </E>
          <E active={isSel('email_primary')} onSelect={() => onSel('email_primary')}>
            <p className="text-gray-900 font-bold text-sm">{g('email_primary') || '—'}</p>
          </E>
          <E active={isSel('email_note')} onSelect={() => onSel('email_note')}>
            <p className="text-gray-400 text-base">{g('email_note') || '—'}</p>
          </E>
        </div>
        {/* Address */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-2">
            <MapPin className="w-4 h-4 text-amber-500" />
          </div>
          <E active={isSel('address_label')} onSelect={() => onSel('address_label')}>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{g('address_label') || 'Adres'}</p>
          </E>
          <E active={isSel('address_short')} onSelect={() => onSel('address_short')}>
            <p className="text-gray-900 font-bold text-sm">{g('address_short') || '—'}</p>
          </E>
          <E active={isSel('address_full')} onSelect={() => onSel('address_full')}>
            <p className="text-gray-400 text-base whitespace-pre-line">{g('address_full') || '—'}</p>
          </E>
        </div>
        {/* Hours */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <E active={isSel('hours_label')} onSelect={() => onSel('hours_label')}>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{g('hours_label') || 'Çalışma Saatleri'}</p>
          </E>
          <E active={isSel('hours_primary')} onSelect={() => onSel('hours_primary')}>
            <p className="text-gray-900 font-bold text-sm">{g('hours_primary') || '—'}</p>
          </E>
          <E active={isSel('hours_note')} onSelect={() => onSel('hours_note')}>
            <p className="text-gray-400 text-base">{g('hours_note') || '—'}</p>
          </E>
        </div>
      </div>

      {/* Map */}
      <E active={isSel('map_url')} onSelect={() => onSel('map_url')}>
        <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 h-36 relative">
          {g('map_url') ? (
            <iframe src={g('map_url')} width="100%" height="100%" style={{ border: 0 }} className="absolute inset-0 pointer-events-none" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-xs">Harita URL giriniz</div>
          )}
          <div className="absolute bottom-2 right-2 bg-white/90 text-gray-500 text-sm font-semibold px-2 py-1 rounded-md">📍 Harita — tıklayarak URL düzenle</div>
        </div>
      </E>

      {/* Form preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <E active={isSel('form_title')} onSelect={() => onSel('form_title')}>
          <h4 className="font-black text-gray-900 text-sm">{g('form_title') || 'Form Başlığı...'}</h4>
        </E>
        <E active={isSel('form_subtitle')} onSelect={() => onSel('form_subtitle')}>
          <p className="text-gray-400 text-base">{g('form_subtitle') || 'Açıklama...'}</p>
        </E>
        <div className="grid grid-cols-2 gap-2">
          <E active={isSel('label_name')} onSelect={() => onSel('label_name')}>
            <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              <p className="text-sm text-gray-500 font-semibold">{g('label_name') || 'Ad Soyad *'}</p>
            </div>
          </E>
          <E active={isSel('label_phone')} onSelect={() => onSel('label_phone')}>
            <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              <p className="text-sm text-gray-500 font-semibold">{g('label_phone') || 'Telefon'}</p>
            </div>
          </E>
        </div>
        <E active={isSel('label_email')} onSelect={() => onSel('label_email')}>
          <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
            <p className="text-sm text-gray-500 font-semibold">{g('label_email') || 'E-posta *'}</p>
          </div>
        </E>
        <E active={isSel('label_message')} onSelect={() => onSel('label_message')}>
          <div className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
            <p className="text-sm text-gray-500 font-semibold">{g('label_message') || 'Mesajınız *'}</p>
          </div>
        </E>
        <E active={isSel('button_text')} onSelect={() => onSel('button_text')}>
          <div className="bg-amber-500 text-white text-center rounded-lg py-2.5 text-xs font-bold">
            {g('button_text') || 'Gönder'}
          </div>
        </E>
      </div>
    </div>
  )
}

function GalleryPreview({ section, g, isSel, onSel }: { section: ContentSection; g: GetVal; isSel: IsSel; onSel: OnSel }) {
  const images = section.fields.filter(f => f.type === 'image')
  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Galeri</p>
      <div className="grid grid-cols-3 gap-2">
        {images.map(f => (
          <E key={f.id} active={isSel(f.id)} onSelect={() => onSel(f.id)}>
            <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden">
              {g(f.id) ? <img src={g(f.id)} alt="" className="w-full h-full object-cover" /> : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </div>
          </E>
        ))}
      </div>
    </div>
  )
}

function StatsPreview({ section, g, isSel, onSel }: { section: ContentSection; g: GetVal; isSel: IsSel; onSel: OnSel }) {
  const pairs: Array<{val: ContentField; lbl: ContentField}> = []
  const valFields = section.fields.filter(f => f.id.includes('_val') || f.id.includes('_value'))
  valFields.forEach(vf => {
    const lblId = vf.id.replace('_val', '_lbl').replace('_value', '_label')
    const lblField = section.fields.find(f => f.id === lblId)
    if (lblField) pairs.push({ val: vf, lbl: lblField })
  })
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-5">İstatistikler</p>
      <div className="grid grid-cols-4 gap-4">
        {pairs.map((p, i) => (
          <div key={i} className="text-center space-y-1">
            <E active={isSel(p.val.id)} onSelect={() => onSel(p.val.id)}>
              <div className="text-2xl font-black text-amber-500">{g(p.val.id) || '—'}</div>
            </E>
            <E active={isSel(p.lbl.id)} onSelect={() => onSel(p.lbl.id)}>
              <div className="text-sm text-gray-500 font-medium">{g(p.lbl.id) || '—'}</div>
            </E>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── BIZ KIMIZ PREVIEWS ──────────────────────────────────────────────────────
function getTagIcon(name: string): LucideIcon | null {
  const found = TAG_ICONS.find(i => i.name === name)
  return found ? found.icon : null
}

function BizKimizIconPicker({ fieldId, g, pageId, sectionId, variant }: { fieldId: string; g: GetVal; pageId: string; sectionId: string; variant?: 'default' | 'light' }) {
  const { getField, updateField } = useAdmin()
  const [open, setOpen] = useState(false)
  const current = getField(pageId, sectionId, fieldId).tr || getField(pageId, sectionId, fieldId).en || ''
  const Icon = getTagIcon(current)
  const isLight = variant === 'light'
  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(!open)}
        className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
          isLight
            ? 'bg-white/20 hover:bg-white/30 border-white/30'
            : 'bg-amber-50 hover:bg-amber-100 border-amber-200'
        }`}
        title="İkon Değiştir">
        {Icon ? <Icon className={`w-4 h-4 ${isLight ? 'text-white' : 'text-amber-500'}`} strokeWidth={1.75} /> : <span className="text-base text-gray-400">?</span>}
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-2 grid grid-cols-6 gap-1 w-[196px]">
          {TAG_ICONS.map(ic => (
            <button key={ic.name} onClick={() => {
              updateField(pageId, sectionId, fieldId, ic.name, ic.name)
              setOpen(false)
            }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${current === ic.name ? 'bg-amber-500 text-white' : 'hover:bg-amber-50 text-gray-600'}`}
            title={ic.name}>
              <ic.icon className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function BizKimizHeroPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      {/* Hero banner */}
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden p-6 min-h-[180px]">
        {g('hero_img') && (
          <div className="absolute inset-0 opacity-30">
            <img src={g('hero_img')} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <div className="relative z-10 space-y-2">
          <E active={isSel('badge')} onSelect={() => onSel('badge')}>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-400 text-base font-bold uppercase tracking-widest">{g('badge') || 'Rozet'}</span>
            </div>
          </E>
          <E active={isSel('title')} onSelect={() => onSel('title')}>
            <h3 className="text-white font-black text-xl">{g('title') || 'Başlık...'}</h3>
          </E>
          <E active={isSel('subtitle')} onSelect={() => onSel('subtitle')}>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">{g('subtitle') || 'Alt başlık...'}</p>
          </E>
        </div>
      </div>
      {/* Banner image selector — prominent card */}
      <E active={isSel('hero_img')} onSelect={() => onSel('hero_img')}>
        <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-amber-400 transition-all cursor-pointer group">
          {g('hero_img') ? (
            <div className="relative">
              <img src={g('hero_img')} alt="" className="w-full h-28 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
                  <Camera className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-gray-700">Görseli Değiştir</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-28 bg-gray-50 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Camera className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-xs font-semibold text-gray-400">Banner Görseli Seçin</span>
            </div>
          )}
        </div>
      </E>
      {/* Stats with icon pickers */}
      <div className="grid grid-cols-4 gap-2">
        {[1,2,3,4].map(n => {
          const StatIcon = getTagIcon(g(`stat${n}_icon`))
          return (
            <div key={n} className="bg-gray-900/5 border border-gray-200 rounded-xl p-3 text-center space-y-1">
              <div className="flex justify-center mb-1">
                <BizKimizIconPicker fieldId={`stat${n}_icon`} g={g} pageId={pageId} sectionId={sectionId} />
              </div>
              <E active={isSel(`stat${n}_val`)} onSelect={() => onSel(`stat${n}_val`)}>
                <p className="text-lg font-black text-amber-500">{g(`stat${n}_val`) || '—'}</p>
              </E>
              <E active={isSel(`stat${n}_lbl`)} onSelect={() => onSel(`stat${n}_lbl`)}>
                <p className="text-sm text-gray-500">{g(`stat${n}_lbl`) || 'Etiket'}</p>
              </E>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BizKimizAboutPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="grid grid-cols-[1fr_140px] gap-4">
      {/* Content */}
      <div className="space-y-3">
        <E active={isSel('about_title')} onSelect={() => onSel('about_title')}>
          <h4 className="font-black text-gray-900 text-sm">{g('about_title') || 'Başlık...'}</h4>
        </E>
        <E active={isSel('about_p1')} onSelect={() => onSel('about_p1')}>
          <p className="text-gray-600 text-base leading-relaxed">{g('about_p1') || 'Paragraf 1...'}</p>
        </E>
        <E active={isSel('about_p2')} onSelect={() => onSel('about_p2')}>
          <p className="text-gray-600 text-base leading-relaxed">{g('about_p2') || 'Paragraf 2...'}</p>
        </E>
        <E active={isSel('quote')} onSelect={() => onSel('quote')}>
          <blockquote className="border-l-3 border-amber-500 pl-3 py-1 bg-amber-50/50 rounded-r-lg">
            <p className="text-gray-700 text-base font-medium italic">&quot;{g('quote') || 'Alıntı...'}&quot;</p>
          </blockquote>
        </E>
        <E active={isSel('quote_desc')} onSelect={() => onSel('quote_desc')}>
          <p className="text-gray-400 text-base pl-3">{g('quote_desc') || 'Açıklama...'}</p>
        </E>
      </div>
      {/* Sidebar card */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 space-y-2">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center mb-2">
          <BusFront className="w-4 h-4 text-white" strokeWidth={1.75} />
        </div>
        <E active={isSel('card_title')} onSelect={() => onSel('card_title')}>
          <p className="font-black text-gray-900 text-sm">{g('card_title') || 'Başlık'}</p>
        </E>
        <E active={isSel('card_desc')} onSelect={() => onSel('card_desc')}>
          <p className="text-gray-500 text-sm">{g('card_desc') || 'Açıklama'}</p>
        </E>
        <div className="space-y-1.5 pt-1">
          {[1,2,3,4].map(n => {
            const CardIcon = getTagIcon(g(`card_icon${n}`))
            return (
              <div key={n} className="flex items-center gap-1.5">
                <BizKimizIconPicker fieldId={`card_icon${n}`} g={g} pageId={pageId} sectionId={sectionId} />
                <E active={isSel(`card_item${n}`)} onSelect={() => onSel(`card_item${n}`)}>
                  <span className="text-gray-600 text-sm">{g(`card_item${n}`) || 'Özellik...'}</span>
                </E>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BizKimizServicesPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-amber-500" />
        <div>
          <E active={isSel('srv_title')} onSelect={() => onSel('srv_title')}>
            <h4 className="font-black text-gray-900 text-sm">{g('srv_title') || 'Başlık'}</h4>
          </E>
          <E active={isSel('srv_desc')} onSelect={() => onSel('srv_desc')}>
            <p className="text-gray-400 text-base">{g('srv_desc') || 'Açıklama'}</p>
          </E>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[1,2,3,4,5,6].map(n => {
          const SrvIcon = getTagIcon(g(`srv${n}_icon`))
          return (
            <div key={n} className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl p-3 hover:border-amber-200 transition-colors">
              <BizKimizIconPicker fieldId={`srv${n}_icon`} g={g} pageId={pageId} sectionId={sectionId} />
              <E active={isSel(`srv${n}`)} onSelect={() => onSel(`srv${n}`)}>
                <p className="text-gray-700 text-base font-semibold leading-tight">{g(`srv${n}`) || 'Alan...'}</p>
              </E>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BizKimizVisionPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-amber-500" />
        <div>
          <E active={isSel('vm_title')} onSelect={() => onSel('vm_title')}>
            <h4 className="font-black text-gray-900 text-sm">{g('vm_title') || 'Başlık'}</h4>
          </E>
          <E active={isSel('vm_desc')} onSelect={() => onSel('vm_desc')}>
            <p className="text-gray-400 text-base">{g('vm_desc') || 'Açıklama'}</p>
          </E>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {/* Vizyon */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 space-y-1.5">
            <BizKimizIconPicker fieldId="viz_icon" g={g} pageId={pageId} sectionId={sectionId} variant="light" />
            <E active={isSel('viz_label')} onSelect={() => onSel('viz_label')}>
              <p className="text-white/70 text-sm font-bold uppercase tracking-widest">{g('viz_label') || 'Vizyon'}</p>
            </E>
            <E active={isSel('viz_title')} onSelect={() => onSel('viz_title')}>
              <h5 className="text-white font-black text-sm">{g('viz_title') || 'Başlık'}</h5>
            </E>
            <E active={isSel('viz_text')} onSelect={() => onSel('viz_text')}>
              <p className="text-white/80 text-base leading-relaxed">{g('viz_text') || 'Metin...'}</p>
            </E>
          </div>
        </div>
        {/* Misyon */}
        <div className="bg-gray-900 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-amber-500/10 -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 space-y-1.5">
            <BizKimizIconPicker fieldId="mis_icon" g={g} pageId={pageId} sectionId={sectionId} variant="light" />
            <E active={isSel('mis_label')} onSelect={() => onSel('mis_label')}>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">{g('mis_label') || 'Misyon'}</p>
            </E>
            <E active={isSel('mis_title')} onSelect={() => onSel('mis_title')}>
              <h5 className="text-white font-black text-sm">{g('mis_title') || 'Başlık'}</h5>
            </E>
            <E active={isSel('mis_text')} onSelect={() => onSel('mis_text')}>
              <p className="text-gray-300 text-base leading-relaxed">{g('mis_text') || 'Metin...'}</p>
            </E>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── BASKANIN MESAJI PREVIEWS ──────────────────────────────────────────────────

function BMHeroPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden p-6 min-h-[180px]">
        {g('hero_img') && (
          <div className="absolute inset-0 opacity-30">
            <img src={g('hero_img')} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <div className="relative z-10 space-y-2">
          <E active={isSel('badge')} onSelect={() => onSel('badge')}>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-400 text-base font-bold uppercase tracking-widest">{g('badge') || 'Rozet'}</span>
            </div>
          </E>
          <E active={isSel('title')} onSelect={() => onSel('title')}>
            <h3 className="text-white font-black text-xl">{g('title') || 'Başlık...'}</h3>
          </E>
          <E active={isSel('subtitle')} onSelect={() => onSel('subtitle')}>
            <p className="text-gray-300 text-sm leading-relaxed">{g('subtitle') || 'Alt başlık...'}</p>
          </E>
        </div>
      </div>
      {/* Banner image selector */}
      <E active={isSel('hero_img')} onSelect={() => onSel('hero_img')}>
        <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-amber-400 transition-all cursor-pointer group">
          {g('hero_img') ? (
            <div className="relative">
              <img src={g('hero_img')} alt="" className="w-full h-28 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
                  <Camera className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-gray-700">Görseli Değiştir</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-28 bg-gray-50 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Camera className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-xs font-semibold text-gray-400">Banner Görseli Seçin</span>
            </div>
          )}
        </div>
      </E>
    </div>
  )
}

function BMPhotoPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gray-100 max-w-[200px]">
        <E active={isSel('photo_img')} onSelect={() => onSel('photo_img')}>
          <div className="relative group cursor-pointer">
            {g('photo_img') ? (
              <img src={g('photo_img')} alt="" className="w-full h-56 object-cover object-top" />
            ) : (
              <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
                <Camera className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-gray-700">Değiştir</span>
              </div>
            </div>
          </div>
        </E>
        <div className="bg-gradient-to-t from-gray-900 to-gray-900/80 px-4 py-3">
          <E active={isSel('photo_name')} onSelect={() => onSel('photo_name')}>
            <p className="text-white font-bold text-sm">{g('photo_name') || 'İsim'}</p>
          </E>
          <E active={isSel('photo_role')} onSelect={() => onSel('photo_role')}>
            <p className="text-amber-400 text-base font-semibold mt-0.5">{g('photo_role') || 'Ünvan'}</p>
          </E>
          <E active={isSel('photo_company')} onSelect={() => onSel('photo_company')}>
            <p className="text-gray-400 text-sm mt-1 pt-1 border-t border-white/10">{g('photo_company') || 'Şirket'}</p>
          </E>
        </div>
      </div>
    </div>
  )
}

function BMMessagePreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="space-y-3 bg-white rounded-2xl border border-gray-100 p-5">
      <Quote className="w-8 h-8 text-amber-500/30" strokeWidth={1.5} />
      <E active={isSel('greeting')} onSelect={() => onSel('greeting')}>
        <p className="text-sm font-black text-gray-900">{g('greeting') || 'Selamlama...'}</p>
      </E>
      <E active={isSel('msg_p1')} onSelect={() => onSel('msg_p1')}>
        <p className="text-base text-gray-600 leading-relaxed">{g('msg_p1') || 'Paragraf 1...'}</p>
      </E>
      <E active={isSel('msg_p2')} onSelect={() => onSel('msg_p2')}>
        <p className="text-base text-gray-600 leading-relaxed">{g('msg_p2') || 'Paragraf 2...'}</p>
      </E>
      <E active={isSel('quote')} onSelect={() => onSel('quote')}>
        <blockquote className="border-l-3 border-amber-500 pl-3 py-2 bg-amber-50/60 rounded-r-xl">
          <p className="text-base text-gray-700 font-semibold italic leading-relaxed">
            &ldquo;{g('quote') || 'Alıntı...'}&rdquo;
          </p>
        </blockquote>
      </E>
      <E active={isSel('closing')} onSelect={() => onSel('closing')}>
        <p className="text-base text-gray-500">{g('closing') || 'Kapanış...'}</p>
      </E>
    </div>
  )
}

function BMSignaturePreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="border-t border-gray-200 pt-4 space-y-1">
      <E active={isSel('sig_name')} onSelect={() => onSel('sig_name')}>
        <p className="font-black text-gray-900 text-sm">{g('sig_name') || 'İsim'}</p>
      </E>
      <E active={isSel('sig_role')} onSelect={() => onSel('sig_role')}>
        <p className="text-amber-500 font-semibold text-base">{g('sig_role') || 'Ünvan'}</p>
      </E>
    </div>
  )
}

function BMValuesPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-amber-500" />
        <div>
          <E active={isSel('val_title')} onSelect={() => onSel('val_title')}>
            <h4 className="font-black text-gray-900 text-sm">{g('val_title') || 'Başlık'}</h4>
          </E>
          <E active={isSel('val_desc')} onSelect={() => onSel('val_desc')}>
            <p className="text-gray-400 text-base">{g('val_desc') || 'Açıklama'}</p>
          </E>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[1,2,3,4,5,6].map(n => {
          const ValIcon = getTagIcon(g(`val${n}_icon`))
          return (
            <div key={n} className="flex items-start gap-2.5 bg-white border border-gray-100 rounded-xl p-3 hover:border-amber-200 transition-colors">
              <BizKimizIconPicker fieldId={`val${n}_icon`} g={g} pageId={pageId} sectionId={sectionId} />
              <div className="min-w-0">
                <E active={isSel(`val${n}`)} onSelect={() => onSel(`val${n}`)}>
                  <p className="text-gray-800 text-base font-bold leading-tight">{g(`val${n}`) || 'Başlık...'}</p>
                </E>
                <E active={isSel(`val${n}_desc`)} onSelect={() => onSel(`val${n}_desc`)}>
                  <p className="text-gray-400 text-sm leading-snug mt-0.5">{g(`val${n}_desc`) || 'Açıklama...'}</p>
                </E>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── SIRKET PROFILI PREVIEWS ────────────────────────────────────────────────────

function SPHeroPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden p-6 min-h-[200px]">
        {g('hero_img') && <div className="absolute inset-0 opacity-30"><img src={g('hero_img')} alt="" className="w-full h-full object-cover" /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <div className="relative z-10 space-y-2">
          <E active={isSel('badge')} onSelect={() => onSel('badge')}>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-400 text-base font-bold uppercase tracking-widest">{g('badge') || 'Rozet'}</span>
            </div>
          </E>
          <E active={isSel('title')} onSelect={() => onSel('title')}>
            <h3 className="text-white font-black text-xl">{g('title') || 'Başlık...'}</h3>
          </E>
          <E active={isSel('subtitle')} onSelect={() => onSel('subtitle')}>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">{g('subtitle') || 'Alt başlık...'}</p>
          </E>
          {/* Highlights strip */}
          <div className="grid grid-cols-4 gap-2 pt-4">
            {[1,2,3,4].map(n => {
              const HlIcon = getTagIcon(g(`hl${n}_icon`))
              return (
                <div key={n} className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BizKimizIconPicker fieldId={`hl${n}_icon`} g={g} pageId={pageId} sectionId={sectionId} variant="light" />
                  </div>
                  <E active={isSel(`hl${n}_val`)} onSelect={() => onSel(`hl${n}_val`)}>
                    <p className="text-white font-black text-sm">{g(`hl${n}_val`) || '—'}</p>
                  </E>
                  <E active={isSel(`hl${n}_lbl`)} onSelect={() => onSel(`hl${n}_lbl`)}>
                    <p className="text-gray-400 text-sm mt-0.5">{g(`hl${n}_lbl`) || 'Etiket'}</p>
                  </E>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <E active={isSel('hero_img')} onSelect={() => onSel('hero_img')}>
        <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-amber-400 transition-all cursor-pointer group">
          {g('hero_img') ? (
            <div className="relative">
              <img src={g('hero_img')} alt="" className="w-full h-28 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
                  <Camera className="w-4 h-4 text-amber-500" /><span className="text-xs font-bold text-gray-700">Görseli Değiştir</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-28 bg-gray-50 flex flex-col items-center justify-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" /><span className="text-xs font-semibold text-gray-400">Banner Görseli Seçin</span>
            </div>
          )}
        </div>
      </E>
    </div>
  )
}

function SPCompanyPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-amber-500" />
        <div>
          <E active={isSel('sec_title')} onSelect={() => onSel('sec_title')}>
            <h4 className="font-black text-gray-900 text-sm">{g('sec_title') || 'Başlık'}</h4>
          </E>
          <E active={isSel('sec_desc')} onSelect={() => onSel('sec_desc')}>
            <p className="text-gray-400 text-base">{g('sec_desc') || 'Açıklama'}</p>
          </E>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[1,2,3,4].map(n => (
          <div key={n} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
            <E active={isSel(`c${n}_label`)} onSelect={() => onSel(`c${n}_label`)}>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-0.5">{g(`c${n}_label`) || 'Etiket'}</p>
            </E>
            <E active={isSel(`c${n}_value`)} onSelect={() => onSel(`c${n}_value`)}>
              <p className="text-base font-bold text-gray-900 leading-snug">{g(`c${n}_value`) || 'Değer'}</p>
            </E>
          </div>
        ))}
      </div>
    </div>
  )
}

function SPAboutPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="space-y-3 bg-white rounded-2xl border border-gray-100 p-5">
      <E active={isSel('about_title')} onSelect={() => onSel('about_title')}>
        <h4 className="font-black text-gray-900 text-sm">{g('about_title') || 'Başlık'}</h4>
      </E>
      <E active={isSel('about_p1')} onSelect={() => onSel('about_p1')}>
        <p className="text-base text-gray-600 leading-relaxed">{g('about_p1') || 'Paragraf 1...'}</p>
      </E>
      <E active={isSel('about_p2')} onSelect={() => onSel('about_p2')}>
        <p className="text-base text-gray-600 leading-relaxed">{g('about_p2') || 'Paragraf 2...'}</p>
      </E>
      <E active={isSel('about_p3')} onSelect={() => onSel('about_p3')}>
        <p className="text-base text-gray-600 leading-relaxed">{g('about_p3') || 'Paragraf 3...'}</p>
      </E>
      <div className="space-y-1.5 pt-2">
        {[1,2,3,4].map(n => (
          <E key={n} active={isSel(`cert${n}`)} onSelect={() => onSel(`cert${n}`)}>
            <div className="flex items-center gap-2 text-base text-gray-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              {g(`cert${n}`) || 'Sertifika...'}
            </div>
          </E>
        ))}
      </div>
    </div>
  )
}

function SPContactPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="space-y-2">
      <E active={isSel('contact_title')} onSelect={() => onSel('contact_title')}>
        <h4 className="font-black text-gray-900 text-sm">{g('contact_title') || 'İletişim'}</h4>
      </E>
      {[1,2,3,4,5,6].map(n => (
        <div key={n} className="flex items-start gap-2.5 py-2 border-b border-gray-100 last:border-0">
          <E active={isSel(`ct${n}_label`)} onSelect={() => onSel(`ct${n}_label`)}>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider w-16 flex-shrink-0">{g(`ct${n}_label`) || 'Etiket'}</p>
          </E>
          <E active={isSel(`ct${n}_value`)} onSelect={() => onSel(`ct${n}_value`)}>
            <p className="text-base text-gray-700 font-medium leading-relaxed">{g(`ct${n}_value`) || 'Değer'}</p>
          </E>
        </div>
      ))}
    </div>
  )
}

function SPServicesPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-amber-500" />
        <div>
          <E active={isSel('srv_title')} onSelect={() => onSel('srv_title')}>
            <h4 className="font-black text-gray-900 text-sm">{g('srv_title') || 'Başlık'}</h4>
          </E>
          <E active={isSel('srv_desc')} onSelect={() => onSel('srv_desc')}>
            <p className="text-gray-400 text-base">{g('srv_desc') || 'Açıklama'}</p>
          </E>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[1,2,3,4,5,6].map(n => (
          <div key={n} className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl p-3 hover:border-amber-200 transition-colors">
            <BizKimizIconPicker fieldId={`srv${n}_icon`} g={g} pageId={pageId} sectionId={sectionId} />
            <E active={isSel(`srv${n}`)} onSelect={() => onSel(`srv${n}`)}>
              <p className="text-gray-700 text-base font-semibold leading-snug">{g(`srv${n}`) || 'Hizmet...'}</p>
            </E>
          </div>
        ))}
      </div>
    </div>
  )
}

function SPTimelinePreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-amber-500" />
        <div>
          <E active={isSel('tl_title')} onSelect={() => onSel('tl_title')}>
            <h4 className="font-black text-gray-900 text-sm">{g('tl_title') || 'Başlık'}</h4>
          </E>
          <E active={isSel('tl_desc')} onSelect={() => onSel('tl_desc')}>
            <p className="text-gray-400 text-base">{g('tl_desc') || 'Açıklama'}</p>
          </E>
        </div>
      </div>
      <div className="space-y-2 relative">
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-100" />
        {[1,2,3,4,5,6].map(n => (
          <div key={n} className="flex items-start gap-3 relative">
            <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-amber-500 bg-white flex items-center justify-center z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <E active={isSel(`tl${n}_year`)} onSelect={() => onSel(`tl${n}_year`)}>
                  <span className="text-sm font-black text-amber-500 bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5">{g(`tl${n}_year`) || '????'}</span>
                </E>
                <E active={isSel(`tl${n}_title`)} onSelect={() => onSel(`tl${n}_title`)}>
                  <p className="font-bold text-gray-900 text-base">{g(`tl${n}_title`) || 'Başlık...'}</p>
                </E>
              </div>
              <E active={isSel(`tl${n}_desc`)} onSelect={() => onSel(`tl${n}_desc`)}>
                <p className="text-gray-500 text-sm leading-relaxed">{g(`tl${n}_desc`) || 'Açıklama...'}</p>
              </E>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── ARAÇ FİLOSU PREVIEWS ──────────────────────────────────────────────────────

function AFHeroPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden p-6 min-h-[200px]">
        {g('hero_img') && <div className="absolute inset-0 opacity-30"><img src={g('hero_img')} alt="" className="w-full h-full object-cover" /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <div className="relative z-10 space-y-2">
          <E active={isSel('badge')} onSelect={() => onSel('badge')}>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-400 text-base font-bold uppercase tracking-widest">{g('badge') || 'Rozet'}</span>
            </div>
          </E>
          <E active={isSel('title')} onSelect={() => onSel('title')}>
            <h3 className="text-white font-black text-xl">{g('title') || 'Başlık...'}</h3>
          </E>
          <E active={isSel('subtitle')} onSelect={() => onSel('subtitle')}>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">{g('subtitle') || 'Alt başlık...'}</p>
          </E>
          <div className="grid grid-cols-4 gap-2 pt-4">
            {[1,2,3,4].map(n => (
              <div key={n} className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 backdrop-blur-sm">
                <BizKimizIconPicker fieldId={`st${n}_icon`} g={g} pageId={pageId} sectionId={sectionId} variant="light" />
                <E active={isSel(`st${n}_val`)} onSelect={() => onSel(`st${n}_val`)}>
                  <p className="text-white font-black text-sm mt-1">{g(`st${n}_val`) || '—'}</p>
                </E>
                <E active={isSel(`st${n}_lbl`)} onSelect={() => onSel(`st${n}_lbl`)}>
                  <p className="text-gray-400 text-sm mt-0.5">{g(`st${n}_lbl`) || 'Etiket'}</p>
                </E>
              </div>
            ))}
          </div>
        </div>
      </div>
      <E active={isSel('hero_img')} onSelect={() => onSel('hero_img')}>
        <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-amber-400 transition-all cursor-pointer group">
          {g('hero_img') ? (
            <div className="relative">
              <img src={g('hero_img')} alt="" className="w-full h-28 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
                  <Camera className="w-4 h-4 text-amber-500" /><span className="text-xs font-bold text-gray-700">Görseli Değiştir</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-28 bg-gray-50 flex flex-col items-center justify-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" /><span className="text-xs font-semibold text-gray-400">Banner Görseli Seçin</span>
            </div>
          )}
        </div>
      </E>
    </div>
  )
}

function AFGpsPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-amber-500" />
        <div>
          <E active={isSel('gps_title')} onSelect={() => onSel('gps_title')}>
            <h4 className="font-black text-gray-900 text-sm">{g('gps_title') || 'Başlık'}</h4>
          </E>
          <E active={isSel('gps_desc')} onSelect={() => onSel('gps_desc')}>
            <p className="text-gray-400 text-base">{g('gps_desc') || 'Açıklama'}</p>
          </E>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_140px] gap-3">
        <div className="space-y-2">
          {['gps_p1','gps_p2','gps_p3'].map(id => (
            <E key={id} active={isSel(id)} onSelect={() => onSel(id)}>
              <p className="text-base text-gray-600 leading-relaxed">{g(id) || 'Paragraf...'}</p>
            </E>
          ))}
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
          <E active={isSel('adv_title')} onSelect={() => onSel('adv_title')}>
            <p className="font-black text-gray-900 text-base mb-2">{g('adv_title') || 'Avantajlar'}</p>
          </E>
          <div className="space-y-1.5">
            {[1,2,3,4,5,6].map(n => (
              <E key={n} active={isSel(`adv${n}`)} onSelect={() => onSel(`adv${n}`)}>
                <div className="flex items-start gap-1.5 text-sm text-gray-600">
                  <CheckCircle2 className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-tight">{g(`adv${n}`) || 'Avantaj...'}</span>
                </div>
              </E>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AFVehiclesPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-amber-500" />
        <div>
          <E active={isSel('veh_title')} onSelect={() => onSel('veh_title')}>
            <h4 className="font-black text-gray-900 text-sm">{g('veh_title') || 'Başlık'}</h4>
          </E>
          <E active={isSel('veh_desc')} onSelect={() => onSel('veh_desc')}>
            <p className="text-gray-400 text-base">{g('veh_desc') || 'Açıklama'}</p>
          </E>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[1,2,3,4].map(n => (
          <div key={n} className="bg-white border border-gray-100 rounded-xl p-3 text-center">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mx-auto mb-2">
              <BusFront className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
            </div>
            <E active={isSel(`v${n}_label`)} onSelect={() => onSel(`v${n}_label`)}>
              <p className="font-black text-gray-900 text-base">{g(`v${n}_label`) || 'Tip'}</p>
            </E>
            <E active={isSel(`v${n}_count`)} onSelect={() => onSel(`v${n}_count`)}>
              <p className="text-amber-500 font-bold text-sm">{g(`v${n}_count`) || '0'} araç</p>
            </E>
            <E active={isSel(`v${n}_cap`)} onSelect={() => onSel(`v${n}_cap`)}>
              <p className="text-gray-400 text-sm mt-1 bg-gray-50 rounded px-1.5 py-0.5">{g(`v${n}_cap`) || 'Kapasite'}</p>
            </E>
            <E active={isSel(`v${n}_desc`)} onSelect={() => onSel(`v${n}_desc`)}>
              <p className="text-gray-400 text-sm mt-1 leading-tight">{g(`v${n}_desc`) || 'Açıklama...'}</p>
            </E>
          </div>
        ))}
      </div>
    </div>
  )
}

function AFFeaturesPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-amber-500" />
        <div>
          <E active={isSel('feat_title')} onSelect={() => onSel('feat_title')}>
            <h4 className="font-black text-gray-900 text-sm">{g('feat_title') || 'Başlık'}</h4>
          </E>
          <E active={isSel('feat_desc')} onSelect={() => onSel('feat_desc')}>
            <p className="text-gray-400 text-base">{g('feat_desc') || 'Açıklama'}</p>
          </E>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[1,2,3,4,5,6].map(n => (
          <div key={n} className="flex items-start gap-2.5 bg-white border border-gray-100 rounded-xl p-3 hover:border-amber-200 transition-colors">
            <BizKimizIconPicker fieldId={`f${n}_icon`} g={g} pageId={pageId} sectionId={sectionId} />
            <div className="min-w-0">
              <E active={isSel(`f${n}_title`)} onSelect={() => onSel(`f${n}_title`)}>
                <p className="text-gray-800 text-base font-bold leading-tight">{g(`f${n}_title`) || 'Başlık...'}</p>
              </E>
              <E active={isSel(`f${n}_desc`)} onSelect={() => onSel(`f${n}_desc`)}>
                <p className="text-gray-400 text-sm leading-snug mt-0.5">{g(`f${n}_desc`) || 'Açıklama...'}</p>
              </E>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AFCtaPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 flex items-center justify-between gap-4">
      <div>
        <E active={isSel('cta_title')} onSelect={() => onSel('cta_title')}>
          <p className="font-black text-white text-sm">{g('cta_title') || 'Başlık...'}</p>
        </E>
        <E active={isSel('cta_desc')} onSelect={() => onSel('cta_desc')}>
          <p className="text-amber-100 text-base">{g('cta_desc') || 'Açıklama...'}</p>
        </E>
      </div>
      <E active={isSel('cta_btn')} onSelect={() => onSel('cta_btn')}>
        <div className="bg-white text-amber-600 font-bold text-base px-3 py-1.5 rounded-lg shadow">
          {g('cta_btn') || 'Buton'}
        </div>
      </E>
    </div>
  )
}

// ── İNSAN KAYNAKLARI PREVIEWS ─────────────────────────────────────────────────

function IKHeroPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden p-6 min-h-[200px]">
        {g('hero_img') && <div className="absolute inset-0 opacity-30"><img src={g('hero_img')} alt="" className="w-full h-full object-cover" /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <div className="relative z-10 space-y-2">
          <E active={isSel('badge')} onSelect={() => onSel('badge')}>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-400 text-base font-bold uppercase tracking-widest">{g('badge') || 'Rozet'}</span>
            </div>
          </E>
          <E active={isSel('title')} onSelect={() => onSel('title')}>
            <h3 className="text-white font-black text-xl">{g('title') || 'Başlık...'}</h3>
          </E>
          <E active={isSel('subtitle')} onSelect={() => onSel('subtitle')}>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">{g('subtitle') || 'Alt başlık...'}</p>
          </E>
          <div className="grid grid-cols-4 gap-2 pt-4">
            {[1,2,3,4].map(n => (
              <div key={n} className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 backdrop-blur-sm">
                <BizKimizIconPicker fieldId={`tag${n}_icon`} g={g} pageId={pageId} sectionId={sectionId} variant="light" />
                <E active={isSel(`tag${n}`)} onSelect={() => onSel(`tag${n}`)}>
                  <p className="text-white font-bold text-base mt-1">{g(`tag${n}`) || 'Etiket'}</p>
                </E>
              </div>
            ))}
          </div>
        </div>
      </div>
      <E active={isSel('hero_img')} onSelect={() => onSel('hero_img')}>
        <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-amber-400 transition-all cursor-pointer group">
          {g('hero_img') ? (
            <div className="relative">
              <img src={g('hero_img')} alt="" className="w-full h-28 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
                  <Camera className="w-4 h-4 text-amber-500" /><span className="text-xs font-bold text-gray-700">Görseli Değiştir</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-28 bg-gray-50 flex flex-col items-center justify-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" /><span className="text-xs font-semibold text-gray-400">Banner Görseli Seçin</span>
            </div>
          )}
        </div>
      </E>
    </div>
  )
}

function IKVisionPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-amber-500" />
        <div>
          <E active={isSel('vis_title')} onSelect={() => onSel('vis_title')}>
            <h4 className="font-black text-gray-900 text-sm">{g('vis_title') || 'Başlık'}</h4>
          </E>
          <E active={isSel('vis_desc')} onSelect={() => onSel('vis_desc')}>
            <p className="text-gray-400 text-base">{g('vis_desc') || 'Açıklama'}</p>
          </E>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_140px] gap-3">
        <div className="space-y-2">
          {['vis_p1','vis_p2','vis_p3'].map(id => (
            <E key={id} active={isSel(id)} onSelect={() => onSel(id)}>
              <p className="text-base text-gray-600 leading-relaxed">{g(id) || 'Paragraf...'}</p>
            </E>
          ))}
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
          <E active={isSel('why_title')} onSelect={() => onSel('why_title')}>
            <p className="font-black text-gray-900 text-base mb-2">{g('why_title') || 'Neden?'}</p>
          </E>
          <div className="space-y-1.5">
            {[1,2,3,4,5].map(n => (
              <E key={n} active={isSel(`why${n}`)} onSelect={() => onSel(`why${n}`)}>
                <div className="flex items-start gap-1.5 text-sm text-gray-600">
                  <CheckCircle2 className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-tight">{g(`why${n}`) || 'Neden...'}</span>
                </div>
              </E>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function IKValuesPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-amber-500" />
        <div>
          <E active={isSel('val_title')} onSelect={() => onSel('val_title')}>
            <h4 className="font-black text-gray-900 text-sm">{g('val_title') || 'Başlık'}</h4>
          </E>
          <E active={isSel('val_desc')} onSelect={() => onSel('val_desc')}>
            <p className="text-gray-400 text-base">{g('val_desc') || 'Açıklama'}</p>
          </E>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[1,2,3,4,5,6].map(n => (
          <div key={n} className="flex items-start gap-2.5 bg-white border border-gray-100 rounded-xl p-3 hover:border-amber-200 transition-colors">
            <BizKimizIconPicker fieldId={`v${n}_icon`} g={g} pageId={pageId} sectionId={sectionId} />
            <div className="min-w-0">
              <E active={isSel(`v${n}_title`)} onSelect={() => onSel(`v${n}_title`)}>
                <p className="text-gray-800 text-base font-bold leading-tight">{g(`v${n}_title`) || 'Başlık...'}</p>
              </E>
              <E active={isSel(`v${n}_desc`)} onSelect={() => onSel(`v${n}_desc`)}>
                <p className="text-gray-400 text-sm leading-snug mt-0.5">{g(`v${n}_desc`) || 'Açıklama...'}</p>
              </E>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function IKHiringPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-amber-500" />
        <div>
          <E active={isSel('hire_title')} onSelect={() => onSel('hire_title')}>
            <h4 className="font-black text-gray-900 text-sm">{g('hire_title') || 'Başlık'}</h4>
          </E>
          <E active={isSel('hire_desc')} onSelect={() => onSel('hire_desc')}>
            <p className="text-gray-400 text-base">{g('hire_desc') || 'Açıklama'}</p>
          </E>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[1,2,3,4].map(n => (
          <div key={n} className="relative bg-white border border-gray-100 rounded-xl p-3">
            <span className="absolute top-2 right-2 text-2xl font-black text-gray-100 select-none">0{n}</span>
            <BizKimizIconPicker fieldId={`h${n}_icon`} g={g} pageId={pageId} sectionId={sectionId} />
            <E active={isSel(`h${n}_title`)} onSelect={() => onSel(`h${n}_title`)}>
              <p className="font-bold text-gray-900 text-base mt-2">{g(`h${n}_title`) || 'Adım...'}</p>
            </E>
            <E active={isSel(`h${n}_desc`)} onSelect={() => onSel(`h${n}_desc`)}>
              <p className="text-gray-400 text-sm leading-snug mt-1">{g(`h${n}_desc`) || 'Açıklama...'}</p>
            </E>
          </div>
        ))}
      </div>
    </div>
  )
}

function IKCtaPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 flex items-center justify-between gap-4">
      <div>
        <E active={isSel('cta_title')} onSelect={() => onSel('cta_title')}>
          <p className="font-black text-white text-sm">{g('cta_title') || 'Başlık...'}</p>
        </E>
        <E active={isSel('cta_desc')} onSelect={() => onSel('cta_desc')}>
          <p className="text-amber-100 text-base">{g('cta_desc') || 'Açıklama...'}</p>
        </E>
      </div>
      <E active={isSel('cta_btn')} onSelect={() => onSel('cta_btn')}>
        <div className="bg-white text-amber-600 font-bold text-base px-3 py-1.5 rounded-lg shadow">
          {g('cta_btn') || 'Buton'}
        </div>
      </E>
    </div>
  )
}

// ── KALİTE POLİTİKASI PREVIEWS ───────────────────────────────────────────────

function KPHeroPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="space-y-3">
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden p-6 min-h-[180px]">
        {g('hero_img') && <div className="absolute inset-0 opacity-30"><img src={g('hero_img')} alt="" className="w-full h-full object-cover" /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <div className="relative z-10 space-y-2">
          <E active={isSel('badge')} onSelect={() => onSel('badge')}>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-400 text-base font-bold uppercase tracking-widest">{g('badge') || 'Rozet'}</span>
            </div>
          </E>
          <E active={isSel('title')} onSelect={() => onSel('title')}>
            <h3 className="text-white font-black text-xl">{g('title') || 'Başlık...'}</h3>
          </E>
          <E active={isSel('subtitle')} onSelect={() => onSel('subtitle')}>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">{g('subtitle') || 'Alt başlık...'}</p>
          </E>
        </div>
      </div>
      <E active={isSel('hero_img')} onSelect={() => onSel('hero_img')}>
        <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-amber-400 transition-all cursor-pointer group">
          {g('hero_img') ? (
            <div className="relative">
              <img src={g('hero_img')} alt="" className="w-full h-28 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
                  <Camera className="w-4 h-4 text-amber-500" /><span className="text-xs font-bold text-gray-700">Görseli Değiştir</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-28 bg-gray-50 flex flex-col items-center justify-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" /><span className="text-xs font-semibold text-gray-400">Banner Görseli Seçin</span>
            </div>
          )}
        </div>
      </E>
    </div>
  )
}

function KPPolicyPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-amber-500" />
        <div>
          <E active={isSel('pol_title')} onSelect={() => onSel('pol_title')}>
            <h4 className="font-black text-gray-900 text-sm">{g('pol_title') || 'Başlık'}</h4>
          </E>
          <E active={isSel('pol_desc')} onSelect={() => onSel('pol_desc')}>
            <p className="text-gray-400 text-base">{g('pol_desc') || 'Açıklama'}</p>
          </E>
        </div>
      </div>
      <E active={isSel('pol_intro')} onSelect={() => onSel('pol_intro')}>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <p className="text-sm text-amber-800 leading-relaxed">{g('pol_intro') || 'Giriş metni...'}</p>
        </div>
      </E>
      <div className="grid grid-cols-2 gap-1.5">
        {Array.from({length: 17}, (_, i) => i + 1).map(n => (
          <div key={n} className="flex items-start gap-2 bg-white border border-gray-100 rounded-lg p-2 hover:border-amber-200 transition-colors">
            <BizKimizIconPicker fieldId={`p${n}_icon`} g={g} pageId={pageId} sectionId={sectionId} />
            <E active={isSel(`p${n}`)} onSelect={() => onSel(`p${n}`)}>
              <p className="text-sm text-gray-600 leading-snug">{g(`p${n}`) || `Madde ${n}...`}</p>
            </E>
          </div>
        ))}
      </div>
    </div>
  )
}

function KPCertsPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  const { getField, updateField } = useAdmin()
  const [uploading, setUploading] = useState<string | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const certColors = ['from-blue-600 to-blue-500','from-red-600 to-red-500','from-green-600 to-green-500','from-amber-600 to-amber-500','from-indigo-600 to-indigo-500','from-rose-600 to-rose-500','from-teal-600 to-teal-500','from-purple-600 to-purple-500','from-cyan-600 to-cyan-500','from-pink-600 to-pink-500']

  // Dynamically count certs
  const certs: { n: number; title: string }[] = []
  for (let i = 1; i <= 20; i++) {
    const title = g(`c${i}_title`)
    if (!title && i > 6) break
    if (title) certs.push({ n: i, title })
  }

  // Get all field values for a cert index
  function getCertFields(n: number) {
    return {
      title: getField(pageId, sectionId, `c${n}_title`),
      sub: getField(pageId, sectionId, `c${n}_sub`),
      issuer: getField(pageId, sectionId, `c${n}_issuer`),
      scope: getField(pageId, sectionId, `c${n}_scope`),
      img: getField(pageId, sectionId, `c${n}_img`),
    }
  }

  // Set all fields for a cert at position n
  async function setCertAt(n: number, data: { title: { tr: string; en: string }; sub: { tr: string; en: string }; issuer: { tr: string; en: string }; scope: { tr: string; en: string }; img: { tr: string; en: string } }) {
    const fields = [
      { page_id: pageId, section_id: sectionId, field_id: `c${n}_title`, tr: data.title.tr, en: data.title.en },
      { page_id: pageId, section_id: sectionId, field_id: `c${n}_sub`, tr: data.sub.tr, en: data.sub.en },
      { page_id: pageId, section_id: sectionId, field_id: `c${n}_issuer`, tr: data.issuer.tr, en: data.issuer.en },
      { page_id: pageId, section_id: sectionId, field_id: `c${n}_scope`, tr: data.scope.tr, en: data.scope.en },
      { page_id: pageId, section_id: sectionId, field_id: `c${n}_img`, tr: data.img.tr, en: data.img.en },
    ]
    for (const f of fields) {
      updateField(pageId, sectionId, f.field_id, f.tr, f.en)
    }
    return fields
  }

  async function handleAddCert() {
    const n = certs.length + 1
    const allFields = await setCertAt(n, {
      title: { tr: 'Yeni Sertifika', en: 'New Certificate' },
      sub: { tr: 'Alt Başlık', en: 'Subtitle' },
      issuer: { tr: 'Kurum Adı', en: 'Organization' },
      scope: { tr: 'Kapsam', en: 'Scope' },
      img: { tr: '', en: '' },
    })
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: allFields }),
    })
  }

  async function handleDeleteCert(idx: number) {
    const total = certs.length
    const allFields: any[] = []
    // Shift subsequent certs up
    for (let i = idx; i < total - 1; i++) {
      const nextData = getCertFields(i + 2)
      const fields = await setCertAt(i + 1, nextData)
      allFields.push(...fields)
    }
    // Clear last cert
    const clearFields = await setCertAt(total, {
      title: { tr: '', en: '' }, sub: { tr: '', en: '' },
      issuer: { tr: '', en: '' }, scope: { tr: '', en: '' }, img: { tr: '', en: '' },
    })
    allFields.push(...clearFields)
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: allFields }),
    })
  }

  async function handleReorder(fromIdx: number, toIdx: number) {
    if (fromIdx === toIdx) return
    const items = certs.map((_, i) => getCertFields(i + 1))
    const [moved] = items.splice(fromIdx, 1)
    items.splice(toIdx, 0, moved)
    const allFields: any[] = []
    for (let i = 0; i < items.length; i++) {
      const fields = await setCertAt(i + 1, items[i])
      allFields.push(...fields)
    }
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: allFields }),
    })
  }

  async function handleImageUpload(certIdx: number, file: File) {
    const n = certIdx + 1
    const fieldId = `c${n}_img`
    setUploading(fieldId)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'certificates')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        updateField(pageId, sectionId, fieldId, data.url, '')
        await fetch('/api/admin/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: [
            { page_id: pageId, section_id: sectionId, field_id: fieldId, tr: data.url, en: '' },
          ] }),
        })
      }
    } catch {}
    setUploading(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-amber-500" />
        <div className="flex-1">
          <E active={isSel('cert_title')} onSelect={() => onSel('cert_title')}>
            <h4 className="font-black text-gray-900 text-sm">{g('cert_title') || 'Başlık'}</h4>
          </E>
          <E active={isSel('cert_desc')} onSelect={() => onSel('cert_desc')}>
            <p className="text-gray-400 text-base">{g('cert_desc') || 'Açıklama'}</p>
          </E>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-base font-semibold uppercase tracking-widest">Sertifikalar ({certs.length})</p>
        <button
          onClick={handleAddCert}
          className="flex items-center gap-1.5 text-amber-600 hover:text-amber-500 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg text-base font-bold transition-all"
        >
          <Plus className="w-3 h-3" /> Sertifika Ekle
        </button>
      </div>

      {/* Cert grid */}
      <div className="grid grid-cols-3 gap-2">
        {certs.map((cert, i) => {
          const n = i + 1
          const isDragOver = dragOverIdx === i && dragIdx !== i
          return (
            <div
              key={`cert-${n}`}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={e => { e.preventDefault(); setDragOverIdx(i) }}
              onDragLeave={() => setDragOverIdx(null)}
              onDrop={e => { e.preventDefault(); if (dragIdx !== null) handleReorder(dragIdx, i); setDragIdx(null); setDragOverIdx(null) }}
              onDragEnd={() => { setDragIdx(null); setDragOverIdx(null) }}
              className={`bg-white border rounded-xl overflow-hidden transition-all relative group/cert ${
                isDragOver ? 'border-amber-400 ring-2 ring-amber-200 scale-105' : 'border-gray-100 hover:border-amber-200'
              } ${dragIdx === i ? 'opacity-50' : ''}`}
            >
              {/* Drag handle + delete */}
              <div className="absolute top-1 right-1 z-10 flex gap-0.5 opacity-0 group-hover/cert:opacity-100 transition-opacity">
                <button
                  onClick={() => i > 0 && handleReorder(i, i - 1)}
                  className="w-5 h-5 rounded bg-white/90 shadow flex items-center justify-center hover:bg-amber-50 transition-colors"
                  title="Yukarı"
                >
                  <ChevronUp className="w-3 h-3 text-gray-500" />
                </button>
                <button
                  onClick={() => i < certs.length - 1 && handleReorder(i, i + 1)}
                  className="w-5 h-5 rounded bg-white/90 shadow flex items-center justify-center hover:bg-amber-50 transition-colors"
                  title="Aşağı"
                >
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>
                <button
                  onClick={() => { if (confirm('Bu sertifikayı silmek istediğinize emin misiniz?')) handleDeleteCert(i) }}
                  className="w-5 h-5 rounded bg-white/90 shadow flex items-center justify-center hover:bg-red-50 transition-colors"
                  title="Sil"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>

              {/* Image */}
              <div
                className="h-20 bg-gray-50 flex items-center justify-center relative cursor-pointer"
                onClick={() => fileRefs.current[`cert-${n}`]?.click()}
              >
                {uploading === `c${n}_img` ? (
                  <div className="animate-spin w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full" />
                ) : g(`c${n}_img`) ? (
                  <>
                    <img src={g(`c${n}_img`)} alt="" className="h-full w-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-3 h-3 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Camera className="w-4 h-4 text-gray-300" />
                    <span className="text-sm text-gray-300">Görsel Ekle</span>
                  </div>
                )}
                <input
                  ref={el => { fileRefs.current[`cert-${n}`] = el }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleImageUpload(i, e.target.files[0]); e.target.value = '' }}
                />
              </div>

              {/* Info */}
              <div className="p-2">
                <E active={isSel(`c${n}_title`)} onSelect={() => onSel(`c${n}_title`)}>
                  <div className={`inline-flex bg-gradient-to-r ${certColors[(n-1) % certColors.length]} rounded px-1.5 py-0.5 mb-1`}>
                    <span className="text-white text-sm font-black">{g(`c${n}_title`) || 'ISO'}</span>
                  </div>
                </E>
                <E active={isSel(`c${n}_sub`)} onSelect={() => onSel(`c${n}_sub`)}>
                  <p className="text-sm font-bold text-gray-900">{g(`c${n}_sub`) || 'Alt başlık'}</p>
                </E>
                <E active={isSel(`c${n}_issuer`)} onSelect={() => onSel(`c${n}_issuer`)}>
                  <p className="text-sm text-amber-600 font-semibold">{g(`c${n}_issuer`) || 'Kurum'}</p>
                </E>
                <E active={isSel(`c${n}_scope`)} onSelect={() => onSel(`c${n}_scope`)}>
                  <p className="text-sm text-gray-400 mt-0.5">{g(`c${n}_scope`) || 'Kapsam'}</p>
                </E>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── ÇEVRE & SU POLİTİKALARI PREVIEWS ─────────────────────────────────────────

function CSPHeroPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden p-6 min-h-[180px]">
        {g('hero_img') && <div className="absolute inset-0 opacity-30"><img src={g('hero_img')} alt="" className="w-full h-full object-cover" /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <div className="relative z-10 space-y-2">
          <E active={isSel('badge')} onSelect={() => onSel('badge')}>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-400 text-base font-bold uppercase tracking-widest">{g('badge') || 'Rozet'}</span>
            </div>
          </E>
          <E active={isSel('title')} onSelect={() => onSel('title')}>
            <h3 className="text-white font-black text-xl">{g('title') || 'Başlık...'}</h3>
          </E>
          <E active={isSel('subtitle')} onSelect={() => onSel('subtitle')}>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">{g('subtitle') || 'Alt başlık...'}</p>
          </E>
          {/* Tags */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[1,2,3,4].map(n => (
              <div key={n} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
                <BizKimizIconPicker fieldId={`tag${n}_icon`} g={g} pageId={pageId} sectionId={sectionId} variant="light" />
                <E active={isSel(`tag${n}`)} onSelect={() => onSel(`tag${n}`)}>
                  <span className="text-white text-sm font-bold">{g(`tag${n}`) || `Etiket ${n}`}</span>
                </E>
              </div>
            ))}
          </div>
        </div>
      </div>
      <E active={isSel('hero_img')} onSelect={() => onSel('hero_img')}>
        <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-amber-400 transition-all cursor-pointer group">
          {g('hero_img') ? (
            <div className="relative">
              <img src={g('hero_img')} alt="" className="w-full h-28 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
                  <Camera className="w-4 h-4 text-amber-500" /><span className="text-xs font-bold text-gray-700">Görseli Değiştir</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-28 bg-gray-50 flex flex-col items-center justify-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" /><span className="text-xs font-semibold text-gray-400">Banner Görseli Seçin</span>
            </div>
          )}
        </div>
      </E>
    </div>
  )
}

function CSPPillarsPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {[1,2,3,4].map(n => (
        <div key={n} className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2">
          <BizKimizIconPicker fieldId={`pl${n}_icon`} g={g} pageId={pageId} sectionId={sectionId} />
          <E active={isSel(`pl${n}_title`)} onSelect={() => onSel(`pl${n}_title`)}>
            <p className="font-black text-gray-900 text-base">{g(`pl${n}_title`) || `Sütun ${n}`}</p>
          </E>
          <E active={isSel(`pl${n}_desc`)} onSelect={() => onSel(`pl${n}_desc`)}>
            <p className="text-sm text-gray-500 leading-snug">{g(`pl${n}_desc`) || 'Açıklama...'}</p>
          </E>
        </div>
      ))}
    </div>
  )
}

function CSPPolicyPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  const categoryColors: Record<string, string> = {
    'Genel': 'bg-gray-100 text-gray-600', 'Su': 'bg-blue-100 text-blue-700',
    'Hava': 'bg-sky-100 text-sky-700', 'Çevre': 'bg-green-100 text-green-700',
    'Kimyasal': 'bg-purple-100 text-purple-700', 'Uyum': 'bg-indigo-100 text-indigo-700',
    'Enerji': 'bg-amber-100 text-amber-700', 'Atık': 'bg-emerald-100 text-emerald-700',
    'Farkındalık': 'bg-rose-100 text-rose-700', 'Yatırım': 'bg-teal-100 text-teal-700',
    'General': 'bg-gray-100 text-gray-600', 'Water': 'bg-blue-100 text-blue-700',
    'Air': 'bg-sky-100 text-sky-700', 'Environment': 'bg-green-100 text-green-700',
    'Chemical': 'bg-purple-100 text-purple-700', 'Compliance': 'bg-indigo-100 text-indigo-700',
    'Energy': 'bg-amber-100 text-amber-700', 'Waste': 'bg-emerald-100 text-emerald-700',
    'Awareness': 'bg-rose-100 text-rose-700', 'Investment': 'bg-teal-100 text-teal-700',
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-amber-500" />
        <div>
          <E active={isSel('pol_title')} onSelect={() => onSel('pol_title')}>
            <h4 className="font-black text-gray-900 text-sm">{g('pol_title') || 'Başlık'}</h4>
          </E>
          <E active={isSel('pol_desc')} onSelect={() => onSel('pol_desc')}>
            <p className="text-gray-400 text-base">{g('pol_desc') || 'Açıklama'}</p>
          </E>
        </div>
      </div>
      <E active={isSel('pol_intro')} onSelect={() => onSel('pol_intro')}>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <p className="text-sm text-amber-800 leading-relaxed">{g('pol_intro') || 'Giriş metni...'}</p>
        </div>
      </E>
      <div className="grid grid-cols-2 gap-1.5">
        {Array.from({length: 15}, (_, i) => i + 1).map(n => {
          const cat = g(`e${n}_cat`) || ''
          const catColor = categoryColors[cat] || 'bg-gray-100 text-gray-600'
          return (
            <div key={n} className="flex items-start gap-2 bg-white border border-gray-100 rounded-lg p-2 hover:border-amber-200 transition-colors">
              <BizKimizIconPicker fieldId={`e${n}_icon`} g={g} pageId={pageId} sectionId={sectionId} />
              <div className="flex-1 min-w-0">
                <E active={isSel(`e${n}_cat`)} onSelect={() => onSel(`e${n}_cat`)}>
                  <span className={`inline-block text-sm font-bold uppercase tracking-wider rounded px-1.5 py-0.5 mb-0.5 ${catColor}`}>
                    {cat || 'Kategori'}
                  </span>
                </E>
                <E active={isSel(`e${n}`)} onSelect={() => onSel(`e${n}`)}>
                  <p className="text-sm text-gray-600 leading-snug">{g(`e${n}`) || `Madde ${n}...`}</p>
                </E>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── İŞ SAĞLIĞI VE GÜVENLİĞİ PREVIEWS ────────────────────────────────────────

function ISGHeroPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden p-6 min-h-[180px]">
        {g('hero_img') && <div className="absolute inset-0 opacity-30"><img src={g('hero_img')} alt="" className="w-full h-full object-cover" /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <div className="relative z-10 space-y-2">
          <E active={isSel('badge')} onSelect={() => onSel('badge')}>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-400 text-base font-bold uppercase tracking-widest">{g('badge') || 'Rozet'}</span>
            </div>
          </E>
          <E active={isSel('title')} onSelect={() => onSel('title')}>
            <h3 className="text-white font-black text-xl">{g('title') || 'Başlık...'}</h3>
          </E>
          <E active={isSel('subtitle')} onSelect={() => onSel('subtitle')}>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">{g('subtitle') || 'Alt başlık...'}</p>
          </E>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[1,2,3,4].map(n => (
              <div key={n} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <BizKimizIconPicker fieldId={`kpi${n}_icon`} g={g} pageId={pageId} sectionId={sectionId} variant="light" />
                  <E active={isSel(`kpi${n}_val`)} onSelect={() => onSel(`kpi${n}_val`)}>
                    <span className="text-white text-sm font-black">{g(`kpi${n}_val`) || '—'}</span>
                  </E>
                </div>
                <E active={isSel(`kpi${n}`)} onSelect={() => onSel(`kpi${n}`)}>
                  <span className="text-gray-400 text-sm">{g(`kpi${n}`) || `KPI ${n}`}</span>
                </E>
              </div>
            ))}
          </div>
        </div>
      </div>
      <E active={isSel('hero_img')} onSelect={() => onSel('hero_img')}>
        <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-amber-400 transition-all cursor-pointer group">
          {g('hero_img') ? (
            <div className="relative">
              <img src={g('hero_img')} alt="" className="w-full h-28 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
                  <Camera className="w-4 h-4 text-amber-500" /><span className="text-xs font-bold text-gray-700">Görseli Değiştir</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-28 bg-gray-50 flex flex-col items-center justify-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" /><span className="text-xs font-semibold text-gray-400">Banner Görseli Seçin</span>
            </div>
          )}
        </div>
      </E>
    </div>
  )
}

function ISGPolicyPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="grid grid-cols-[1fr_140px] gap-3">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 rounded-full bg-amber-500" />
          <div>
            <E active={isSel('pol_title')} onSelect={() => onSel('pol_title')}>
              <h4 className="font-black text-gray-900 text-sm">{g('pol_title') || 'Başlık'}</h4>
            </E>
            <E active={isSel('pol_desc')} onSelect={() => onSel('pol_desc')}>
              <p className="text-gray-400 text-base">{g('pol_desc') || 'Açıklama'}</p>
            </E>
          </div>
        </div>
        <E active={isSel('pol_p1')} onSelect={() => onSel('pol_p1')}>
          <p className="text-sm text-gray-600 leading-relaxed">{g('pol_p1') || 'Politika metni...'}</p>
        </E>
        <E active={isSel('pol_quote')} onSelect={() => onSel('pol_quote')}>
          <blockquote className="border-l-2 border-amber-500 pl-3 py-1 bg-amber-50/60 rounded-r-lg">
            <p className="text-sm text-gray-700 italic leading-relaxed">"{g('pol_quote') || 'Alıntı...'}"</p>
          </blockquote>
        </E>
      </div>
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2">
        <E active={isSel('iso_title')} onSelect={() => onSel('iso_title')}>
          <p className="font-black text-gray-900 text-sm">{g('iso_title') || 'ISO Başlık'}</p>
        </E>
        <E active={isSel('iso_desc')} onSelect={() => onSel('iso_desc')}>
          <p className="text-sm text-gray-500 leading-snug">{g('iso_desc') || 'ISO açıklama...'}</p>
        </E>
        {[1,2,3,4].map(n => (
          <E key={n} active={isSel(`iso${n}`)} onSelect={() => onSel(`iso${n}`)}>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <CheckCircle className="w-2.5 h-2.5 text-amber-500 flex-shrink-0" />
              {g(`iso${n}`) || `Madde ${n}`}
            </p>
          </E>
        ))}
      </div>
    </div>
  )
}

function ISGGoalsPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-amber-500" />
        <div>
          <E active={isSel('goal_title')} onSelect={() => onSel('goal_title')}>
            <h4 className="font-black text-gray-900 text-sm">{g('goal_title') || 'Başlık'}</h4>
          </E>
          <E active={isSel('goal_desc')} onSelect={() => onSel('goal_desc')}>
            <p className="text-gray-400 text-base">{g('goal_desc') || 'Açıklama'}</p>
          </E>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[1,2,3,4].map(n => (
          <div key={n} className="bg-white border border-gray-100 rounded-xl p-3 hover:border-amber-200 transition-colors">
            <BizKimizIconPicker fieldId={`g${n}_icon`} g={g} pageId={pageId} sectionId={sectionId} />
            <E active={isSel(`g${n}_title`)} onSelect={() => onSel(`g${n}_title`)}>
              <p className="font-bold text-gray-900 text-sm mt-1.5">{g(`g${n}_title`) || `Hedef ${n}`}</p>
            </E>
            <E active={isSel(`g${n}_desc`)} onSelect={() => onSel(`g${n}_desc`)}>
              <p className="text-sm text-gray-500 leading-snug mt-0.5">{g(`g${n}_desc`) || 'Açıklama...'}</p>
            </E>
          </div>
        ))}
      </div>
    </div>
  )
}

function ISGPrinciplesPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-amber-500" />
        <div>
          <E active={isSel('pr_title')} onSelect={() => onSel('pr_title')}>
            <h4 className="font-black text-gray-900 text-sm">{g('pr_title') || 'Başlık'}</h4>
          </E>
          <E active={isSel('pr_desc')} onSelect={() => onSel('pr_desc')}>
            <p className="text-gray-400 text-base">{g('pr_desc') || 'Açıklama'}</p>
          </E>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1,2,3,4,5,6].map(n => (
          <div key={n} className="bg-white border border-gray-100 rounded-xl p-2.5 hover:border-amber-200 transition-colors">
            <BizKimizIconPicker fieldId={`pr${n}_icon`} g={g} pageId={pageId} sectionId={sectionId} />
            <E active={isSel(`pr${n}_title`)} onSelect={() => onSel(`pr${n}_title`)}>
              <p className="font-bold text-gray-900 text-sm mt-1">{g(`pr${n}_title`) || `İlke ${n}`}</p>
            </E>
            <E active={isSel(`pr${n}_desc`)} onSelect={() => onSel(`pr${n}_desc`)}>
              <p className="text-sm text-gray-400 leading-snug mt-0.5">{g(`pr${n}_desc`) || 'Açıklama...'}</p>
            </E>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── KVKK PREVIEWS ─────────────────────────────────────────────────────────────

function KVKKHeroPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="space-y-3">
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden p-6 min-h-[160px]">
        {g('hero_img') && <div className="absolute inset-0 opacity-30"><img src={g('hero_img')} alt="" className="w-full h-full object-cover" /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <div className="relative z-10 space-y-2">
          <E active={isSel('badge')} onSelect={() => onSel('badge')}>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-400 text-base font-bold uppercase tracking-widest">{g('badge') || 'Rozet'}</span>
            </div>
          </E>
          <E active={isSel('title')} onSelect={() => onSel('title')}>
            <h3 className="text-white font-black text-xl">{g('title') || 'Başlık...'}</h3>
          </E>
          <E active={isSel('subtitle')} onSelect={() => onSel('subtitle')}>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">{g('subtitle') || 'Alt başlık...'}</p>
          </E>
        </div>
      </div>
      <E active={isSel('hero_img')} onSelect={() => onSel('hero_img')}>
        <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-amber-400 transition-all cursor-pointer group">
          {g('hero_img') ? (
            <div className="relative">
              <img src={g('hero_img')} alt="" className="w-full h-28 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
                  <Camera className="w-4 h-4 text-amber-500" /><span className="text-xs font-bold text-gray-700">Görseli Değiştir</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-28 bg-gray-50 flex flex-col items-center justify-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" /><span className="text-xs font-semibold text-gray-400">Banner Görseli Seçin</span>
            </div>
          )}
        </div>
      </E>
    </div>
  )
}

function KVKKIntroPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <E active={isSel('intro_text')} onSelect={() => onSel('intro_text')}>
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <p className="text-base text-gray-700 leading-relaxed">{g('intro_text') || 'Giriş metni...'}</p>
      </div>
    </E>
  )
}

function KVKKArticlesPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  const iconNames = ['FileText','Database','Users','RefreshCw','Lock','Send','FileText','RefreshCw','Database','Shield','Eye']
  return (
    <div className="space-y-2">
      {Array.from({length: 11}, (_, i) => i + 1).map(n => (
        <div key={n} className="bg-white border border-gray-100 rounded-xl p-3 hover:border-amber-200 transition-colors">
          <div className="flex items-start gap-2 mb-1.5">
            <span className="flex-shrink-0 w-7 h-7 rounded-md bg-amber-50 flex items-center justify-center text-sm font-black text-amber-600">{n}</span>
            <E active={isSel(`a${n}_title`)} onSelect={() => onSel(`a${n}_title`)}>
              <p className="font-black text-gray-900 text-lg">{g(`a${n}_title`) || `Madde ${n}`}</p>
            </E>
          </div>
          <E active={isSel(`a${n}_text`)} onSelect={() => onSel(`a${n}_text`)}>
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{g(`a${n}_text`) || 'İçerik...'}</p>
          </E>
        </div>
      ))}
    </div>
  )
}

function KVKKContactPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
      <E active={isSel('ct_title')} onSelect={() => onSel('ct_title')}>
        <h4 className="font-black text-gray-900 text-xl">{g('ct_title') || 'Başlık'}</h4>
      </E>
      <E active={isSel('ct_desc')} onSelect={() => onSel('ct_desc')}>
        <p className="text-base text-gray-500">{g('ct_desc') || 'Açıklama...'}</p>
      </E>
      {[1,2,3].map(n => (
        <E key={n} active={isSel(`ct${n}`)} onSelect={() => onSel(`ct${n}`)}>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">{n}</span>
            <span className="leading-snug">{g(`ct${n}`) || `Yöntem ${n}`}</span>
          </div>
        </E>
      ))}
      <E active={isSel('ct_note')} onSelect={() => onSel('ct_note')}>
        <p className="text-sm text-gray-400 mt-1">{g('ct_note') || 'Not...'}</p>
      </E>
    </div>
  )
}

// ── GİZLİLİK & GÜVENLİK PREVIEWS ──────────────────────────────────────────────

function GGArticlesPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="space-y-2">
      {Array.from({length: 8}, (_, i) => i + 1).map(n => (
        <div key={n} className="bg-white border border-gray-100 rounded-xl p-3 hover:border-amber-200 transition-colors">
          <div className="flex items-start gap-2 mb-1.5">
            <span className="flex-shrink-0 w-7 h-7 rounded-md bg-amber-50 flex items-center justify-center text-sm font-black text-amber-600">{n}</span>
            <E active={isSel(`a${n}_title`)} onSelect={() => onSel(`a${n}_title`)}>
              <p className="font-black text-gray-900 text-lg">{g(`a${n}_title`) || `Madde ${n}`}</p>
            </E>
          </div>
          <E active={isSel(`a${n}_text`)} onSelect={() => onSel(`a${n}_text`)}>
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{g(`a${n}_text`) || 'İçerik...'}</p>
          </E>
        </div>
      ))}
    </div>
  )
}

function GGSecurityPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="bg-gray-900 rounded-2xl p-5 space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <E active={isSel('sec_title')} onSelect={() => onSel('sec_title')}>
          <h4 className="font-black text-white text-base">{g('sec_title') || 'Başlık'}</h4>
        </E>
      </div>
      <E active={isSel('sec_text')} onSelect={() => onSel('sec_text')}>
        <p className="text-sm text-gray-400 leading-relaxed">{g('sec_text') || 'İçerik...'}</p>
      </E>
    </div>
  )
}

// ── PERSONEL TAŞIMACILIK PREVIEWS ───────────────────────────────────────────────

function PTHeroPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden p-5 min-h-[180px]">
      {g('hero_img') && <div className="absolute inset-0 opacity-30"><img src={g('hero_img')} alt="" className="w-full h-full object-cover" /></div>}
      <div className="relative z-10 space-y-2">
        <E active={isSel('badge')} onSelect={() => onSel('badge')}>
          <span className="inline-block bg-amber-500/20 text-amber-400 text-sm font-bold px-3 py-1 rounded-full">{g('badge') || 'Rozet'}</span>
        </E>
        <E active={isSel('title')} onSelect={() => onSel('title')}>
          <h2 className="text-2xl font-black text-white">{g('title') || 'Başlık'}</h2>
        </E>
        <E active={isSel('subtitle')} onSelect={() => onSel('subtitle')}>
          <p className="text-sm text-gray-300 leading-relaxed">{g('subtitle') || 'Alt başlık...'}</p>
        </E>
      </div>
      <E active={isSel('hero_img')} onSelect={() => onSel('hero_img')}>
        <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 cursor-pointer hover:bg-white/20 transition-colors">
          {g('hero_img') ? (
            <img src={g('hero_img')} alt="" className="w-full h-28 object-cover rounded-lg" />
          ) : (
            <span className="text-sm font-semibold text-gray-400">Banner Görseli Seçin</span>
          )}
        </div>
      </E>
    </div>
  )
}

function PTStatsPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[1,2,3,4].map(n => (
        <div key={n} className="bg-gray-900 rounded-xl p-3 space-y-1">
          <BizKimizIconPicker value={g(`st${n}_icon`) || 'Star'} onChange={() => {}} pageId={pageId} sectionId={sectionId} fieldId={`st${n}_icon`} />
          <E active={isSel(`st${n}_val`)} onSelect={() => onSel(`st${n}_val`)}>
            <p className="text-xl font-black text-white">{g(`st${n}_val`) || '—'}</p>
          </E>
          <E active={isSel(`st${n}_lbl`)} onSelect={() => onSel(`st${n}_lbl`)}>
            <p className="text-sm text-gray-400">{g(`st${n}_lbl`) || 'Etiket'}</p>
          </E>
        </div>
      ))}
    </div>
  )
}

function PTContentPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="space-y-3">
      <E active={isSel('sec_title')} onSelect={() => onSel('sec_title')}>
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 rounded-full bg-amber-500" />
          <h3 className="font-black text-gray-900 text-lg">{g('sec_title') || 'Başlık'}</h3>
        </div>
      </E>
      <E active={isSel('sec_desc')} onSelect={() => onSel('sec_desc')}>
        <p className="text-sm text-gray-400">{g('sec_desc') || 'Açıklama...'}</p>
      </E>
      {['para1','para2','para3'].map(id => (
        <E key={id} active={isSel(id)} onSelect={() => onSel(id)}>
          <p className="text-sm text-gray-600 leading-relaxed">{g(id) || 'Paragraf...'}</p>
        </E>
      ))}
      <E active={isSel('quote')} onSelect={() => onSel('quote')}>
        <blockquote className="border-l-4 border-amber-500 pl-4 py-2 bg-amber-50/60 rounded-r-xl">
          <p className="text-sm text-gray-700 italic leading-relaxed">{g('quote') || 'Alıntı...'}</p>
        </blockquote>
      </E>
    </div>
  )
}

function PTAdvantagesPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
      <E active={isSel('adv_title')} onSelect={() => onSel('adv_title')}>
        <h4 className="font-black text-gray-900 text-base">{g('adv_title') || 'Başlık'}</h4>
      </E>
      {[1,2,3,4,5,6].map(n => (
        <E key={n} active={isSel(`adv${n}`)} onSelect={() => onSel(`adv${n}`)}>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <span>{g(`adv${n}`) || `Avantaj ${n}`}</span>
          </div>
        </E>
      ))}
    </div>
  )
}

function PTFeaturesPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      <E active={isSel('feat_title')} onSelect={() => onSel('feat_title')}>
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 rounded-full bg-amber-500" />
          <h3 className="font-black text-gray-900 text-lg">{g('feat_title') || 'Başlık'}</h3>
        </div>
      </E>
      <E active={isSel('feat_desc')} onSelect={() => onSel('feat_desc')}>
        <p className="text-sm text-gray-400">{g('feat_desc') || 'Açıklama...'}</p>
      </E>
      <div className="grid grid-cols-2 gap-2">
        {[1,2,3,4,5,6].map(n => (
          <div key={n} className="bg-white border border-gray-100 rounded-xl p-3 hover:border-amber-200 transition-colors space-y-1">
            <div className="flex items-center gap-2">
              <BizKimizIconPicker value={g(`f${n}_icon`) || 'Star'} onChange={() => {}} pageId={pageId} sectionId={sectionId} fieldId={`f${n}_icon`} />
              <E active={isSel(`f${n}_title`)} onSelect={() => onSel(`f${n}_title`)}>
                <p className="font-bold text-gray-900 text-sm">{g(`f${n}_title`) || `Özellik ${n}`}</p>
              </E>
            </div>
            <E active={isSel(`f${n}_desc`)} onSelect={() => onSel(`f${n}_desc`)}>
              <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{g(`f${n}_desc`) || 'Açıklama...'}</p>
            </E>
          </div>
        ))}
      </div>
    </div>
  )
}

function PTGalleryPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  const { updateField } = useAdmin()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const MAX_IMAGES = 10

  // Collect existing images (filled slots)
  const images: { n: number; src: string; cap: string }[] = []
  for (let i = 1; i <= MAX_IMAGES; i++) {
    const src = g(`img${i}`)
    if (src) images.push({ n: i, src, cap: g(`cap${i}`) || '' })
  }

  // Find next available slot
  const nextSlot = (() => {
    for (let i = 1; i <= MAX_IMAGES; i++) {
      if (!g(`img${i}`)) return i
    }
    return null
  })()

  async function handleAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !nextSlot) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('folder', `pages/${pageId}`)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.url) {
        // Update local state
        updateField(pageId, sectionId, `img${nextSlot}`, data.url, data.url)
        updateField(pageId, sectionId, `cap${nextSlot}`, '', '')
        // Persist to DB
        await fetch('/api/admin/content', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: [
            { page_id: pageId, section_id: sectionId, field_id: `img${nextSlot}`, tr: data.url, en: data.url },
            { page_id: pageId, section_id: sectionId, field_id: `cap${nextSlot}`, tr: '', en: '' },
          ]}),
        })
      }
    } catch (err) { console.error('Gallery upload failed:', err) }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  async function handleRemove(slot: number) {
    // Clear local state
    updateField(pageId, sectionId, `img${slot}`, '', '')
    updateField(pageId, sectionId, `cap${slot}`, '', '')
    // Persist to DB
    try {
      await fetch('/api/admin/content', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: [
          { page_id: pageId, section_id: sectionId, field_id: `img${slot}`, tr: '', en: '' },
          { page_id: pageId, section_id: sectionId, field_id: `cap${slot}`, tr: '', en: '' },
        ]}),
      })
    } catch (err) { console.error('Gallery remove failed:', err) }
  }

  return (
    <div className="space-y-3">
      <E active={isSel('gal_title')} onSelect={() => onSel('gal_title')}>
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 rounded-full bg-amber-500" />
          <h3 className="font-black text-gray-900 text-lg">{g('gal_title') || 'Galeri'}</h3>
        </div>
      </E>
      <E active={isSel('gal_desc')} onSelect={() => onSel('gal_desc')}>
        <p className="text-sm text-gray-400">{g('gal_desc') || 'Açıklama...'}</p>
      </E>

      {/* Image grid */}
      <div className="grid grid-cols-3 gap-2">
        {images.map(img => (
          <div key={img.n} className="space-y-1 relative group">
            <E active={isSel(`img${img.n}`)} onSelect={() => onSel(`img${img.n}`)}>
              <div className="relative">
                <img src={img.src} alt="" className="w-full h-20 object-cover rounded-lg" />
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(img.n) }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center
                             opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-10"
                  title="Fotoğrafı Kaldır"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </E>
            <E active={isSel(`cap${img.n}`)} onSelect={() => onSel(`cap${img.n}`)}>
              <p className="text-xs text-gray-400 text-center truncate">{img.cap || 'Açıklama'}</p>
            </E>
          </div>
        ))}

        {/* Add button */}
        {nextSlot && (
          <label className="flex flex-col items-center justify-center h-20 bg-gray-50 border-2 border-dashed border-gray-200
                            hover:border-amber-300 hover:bg-amber-50/30 rounded-lg cursor-pointer transition-all group">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAdd} />
            {uploading ? (
              <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5 text-gray-300 group-hover:text-amber-500 transition-colors" />
                <span className="text-xs text-gray-400 group-hover:text-amber-500 mt-1 transition-colors">Ekle</span>
              </>
            )}
          </label>
        )}
      </div>

      <p className="text-xs text-gray-300 text-center">{images.length} / {MAX_IMAGES} fotoğraf</p>
    </div>
  )
}

// ── MEDYA VIDEOS PREVIEW ────────────────────────────────────────────────────
function extractYoutubeId(url: string): string {
  if (!url) return ''
  // Already a plain ID (no slash, no dot)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
  // Full URL patterns
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match?.[1] || url
}

function MedyaVideosPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  const { updateField } = useAdmin()
  const MAX_VIDEOS = 6

  const videos = [1,2,3,4,5,6].map(n => ({
    n,
    title:    g(`v${n}_title`) || '',
    youtube:  g(`v${n}_youtube`) || '',
    category: g(`v${n}_category`) || '',
    duration: g(`v${n}_duration`) || '',
  })).filter(vid => !!vid.youtube) // Only show slots where a YouTube URL has been entered

  // Find next empty slot
  const nextSlot = (() => {
    for (let i = 1; i <= MAX_VIDEOS; i++) {
      if (!g(`v${i}_youtube`)) return i
    }
    return null
  })()

  async function handleAdd() {
    if (!nextSlot) return
    // Don't pre-create — just open the field for the user to type YouTube URL
    onSel(`v${nextSlot}_youtube`)
  }

  async function handleRemove(slot: number) {
    const fields = ['title', 'youtube', 'category', 'duration']
    for (const f of fields) {
      updateField('medya', 'videos', `v${slot}_${f}`, '', '')
    }
    try {
      await fetch('/api/admin/content', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fields.map(f => ({
          page_id: 'medya', section_id: 'videos', field_id: `v${slot}_${f}`,
          tr: '', en: '',
        })) }),
      })
    } catch (err) { console.error('Video remove failed:', err) }
  }

  return (
    <div className="space-y-3">
      <E active={isSel('vid_title')} onSelect={() => onSel('vid_title')}>
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 rounded-full bg-amber-500" />
          <h3 className="font-black text-gray-900 text-lg">{g('vid_title') || 'Videolar'}</h3>
        </div>
      </E>

      <div className="grid grid-cols-2 gap-3">
        {videos.map(vid => {
          const ytId = extractYoutubeId(vid.youtube)
          const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : ''
          return (
            <div key={vid.n} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-amber-200 transition-colors relative group">
              {/* Thumbnail */}
              <E active={isSel(`v${vid.n}_youtube`)} onSelect={() => onSel(`v${vid.n}_youtube`)}>
                {/* Delete button - inside E so it's on top */}
                <button
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleRemove(vid.n) }}
                  className="absolute top-1.5 right-1.5 z-20 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center
                             opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                  title="Videoyu Sil"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="relative aspect-video bg-slate-100">
                  {thumb ? (
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Play className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow">
                      <Play className="w-4 h-4 text-amber-600 ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  {vid.duration && (
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">{vid.duration}</div>
                  )}
                  {vid.category && (
                    <div className="absolute top-1 left-1 bg-amber-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">{vid.category}</div>
                  )}
                </div>
              </E>
              {/* Info */}
              <div className="p-2.5 space-y-1">
                <E active={isSel(`v${vid.n}_title`)} onSelect={() => onSel(`v${vid.n}_title`)}>
                  <p className="text-xs font-bold text-gray-800 leading-snug">{vid.title || `Video ${vid.n}`}</p>
                </E>
                <div className="flex items-center gap-2">
                  <E active={isSel(`v${vid.n}_category`)} onSelect={() => onSel(`v${vid.n}_category`)}>
                    <span className="text-[10px] text-gray-400">{vid.category || 'Kategori'}</span>
                  </E>
                  <E active={isSel(`v${vid.n}_duration`)} onSelect={() => onSel(`v${vid.n}_duration`)}>
                    <span className="text-[10px] text-gray-400">{vid.duration || 'Süre'}</span>
                  </E>
                </div>
              </div>
            </div>
          )
        })}

        {/* Add video button */}
        {nextSlot && (
          <button
            onClick={handleAdd}
            className="flex flex-col items-center justify-center aspect-video bg-gray-50 border-2 border-dashed border-gray-200
                       hover:border-amber-300 hover:bg-amber-50/30 rounded-xl cursor-pointer transition-all group"
          >
            <Plus className="w-6 h-6 text-gray-300 group-hover:text-amber-500 transition-colors" />
            <span className="text-xs text-gray-400 group-hover:text-amber-500 mt-1.5 font-medium transition-colors">Video Ekle</span>
          </button>
        )}
      </div>

      <p className="text-xs text-gray-300 text-center">{videos.length} / {MAX_VIDEOS} video • YouTube URL girin</p>
    </div>
  )
}

// ── MEDYA GALERİ PREVIEW ────────────────────────────────────────────────────
function MedyaGalleryPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  const { updateField } = useAdmin()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const MAX_IMAGES = 12

  const images = Array.from({length: MAX_IMAGES}, (_, i) => i + 1).map(n => ({
    n,
    src: g(`img${n}`) || '',
    alt: g(`alt${n}`) || '',
    cat: g(`cat${n}`) || '',
  })).filter(img => img.src)

  const nextSlot = (() => {
    for (let i = 1; i <= MAX_IMAGES; i++) {
      if (!g(`img${i}`)) return i
    }
    return null
  })()

  async function handleAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !nextSlot) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('folder', 'pages/medya')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.url) {
        updateField('medya', 'gallery', `img${nextSlot}`, data.url, data.url)
        updateField('medya', 'gallery', `alt${nextSlot}`, '', '')
        updateField('medya', 'gallery', `cat${nextSlot}`, '', '')
        await fetch('/api/admin/content', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: [
            { page_id: 'medya', section_id: 'gallery', field_id: `img${nextSlot}`, tr: data.url, en: data.url },
            { page_id: 'medya', section_id: 'gallery', field_id: `alt${nextSlot}`, tr: '', en: '' },
            { page_id: 'medya', section_id: 'gallery', field_id: `cat${nextSlot}`, tr: '', en: '' },
          ]}),
        })
      }
    } catch (err) { console.error('Gallery upload failed:', err) }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  async function handleRemove(slot: number) {
    updateField('medya', 'gallery', `img${slot}`, '', '')
    updateField('medya', 'gallery', `alt${slot}`, '', '')
    updateField('medya', 'gallery', `cat${slot}`, '', '')
    try {
      await fetch('/api/admin/content', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: [
          { page_id: 'medya', section_id: 'gallery', field_id: `img${slot}`, tr: '', en: '' },
          { page_id: 'medya', section_id: 'gallery', field_id: `alt${slot}`, tr: '', en: '' },
          { page_id: 'medya', section_id: 'gallery', field_id: `cat${slot}`, tr: '', en: '' },
        ]}),
      })
    } catch (err) { console.error('Gallery remove failed:', err) }
  }

  return (
    <div className="space-y-3">
      <E active={isSel('gal_title')} onSelect={() => onSel('gal_title')}>
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 rounded-full bg-amber-500" />
          <h3 className="font-black text-gray-900 text-lg">{g('gal_title') || 'Fotoğraf Galerisi'}</h3>
        </div>
      </E>

      <div className="grid grid-cols-3 gap-2">
        {images.map(img => (
          <div key={img.n} className="space-y-1 relative group">
            <E active={isSel(`img${img.n}`)} onSelect={() => onSel(`img${img.n}`)}>
              <div className="relative">
                <img src={img.src} alt={img.alt} className="w-full h-20 object-cover rounded-lg" />
                <button
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleRemove(img.n) }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center
                             opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-10"
                  title="Fotoğrafı Sil"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </E>
            <E active={isSel(`alt${img.n}`)} onSelect={() => onSel(`alt${img.n}`)}>
              <p className="text-[10px] text-gray-500 text-center truncate">{img.alt || 'Alt metin'}</p>
            </E>
          </div>
        ))}

        {/* Add photo button */}
        {nextSlot && (
          <label className="flex flex-col items-center justify-center h-20 bg-gray-50 border-2 border-dashed border-gray-200
                            hover:border-amber-300 hover:bg-amber-50/30 rounded-lg cursor-pointer transition-all group">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAdd} />
            {uploading ? (
              <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5 text-gray-300 group-hover:text-amber-500 transition-colors" />
                <span className="text-[10px] text-gray-400 group-hover:text-amber-500 mt-0.5 transition-colors">Ekle</span>
              </>
            )}
          </label>
        )}
      </div>

      <p className="text-xs text-gray-300 text-center">{images.length} / {MAX_IMAGES} fotoğraf</p>
    </div>
  )
}

// ── DUYURULAR STATS PREVIEW ─────────────────────────────────────────────────
function DuyurularStatsPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="bg-amber-500 rounded-xl p-4">
      <div className="grid grid-cols-2 gap-3">
        {[1,2,3,4].map(n => (
          <div key={n} className="flex items-center gap-2">
            <E active={isSel(`stat${n}_val`)} onSelect={() => onSel(`stat${n}_val`)}>
              <span className="font-black text-white text-lg">{g(`stat${n}_val`) || '—'}</span>
            </E>
            <E active={isSel(`stat${n}_label`)} onSelect={() => onSel(`stat${n}_label`)}>
              <span className="text-amber-100 text-xs">{g(`stat${n}_label`) || 'Etiket'}</span>
            </E>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── DUYURULAR ANNOUNCEMENTS PREVIEW ─────────────────────────────────────────
function DuyurularAnnouncementsPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  const { updateField } = useAdmin()
  const MAX = 10

  const allItems = Array.from({length: MAX}, (_, i) => i + 1).map(n => ({
    n,
    cat:     g(`a${n}_cat`) || '',
    title:   g(`a${n}_title`) || '',
    summary: g(`a${n}_summary`) || '',
    date:    g(`a${n}_date`) || '',
    badge:   g(`a${n}_badge`) || '',
    dept:    g(`a${n}_dept`) || '',
    location: g(`a${n}_location`) || '',
    type:    g(`a${n}_type`) || '',
    reqs:    g(`a${n}_reqs`) || '',
  }))

  const filled = allItems.filter(item => item.title)
  const jobs = filled.filter(item => item.cat === 'İş İlanları')
  const others = filled.filter(item => item.cat !== 'İş İlanları')

  // Find next empty slot
  const nextSlot = allItems.find(item => !item.title)?.n ?? null

  const catColors: Record<string, string> = {
    'İş İlanları': 'bg-blue-50 text-blue-700 border-blue-200',
    'Haberler':    'bg-green-50 text-green-700 border-green-200',
    'Kampanyalar': 'bg-amber-50 text-amber-700 border-amber-200',
    'Basın':       'bg-purple-50 text-purple-700 border-purple-200',
  }

  // Clear all fields of a slot
  async function handleRemove(slot: number) {
    const fieldIds = ['cat', 'title', 'summary', 'date', 'badge', 'location', 'type', 'dept', 'reqs', 'image']
    const fields: {page_id:string; section_id:string; field_id:string; tr:string; en:string}[] = []
    fieldIds.forEach(fid => {
      updateField('duyurular', 'announcements', `a${slot}_${fid}`, '', '')
      fields.push({ page_id: 'duyurular', section_id: 'announcements', field_id: `a${slot}_${fid}`, tr: '', en: '' })
    })
    try {
      await fetch('/api/admin/content', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      })
    } catch (err) { console.error('Remove announcement failed:', err) }
  }

  // Add new announcement with defaults
  async function handleAdd(cat: string) {
    if (!nextSlot) return
    const enCat = cat === 'İş İlanları' ? 'Job Listings' : cat === 'Haberler' ? 'News' : cat === 'Kampanyalar' ? 'Campaigns' : cat === 'Basın' ? 'Press' : cat
    const defaults = [
      { fid: `a${nextSlot}_cat`, tr: cat, en: enCat },
      { fid: `a${nextSlot}_title`, tr: 'Yeni Duyuru', en: 'New Announcement' },
      { fid: `a${nextSlot}_summary`, tr: '', en: '' },
      { fid: `a${nextSlot}_date`, tr: new Date().toISOString().split('T')[0], en: new Date().toISOString().split('T')[0] },
    ]
    const fields: {page_id:string; section_id:string; field_id:string; tr:string; en:string}[] = []
    defaults.forEach(d => {
      updateField('duyurular', 'announcements', d.fid, d.tr, d.en)
      fields.push({ page_id: 'duyurular', section_id: 'announcements', field_id: d.fid, tr: d.tr, en: d.en })
    })
    try {
      await fetch('/api/admin/content', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      })
    } catch (err) { console.error('Add announcement failed:', err) }
  }

  function AnnouncementCard({ item }: { item: typeof allItems[0] }) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-3 hover:border-amber-200 transition-colors relative group">
        {/* Delete button */}
        <E active={false} onSelect={() => {}}>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(item.n) }}
            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            title="Duyuruyu Sil"
          >
            <span className="text-red-400 text-xs font-bold">✕</span>
          </button>
        </E>
        <div className="flex items-start gap-2 mb-1">
          <E active={isSel(`a${item.n}_cat`)} onSelect={() => onSel(`a${item.n}_cat`)}>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${catColors[item.cat] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
              {item.cat || 'Kategori'}
            </span>
          </E>
          {item.badge && (
            <E active={isSel(`a${item.n}_badge`)} onSelect={() => onSel(`a${item.n}_badge`)}>
              <span className="text-[10px] font-bold text-red-500">{item.badge}</span>
            </E>
          )}
          {item.dept && (
            <E active={isSel(`a${item.n}_dept`)} onSelect={() => onSel(`a${item.n}_dept`)}>
              <span className="text-[10px] text-gray-400">{item.dept}</span>
            </E>
          )}
        </div>
        <E active={isSel(`a${item.n}_title`)} onSelect={() => onSel(`a${item.n}_title`)}>
          <p className="text-sm font-bold text-gray-800 leading-snug">{item.title}</p>
        </E>
        <E active={isSel(`a${item.n}_summary`)} onSelect={() => onSel(`a${item.n}_summary`)}>
          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.summary || 'Özet...'}</p>
        </E>
        <div className="flex items-center gap-2 mt-1">
          <E active={isSel(`a${item.n}_date`)} onSelect={() => onSel(`a${item.n}_date`)}>
            <p className="text-[10px] text-gray-300">{item.date || 'Tarih'}</p>
          </E>
          {item.location && (
            <E active={isSel(`a${item.n}_location`)} onSelect={() => onSel(`a${item.n}_location`)}>
              <p className="text-[10px] text-gray-300">📍 {item.location}</p>
            </E>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ── İş İlanları Section ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">💼 İş İlanları</span>
          <span className="text-[10px] text-gray-400">{jobs.length} ilan</span>
        </div>
        <div className="space-y-2">
          {jobs.map(item => <AnnouncementCard key={item.n} item={item} />)}
        </div>
        {nextSlot && (
          <button onClick={() => handleAdd('İş İlanları')}
            className="w-full mt-2 py-2 border-2 border-dashed border-blue-200 rounded-xl text-xs font-semibold text-blue-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all">
            + İş İlanı Ekle
          </button>
        )}
      </div>

      {/* ── Diğer Duyurular Section ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">📢 Diğer Duyurular</span>
          <span className="text-[10px] text-gray-400">{others.length} duyuru</span>
        </div>
        <div className="space-y-2">
          {others.map(item => <AnnouncementCard key={item.n} item={item} />)}
        </div>
        {nextSlot && (
          <div className="flex gap-2 mt-2">
            {['Haberler', 'Kampanyalar', 'Basın'].map(cat => (
              <button key={cat} onClick={() => handleAdd(cat)}
                className={`flex-1 py-2 border-2 border-dashed rounded-xl text-xs font-semibold transition-all ${
                  cat === 'Haberler' ? 'border-green-200 text-green-400 hover:border-green-400 hover:text-green-600 hover:bg-green-50/50' :
                  cat === 'Kampanyalar' ? 'border-amber-200 text-amber-400 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50/50' :
                  'border-purple-200 text-purple-400 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/50'
                }`}>
                + {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-300 text-center">{filled.length} / {MAX} duyuru</p>
    </div>
  )
}

function PTCtaPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-center space-y-2">
      <E active={isSel('cta_title')} onSelect={() => onSel('cta_title')}>
        <h4 className="font-black text-white text-base">{g('cta_title') || 'Başlık'}</h4>
      </E>
      <E active={isSel('cta_desc')} onSelect={() => onSel('cta_desc')}>
        <p className="text-amber-100 text-sm">{g('cta_desc') || 'Açıklama...'}</p>
      </E>
      <E active={isSel('cta_btn')} onSelect={() => onSel('cta_btn')}>
        <div className="inline-block bg-white text-amber-600 font-bold text-sm py-2 px-6 rounded-xl">{g('cta_btn') || 'Buton'}</div>
      </E>
    </div>
  )
}

// ── KULLANIM KOŞULLARI PREVIEWS ─────────────────────────────────────────────────

function KKArticlesPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-2">
      {Array.from({length: 7}, (_, i) => i + 1).map(n => {
        const iconName = g(`a${n}_icon`) || 'FileText'
        return (
          <div key={n} className="bg-white border border-gray-100 rounded-xl p-3 hover:border-amber-200 transition-colors">
            <div className="flex items-start gap-2 mb-1.5">
              <BizKimizIconPicker value={iconName} onChange={() => {}} pageId={pageId} sectionId={sectionId} fieldId={`a${n}_icon`} />
              <E active={isSel(`a${n}_title`)} onSelect={() => onSel(`a${n}_title`)}>
                <p className="font-black text-gray-900 text-lg">{g(`a${n}_title`) || `Madde ${n}`}</p>
              </E>
            </div>
            <E active={isSel(`a${n}_text`)} onSelect={() => onSel(`a${n}_text`)}>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{g(`a${n}_text`) || 'İçerik...'}</p>
            </E>
          </div>
        )
      })}
    </div>
  )
}

function KKDisclaimerPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <E active={isSel('disc_text')} onSelect={() => onSel('disc_text')}>
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <p className="text-sm text-gray-500 leading-relaxed">{g('disc_text') || 'Uyarı metni...'}</p>
      </div>
    </E>
  )
}

// ── ÇEREZ POLİTİKASI PREVIEWS ──────────────────────────────────────────────────

function CPPurposesPreview({ g, isSel, onSel, pageId, sectionId }: { g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string; sectionId: string }) {
  return (
    <div className="space-y-3">
      <E active={isSel('pur_title')} onSelect={() => onSel('pur_title')}>
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 rounded-full bg-amber-500" />
          <h3 className="font-black text-gray-900 text-lg">{g('pur_title') || 'Başlık'}</h3>
        </div>
      </E>
      <E active={isSel('pur_desc')} onSelect={() => onSel('pur_desc')}>
        <p className="text-sm text-gray-400">{g('pur_desc') || 'Açıklama...'}</p>
      </E>
      <div className="grid grid-cols-2 gap-2">
        {[1,2,3,4,5,6].map(n => {
          const iconName = g(`p${n}_icon`) || 'Eye'
          return (
            <div key={n} className="bg-white border border-gray-100 rounded-xl p-3 hover:border-amber-200 transition-colors space-y-1.5">
              <div className="flex items-center gap-2">
                <BizKimizIconPicker value={iconName} onChange={(v) => {}} pageId={pageId} sectionId={sectionId} fieldId={`p${n}_icon`} />
                <E active={isSel(`p${n}_title`)} onSelect={() => onSel(`p${n}_title`)}>
                  <p className="font-bold text-gray-900 text-sm">{g(`p${n}_title`) || `Kart ${n}`}</p>
                </E>
              </div>
              <E active={isSel(`p${n}_desc`)} onSelect={() => onSel(`p${n}_desc`)}>
                <p className="text-sm text-gray-400 leading-relaxed">{g(`p${n}_desc`) || 'Açıklama...'}</p>
              </E>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CPRemovalPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="space-y-3">
      <E active={isSel('rm_title')} onSelect={() => onSel('rm_title')}>
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 rounded-full bg-amber-500" />
          <h3 className="font-black text-gray-900 text-lg">{g('rm_title') || 'Başlık'}</h3>
        </div>
      </E>
      <E active={isSel('rm_desc')} onSelect={() => onSel('rm_desc')}>
        <p className="text-sm text-gray-400">{g('rm_desc') || 'Açıklama...'}</p>
      </E>
      <E active={isSel('rm_text')} onSelect={() => onSel('rm_text')}>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-sm text-gray-600 leading-relaxed">{g('rm_text') || 'İçerik...'}</p>
        </div>
      </E>
      <div className="grid grid-cols-2 gap-2">
        {[1,2,3,4].map(n => (
          <div key={n} className="rounded-lg border border-gray-100 bg-gray-50 p-2.5 space-y-1">
            <E active={isSel(`b${n}_name`)} onSelect={() => onSel(`b${n}_name`)}>
              <div className="flex items-center gap-2">
                <Cookie className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">{g(`b${n}_name`) || `Tarayıcı ${n}`}</span>
              </div>
            </E>
            <E active={isSel(`b${n}_url`)} onSelect={() => onSel(`b${n}_url`)}>
              <p className="text-xs text-amber-500 truncate pl-6">{g(`b${n}_url`) || 'URL giriniz...'}</p>
            </E>
          </div>
        ))}
      </div>
      <E active={isSel('rm_note')} onSelect={() => onSel('rm_note')}>
        <p className="text-sm text-gray-400">{g('rm_note') || 'Not...'}</p>
      </E>
    </div>
  )
}

// Generic fallback renderer — renders all fields as visual content blocks
function GenericPreview({ section, g, isSel, onSel }: { section: ContentSection; g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="space-y-3">
      {section.fields.map(field => (
        <E key={field.id} active={isSel(field.id)} onSelect={() => onSel(field.id)}>
          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4">
            <p className="text-base font-bold text-gray-400 uppercase tracking-wider mb-2">{field.label}</p>
            {field.type === 'image' ? (
              g(field.id)
                ? <img src={g(field.id)} alt="" className="w-full h-40 object-cover rounded-xl" />
                : <div className="w-full h-32 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-200" />
                  </div>
            ) : field.type === 'textarea' || field.type === 'richtext' ? (
              <p className="text-gray-700 text-sm leading-relaxed">{g(field.id) || <span className="text-gray-300 italic">Boş...</span>}</p>
            ) : (
              <p className={cn('text-gray-900 font-semibold', field.id.includes('title') ? 'text-xl' : 'text-sm')}>
                {g(field.id) || <span className="text-gray-300 italic">Boş...</span>}
              </p>
            )}
          </div>
        </E>
      ))}
    </div>
  )
}

function IletisimOfficePreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="grid sm:grid-cols-2 gap-0">
        {/* Map placeholder */}
        <div className="bg-gray-100 flex items-center justify-center min-h-[180px] relative">
          {g('map_url') ? (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
              <E active={isSel('map_url')} onSelect={() => onSel('map_url')}>
                <div className="text-center px-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                  </div>
                  <p className="text-xs font-semibold text-blue-600">Harita URL Girildi</p>
                  <p className="text-xs text-blue-400 mt-0.5 truncate max-w-[140px]">{g('map_url').substring(0, 40)}…</p>
                </div>
              </E>
            </div>
          ) : (
            <E active={isSel('map_url')} onSelect={() => onSel('map_url')}>
              <div className="text-center px-4">
                <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                </div>
                <p className="text-xs text-gray-400 font-medium">Google Maps URL girin</p>
              </div>
            </E>
          )}
        </div>
        {/* Info */}
        <div className="p-5 space-y-3">
          <E active={isSel('name')} onSelect={() => onSel('name')}>
            <h3 className="font-black text-gray-900 text-base">{g('name') || 'Ofis Adı'}</h3>
          </E>
          <E active={isSel('office_title')} onSelect={() => onSel('office_title')}>
            <p className="text-xs text-gray-400">{g('office_title') || 'Unvan'}</p>
          </E>
          <E active={isSel('address')} onSelect={() => onSel('address')}>
            <p className="text-xs text-gray-600 leading-relaxed">{g('address') || 'Adres...'}</p>
          </E>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              { id: 'call_center', label: 'Call Center' },
              { id: 'phone',       label: 'Telefon' },
              { id: 'fax',         label: 'Faks' },
              { id: 'email',       label: 'E-Posta' },
            ].map(f => (
              <E key={f.id} active={isSel(f.id)} onSelect={() => onSel(f.id)}>
                <div className="bg-gray-50 rounded-lg px-2.5 py-2">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{f.label}</p>
                  <p className="text-xs font-semibold text-gray-800 truncate">{g(f.id) || '—'}</p>
                </div>
              </E>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function IletisimFormPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="text-center space-y-1.5">
        <E active={isSel('sec_badge')} onSelect={() => onSel('sec_badge')}>
          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">
            {g('sec_badge') || 'İletişim Formu'}
          </p>
        </E>
        <E active={isSel('sec_title')} onSelect={() => onSel('sec_title')}>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">
            {g('sec_title') || 'Bize Mesaj Gönderin'}
          </h3>
        </E>
        <E active={isSel('sec_desc')} onSelect={() => onSel('sec_desc')}>
          <p className="text-gray-400 text-xs max-w-xs mx-auto">
            {g('sec_desc') || 'Açıklama...'}
          </p>
        </E>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-5">
          {/* Left dark panel */}
          <div className="col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 p-5 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-xl" />
            <div className="relative z-10 space-y-4">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-amber-400" />
              </div>
              <E active={isSel('left_title')} onSelect={() => onSel('left_title')}>
                <h4 className="text-sm font-black leading-tight">
                  {g('left_title') || 'Sizden haber almak isteriz'}
                </h4>
              </E>
              <E active={isSel('left_desc')} onSelect={() => onSel('left_desc')}>
                <p className="text-slate-300/70 text-[10px] leading-relaxed">
                  {g('left_desc') || 'Açıklama...'}
                </p>
              </E>

              <div className="space-y-2.5 pt-2">
                {[
                  { labelId: 'info1_label', descId: 'info1_desc' },
                  { labelId: 'info2_label', descId: 'info2_desc' },
                  { labelId: 'info3_label', descId: 'info3_desc' },
                ].map((item) => (
                  <div key={item.labelId} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <E active={isSel(item.labelId)} onSelect={() => onSel(item.labelId)}>
                        <p className="text-[10px] font-bold text-white truncate">{g(item.labelId) || '—'}</p>
                      </E>
                      <E active={isSel(item.descId)} onSelect={() => onSel(item.descId)}>
                        <p className="text-[9px] text-slate-400 truncate">{g(item.descId) || '—'}</p>
                      </E>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right form panel */}
          <div className="col-span-3 p-5 space-y-3">
            {/* Name & Email */}
            <div className="grid grid-cols-2 gap-2">
              <E active={isSel('label_name')} onSelect={() => onSel('label_name')}>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">{g('label_name') || 'Ad Soyad'} <span className="text-red-400">*</span></p>
                  <div className="bg-gray-50 rounded-lg px-2.5 py-2 border border-gray-100">
                    <p className="text-[10px] text-gray-300">Adınız Soyadınız</p>
                  </div>
                </div>
              </E>
              <E active={isSel('label_email')} onSelect={() => onSel('label_email')}>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">{g('label_email') || 'E-Posta'} <span className="text-red-400">*</span></p>
                  <div className="bg-gray-50 rounded-lg px-2.5 py-2 border border-gray-100">
                    <p className="text-[10px] text-gray-300">ornek@mail.com</p>
                  </div>
                </div>
              </E>
            </div>
            {/* Phone & Subject */}
            <div className="grid grid-cols-2 gap-2">
              <E active={isSel('label_phone')} onSelect={() => onSel('label_phone')}>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">{g('label_phone') || 'Telefon'}</p>
                  <div className="bg-gray-50 rounded-lg px-2.5 py-2 border border-gray-100">
                    <p className="text-[10px] text-gray-300">+90 5XX XXX XX XX</p>
                  </div>
                </div>
              </E>
              <E active={isSel('label_konu')} onSelect={() => onSel('label_konu')}>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">{g('label_konu') || 'Konu'}</p>
                  <div className="bg-gray-50 rounded-lg px-2.5 py-2 border border-gray-100">
                    <p className="text-[10px] text-gray-300">Konu seçiniz...</p>
                  </div>
                </div>
              </E>
            </div>
            {/* Message */}
            <E active={isSel('label_mesaj')} onSelect={() => onSel('label_mesaj')}>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">{g('label_mesaj') || 'Mesajınız'} <span className="text-red-400">*</span></p>
                <div className="bg-gray-50 rounded-lg px-2.5 py-2.5 border border-gray-100 min-h-[48px]">
                  <p className="text-[10px] text-gray-300">Mesajınızı buraya yazınız...</p>
                </div>
              </div>
            </E>
            {/* Submit */}
            <E active={isSel('btn_submit')} onSelect={() => onSel('btn_submit')}>
              <div className="bg-amber-500 text-white text-center rounded-lg py-2.5 text-xs font-bold">
                {g('btn_submit') || 'Mesaj Gönder'}
              </div>
            </E>
            {/* Privacy */}
            <E active={isSel('privacy_note')} onSelect={() => onSel('privacy_note')}>
              <p className="text-[9px] text-gray-300 text-center">
                {g('privacy_note') || 'Gizlilik politikası...'}
              </p>
            </E>
          </div>
        </div>
      </div>
    </div>
  )
}

function IletisimInfoBarPreview({ g, isSel, onSel }: { g: GetVal; isSel: IsSel; onSel: OnSel }) {
  const cards = [
    { id: 'c1', color: 'text-amber-500',   bg: 'bg-amber-50' },
    { id: 'c2', color: 'text-blue-500',    bg: 'bg-blue-50' },
    { id: 'c3', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'c4', color: 'text-purple-500',  bg: 'bg-purple-50' },
  ]
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map(card => (
        <div key={card.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
            <Headphones className={`w-4 h-4 ${card.color}`} />
          </div>
          <E active={isSel(`${card.id}_label`)} onSelect={() => onSel(`${card.id}_label`)}>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              {g(`${card.id}_label`) || 'Başlık'}
            </p>
          </E>
          <E active={isSel(`${card.id}_value`)} onSelect={() => onSel(`${card.id}_value`)}>
            <p className="text-sm font-black text-gray-900 truncate">
              {g(`${card.id}_value`) || 'Değer'}
            </p>
          </E>
          <E active={isSel(`${card.id}_sub`)} onSelect={() => onSel(`${card.id}_sub`)}>
            <p className="text-xs text-gray-400">
              {g(`${card.id}_sub`) || 'Alt metin'}
            </p>
          </E>
        </div>
      ))}
    </div>
  )
}

// Routes to the right preview renderer based on section id
function SectionPreviewRouter({ section, g, isSel, onSel, pageId }: {
  section: ContentSection; g: GetVal; isSel: IsSel; onSel: OnSel; pageId: string
}) {
  const id = section.id
  // Iletisim page sections
  if (pageId === 'iletisim' && id === 'hero')      return <PTHeroPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'iletisim' && id === 'info_bar')   return <IletisimInfoBarPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'iletisim' && (id === 'merkez' || id === 'umraniye' || id === 'kocaeli'))
    return <IletisimOfficePreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'iletisim' && id === 'form')      return <IletisimFormPreview g={g} isSel={isSel} onSel={onSel} />
  // Biz Kimiz page sections (must be before generic hero/about)
  if (pageId === 'biz-kimiz' && id === 'hero')     return <BizKimizHeroPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'biz-kimiz' && id === 'about')    return <BizKimizAboutPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'biz-kimiz' && id === 'services')  return <BizKimizServicesPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'biz-kimiz' && id === 'vision')    return <BizKimizVisionPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  // Baskanin Mesaji page sections
  if (pageId === 'baskanin-mesaji' && id === 'hero')     return <BMHeroPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'baskanin-mesaji' && id === 'photo')    return <BMPhotoPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'baskanin-mesaji' && id === 'message')  return <BMMessagePreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'baskanin-mesaji' && id === 'signature') return <BMSignaturePreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'baskanin-mesaji' && id === 'values')   return <BMValuesPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  // Sirket Profili page sections
  if (pageId === 'sirket-profili' && id === 'hero')      return <SPHeroPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'sirket-profili' && id === 'company')   return <SPCompanyPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'sirket-profili' && id === 'about')     return <SPAboutPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'sirket-profili' && id === 'contact')   return <SPContactPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'sirket-profili' && id === 'services')  return <SPServicesPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'sirket-profili' && id === 'timeline')  return <SPTimelinePreview g={g} isSel={isSel} onSel={onSel} />
  // Arac Filosu page sections
  if (pageId === 'arac-filosu' && id === 'hero')      return <AFHeroPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'arac-filosu' && id === 'gps')       return <AFGpsPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'arac-filosu' && id === 'vehicles')  return <AFVehiclesPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'arac-filosu' && id === 'features')  return <AFFeaturesPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'arac-filosu' && id === 'cta')       return <AFCtaPreview g={g} isSel={isSel} onSel={onSel} />
  // Insan Kaynaklari page sections
  if (pageId === 'insan-kaynaklari' && id === 'hero')    return <IKHeroPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'insan-kaynaklari' && id === 'vision')  return <IKVisionPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'insan-kaynaklari' && id === 'values')  return <IKValuesPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'insan-kaynaklari' && id === 'hiring')  return <IKHiringPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'insan-kaynaklari' && id === 'cta')     return <IKCtaPreview g={g} isSel={isSel} onSel={onSel} />
  // Kalite Politikasi page sections
  if (pageId === 'kalite-politikasi' && id === 'hero')    return <KPHeroPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'kalite-politikasi' && id === 'policy')  return <KPPolicyPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'kalite-politikasi' && id === 'certs')   return <KPCertsPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  // Cevre Su Politikalari page sections
  if (pageId === 'cevre-su-politikalari' && id === 'hero')     return <CSPHeroPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'cevre-su-politikalari' && id === 'pillars')  return <CSPPillarsPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'cevre-su-politikalari' && id === 'policy')   return <CSPPolicyPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  // Is Sagligi Guvenligi page sections
  if (pageId === 'is-sagligi-guvenligi' && id === 'hero')        return <ISGHeroPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'is-sagligi-guvenligi' && id === 'policy')      return <ISGPolicyPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'is-sagligi-guvenligi' && id === 'goals')       return <ISGGoalsPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'is-sagligi-guvenligi' && id === 'principles')  return <ISGPrinciplesPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  // KVKK page sections
  if (pageId === 'kvkk' && id === 'hero')      return <KVKKHeroPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'kvkk' && id === 'intro')     return <KVKKIntroPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'kvkk' && id === 'articles')  return <KVKKArticlesPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'kvkk' && id === 'contact')   return <KVKKContactPreview g={g} isSel={isSel} onSel={onSel} />
  // Gizlilik Guvenlik page sections (reuses KVKK hero/intro patterns)
  if (pageId === 'gizlilik-guvenlik' && id === 'hero')      return <KVKKHeroPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'gizlilik-guvenlik' && id === 'intro')     return <KVKKIntroPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'gizlilik-guvenlik' && id === 'articles')  return <GGArticlesPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'gizlilik-guvenlik' && id === 'security')  return <GGSecurityPreview g={g} isSel={isSel} onSel={onSel} />
  // Cerez Politikasi page sections
  if (pageId === 'cerez-politikasi' && id === 'hero')      return <KVKKHeroPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'cerez-politikasi' && id === 'intro')     return <KVKKIntroPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'cerez-politikasi' && id === 'purposes')  return <CPPurposesPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'cerez-politikasi' && id === 'removal')   return <CPRemovalPreview g={g} isSel={isSel} onSel={onSel} />
  // Kullanim Kosullari page sections
  if (pageId === 'kullanim-kosullari' && id === 'hero')       return <KVKKHeroPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'kullanim-kosullari' && id === 'articles')   return <KKArticlesPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'kullanim-kosullari' && id === 'disclaimer') return <KKDisclaimerPreview g={g} isSel={isSel} onSel={onSel} />
  // Personel Tasimacilik page sections
  if (pageId === 'personel-tasimacilik' && id === 'hero')       return <PTHeroPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'personel-tasimacilik' && id === 'stats')      return <PTStatsPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'personel-tasimacilik' && id === 'content')    return <PTContentPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'personel-tasimacilik' && id === 'advantages') return <PTAdvantagesPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'personel-tasimacilik' && id === 'features')   return <PTFeaturesPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'personel-tasimacilik' && id === 'gallery')    return <PTGalleryPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'personel-tasimacilik' && id === 'cta')        return <PTCtaPreview g={g} isSel={isSel} onSel={onSel} />
  // Ogrenci Tasimacilik page sections (reuses PT previews — same structure)
  if (pageId === 'ogrenci-tasimacilik' && id === 'hero')       return <PTHeroPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'ogrenci-tasimacilik' && id === 'stats')      return <PTStatsPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'ogrenci-tasimacilik' && id === 'content')    return <PTContentPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'ogrenci-tasimacilik' && id === 'advantages') return <PTAdvantagesPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'ogrenci-tasimacilik' && id === 'features')   return <PTFeaturesPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'ogrenci-tasimacilik' && id === 'gallery')    return <PTGalleryPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'ogrenci-tasimacilik' && id === 'cta')        return <PTCtaPreview g={g} isSel={isSel} onSel={onSel} />
  // Ozel Transfer page sections (reuses PT previews — same structure)
  if (pageId === 'ozel-transfer' && id === 'hero')       return <PTHeroPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'ozel-transfer' && id === 'stats')      return <PTStatsPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'ozel-transfer' && id === 'content')    return <PTContentPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'ozel-transfer' && id === 'advantages') return <PTAdvantagesPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'ozel-transfer' && id === 'features')   return <PTFeaturesPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'ozel-transfer' && id === 'gallery')    return <PTGalleryPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'ozel-transfer' && id === 'cta')        return <PTCtaPreview g={g} isSel={isSel} onSel={onSel} />
  // Araç Kiralama page sections (reuses PT previews — same structure)
  if (pageId === 'arac-kiralama' && id === 'hero')       return <PTHeroPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'arac-kiralama' && id === 'stats')      return <PTStatsPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'arac-kiralama' && id === 'content')    return <PTContentPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'arac-kiralama' && id === 'advantages') return <PTAdvantagesPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'arac-kiralama' && id === 'features')   return <PTFeaturesPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'arac-kiralama' && id === 'gallery')    return <PTGalleryPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'arac-kiralama' && id === 'cta')        return <PTCtaPreview g={g} isSel={isSel} onSel={onSel} />
  // Turizm Acenteliği page sections
  if (pageId === 'turizm-acenteligi' && id === 'hero')       return <PTHeroPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'turizm-acenteligi' && id === 'stats')      return <PTStatsPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'turizm-acenteligi' && id === 'content')    return <PTContentPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'turizm-acenteligi' && id === 'advantages') return <PTAdvantagesPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'turizm-acenteligi' && id === 'features')   return <PTFeaturesPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'turizm-acenteligi' && id === 'gallery')    return <PTGalleryPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'turizm-acenteligi' && id === 'cta')        return <PTCtaPreview g={g} isSel={isSel} onSel={onSel} />
  // Akaryakıt İstasyonu page sections
  if (pageId === 'akaryakit-istasyonu' && id === 'hero')       return <PTHeroPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'akaryakit-istasyonu' && id === 'stats')      return <PTStatsPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'akaryakit-istasyonu' && id === 'content')    return <PTContentPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'akaryakit-istasyonu' && id === 'advantages') return <PTAdvantagesPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'akaryakit-istasyonu' && id === 'features')   return <PTFeaturesPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'akaryakit-istasyonu' && id === 'gallery')    return <PTGalleryPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (pageId === 'akaryakit-istasyonu' && id === 'cta')        return <PTCtaPreview g={g} isSel={isSel} onSel={onSel} />
  // Medya page sections
  if (pageId === 'medya' && id === 'hero')    return <PTHeroPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'medya' && id === 'videos')  return <MedyaVideosPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'medya' && id === 'gallery') return <MedyaGalleryPreview g={g} isSel={isSel} onSel={onSel} />
  // Duyurular page sections
  if (pageId === 'duyurular' && id === 'hero')          return <PTHeroPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'duyurular' && id === 'stats')         return <DuyurularStatsPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'duyurular' && id === 'announcements') return <DuyurularAnnouncementsPreview g={g} isSel={isSel} onSel={onSel} />
  if (pageId === 'duyurular' && id === 'cta')           return <PTCtaPreview g={g} isSel={isSel} onSel={onSel} />
  // Generic sections
  if (id === 'hero')           return <HeroPreview g={g} isSel={isSel} onSel={onSel} />
  if (id === 'hero-tags')      return <HeroTagsPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (id === 'hero-stats')     return <HeroStatsPreview g={g} isSel={isSel} onSel={onSel} />
  if (id === 'about')          return <AboutPreview g={g} isSel={isSel} onSel={onSel} />
  if (id === 'services-grid')  return <ServicesGridPreview g={g} isSel={isSel} onSel={onSel} />
  if (id === 'fleet-banner')   return <FleetBannerPreview g={g} isSel={isSel} onSel={onSel} />
  if (id === 'references')     return <ReferencesLogoPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (id === 'testimonials')   return <TestimonialsPreview g={g} isSel={isSel} onSel={onSel} />
  if (id === 'faq')            return <FaqPreview g={g} isSel={isSel} onSel={onSel} pageId={pageId} sectionId={id} />
  if (id === 'newsletter')     return <NewsletterPreview g={g} isSel={isSel} onSel={onSel} />
  if (id === 'contact-info' || id === 'contact' || id === 'form-labels')
    return <ContactInfoPreview section={section} g={g} isSel={isSel} onSel={onSel} />
  if (id === 'gallery')        return <GalleryPreview section={section} g={g} isSel={isSel} onSel={onSel} />
  if (id === 'stats')          return <StatsPreview section={section} g={g} isSel={isSel} onSel={onSel} />
  return <GenericPreview section={section} g={g} isSel={isSel} onSel={onSel} />
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Editor
// ─────────────────────────────────────────────────────────────────────────────
export default function EditorPage() {
  const params  = useParams()
  const router  = useRouter()
  const slug    = params.slug as string
  const page    = getPageDef(slug)
  const { content, getField, updateField, save, unsaved, loading } = useAdmin()

  const [selField, setSelField]     = useState<SelField | null>(null)
  const [liveEdit, setLiveEdit]     = useState<LiveEdit | null>(null)
  const [saving, setSaving]         = useState(false)
  const [saveOk, setSaveOk]         = useState(false)
  const [activeLang, setActiveLang] = useState<ActiveLang>('tr')
  const [activeSec, setActiveSec]   = useState(page?.sections[0]?.id ?? '')
  const [translatingAll, setTranslatingAll] = useState(false)
  const [translateDone, setTranslateDone]   = useState(false)
  const [progress, setProgress]     = useState(0)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const previewRef  = useRef<HTMLDivElement>(null)

  // Getter: liveEdit → store → definitions fallback (content is never empty)
  function g(sectionId: string, fieldId: string): string {
    // Icon and image fields are language-independent — always read TR
    const isLangIndependent = fieldId.endsWith('_icon') || fieldId.endsWith('_img') || fieldId.startsWith('hero_img') || fieldId.startsWith('logo')
    const lang = isLangIndependent ? 'tr' : activeLang

    if (liveEdit?.sectionId === sectionId && liveEdit?.fieldId === fieldId) {
      return liveEdit[lang] ?? ''
    }
    const stored = getField(page!.id, sectionId, fieldId)
    const val = stored[lang] || (isLangIndependent ? stored.en : '')
    if (val) return val
    // Check if the field was explicitly set in the content map (even to empty).
    // If so, respect the empty value (e.g. after deletion) — don't fall back.
    const contentEntry = content[page!.id]?.[sectionId]?.[fieldId]
    if (contentEntry !== undefined) return ''
    // Only fall back to definition default if the field was never set
    const sec = page!.sections.find(s => s.id === sectionId)
    const fld = sec?.fields.find(f => f.id === fieldId)
    return (lang === 'tr' ? fld?.tr : fld?.en) ?? fld?.tr ?? ''
  }

  function handleSelect(sectionId: string, fieldId: string) {
    const section = page!.sections.find(s => s.id === sectionId)
    let field = section?.fields.find(f => f.id === fieldId)
    // For dynamically added fields (e.g. tag11+), create a synthetic field
    if (!field && section) {
      field = { id: fieldId, type: 'text', label: fieldId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), tr: '', en: '' }
    }
    if (!field) return
    const isSame  = selField?.sectionId === sectionId && selField?.field.id === fieldId
    if (isSame) { setSelField(null); setLiveEdit(null) }
    else { setSelField({ sectionId, field }); setLiveEdit(null) }
  }

  function handleLiveChange(tr: string, en: string) {
    if (!selField) return
    setLiveEdit({ sectionId: selField.sectionId, fieldId: selField.field.id, tr, en })
  }

  function scrollToSection(id: string) {
    setActiveSec(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleTranslateAll() {
    if (!page) return
    const section = page.sections.find(s => s.id === activeSec)
    if (!section) return

    const textFields = section.fields.filter(f => f.type !== 'image')
    if (textFields.length === 0) return

    setTranslatingAll(true)
    setProgress(0)

    for (let i = 0; i < textFields.length; i++) {
      const field = textFields[i]
      const current = getField(page.id, section.id, field.id)
      const trText = current.tr

      if (trText && trText.trim()) {
        try {
          const enText = await translateText(trText, 'tr', 'en')
          updateField(page.id, section.id, field.id, trText, enText)
        } catch {
          // Skip failed translations
        }
      }

      setProgress(Math.round(((i + 1) / textFields.length) * 100))
    }

    setTranslatingAll(false)
    setTranslateDone(true)
    setTimeout(() => setTranslateDone(false), 2500)
  }

  async function handleSave() {
    setSaving(true); await save(page?.id); setSaving(false); setSaveOk(true)
    setTimeout(() => setSaveOk(false), 2500)
  }

  // Scroll-spy: update activeSec as user scrolls the preview
  useEffect(() => {
    const el = previewRef.current; if (!el) return
    const captured = el
    function onScroll() {
      const scrollTop = captured.scrollTop + 100
      for (const id of Object.keys(sectionRefs.current).reverse()) {
        const ref = sectionRefs.current[id]; if (!ref) continue
        if (ref.offsetTop <= scrollTop) { setActiveSec(id); break }
      }
    }
    captured.addEventListener('scroll', onScroll, { passive: true })
    return () => captured.removeEventListener('scroll', onScroll)
  }, [page?.sections])

  // ── Early returns AFTER all hooks ──
  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">İçerik yükleniyor...</p>
      </div>
    </div>
  )

  if (!page) return (
    <div className="flex items-center justify-center h-full text-gray-400">
      <div className="text-center">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Sayfa bulunamadı: <code className="text-amber-500">{slug}</code></p>
        <button onClick={() => router.push('/admin/pages')} className="mt-4 text-sm text-amber-500 hover:underline">← Geri dön</button>
      </div>
    </div>
  )

  // ── Special: Footer live editor ──
  if (slug === 'footer') {
    const br  = (f: string, fb: string) => g('brand', f, fb)
    const ct  = (f: string, fb: string) => g('col_titles', f, fb)
    const sections = page!.sections

    return (
      <div className="h-screen flex flex-col bg-[#F7F7F8] overflow-hidden">
        {/* ── Top Bar ── */}
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white border-b border-gray-200 flex-shrink-0 shadow-sm z-10">
          <button onClick={() => router.push('/admin/pages')}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /><span>Sayfalar</span>
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <p className="text-gray-900 text-sm font-bold">Footer Editörü</p>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Canlı Önizleme</span>
          </div>
          <button
            onClick={async () => { setSaving(true); await save('footer'); setSaving(false); setSaveOk(true); setTimeout(() => setSaveOk(false), 2000) }}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : saveOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saveOk ? 'Kaydedildi!' : 'Kaydet'}
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-56 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto py-3">
            <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Bölümler</p>
            {sections.map(sec => (
              <button key={sec.id} onClick={() => scrollToSection(sec.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors text-sm ${
                  activeSec === sec.id ? 'bg-amber-50 text-amber-700 font-semibold border-r-2 border-amber-500' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                <span className="text-base leading-none">{sec.icon}</span>
                <span className="truncate">{sec.label}</span>
              </button>
            ))}
          </div>

          {/* Main area */}
          <div ref={previewRef} className="flex-1 overflow-y-auto">

            {/* ── FOOTER PREVIEW ── */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
              <div className="bg-white px-8 py-6 border-b border-gray-100">
                <div className="grid grid-cols-6 gap-4 items-start">
                  {/* Brand col */}
                  <div className="col-span-2">
                    <div className="mb-3">
                      <div className="h-9 w-28 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400 font-bold">LOGO</div>
                    </div>
                    <E active={selField?.sectionId==='brand' && selField?.field.id==='description'}
                      onSelect={() => { const f = sections.find(s=>s.id==='brand')?.fields.find(f=>f.id==='description'); if(f) setSelField({sectionId:'brand', field:f}) }}
                      className="cursor-pointer mb-3">
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                        {br('description','40 yılı aşkın süredir...')}
                      </p>
                    </E>
                    <div className="space-y-1.5">
                      {[
                        { id:'phone', sec:'brand', fb:'444 1 289', icon:'📞' },
                        { id:'email', sec:'brand', fb:'info@cityturizm.com', icon:'✉' },
                        { id:'hours', sec:'brand', fb:'Pzt–Cmt 09:00–18:00', icon:'🕒' },
                      ].map(f => (
                        <E key={f.id} active={selField?.sectionId===f.sec && selField?.field.id===f.id}
                          onSelect={() => { const field = sections.find(s=>s.id===f.sec)?.fields.find(ff=>ff.id===f.id); if(field) setSelField({sectionId:f.sec, field}) }}
                          className="cursor-pointer flex items-center gap-1.5">
                          <span className="text-xs">{f.icon}</span>
                          <span className="text-xs text-gray-500">{br(f.id, f.fb)}</span>
                        </E>
                      ))}
                    </div>
                  </div>
                  {/* Nav columns */}
                  {[
                    { key: 'kurumsal_title', fb: 'Kurumsal' },
                    { key: 'hizmetler_title', fb: 'Hizmetler' },
                    { key: 'basvuru_title', fb: 'Başvuru' },
                    { key: 'yasal_title', fb: 'Yasal Bilgilendirme' },
                  ].map(col => (
                    <div key={col.key}>
                      <E active={selField?.sectionId==='col_titles' && selField?.field.id===col.key}
                        onSelect={() => { const f = sections.find(s=>s.id==='col_titles')?.fields.find(f=>f.id===col.key); if(f) setSelField({sectionId:'col_titles', field:f}) }}
                        className="cursor-pointer mb-3">
                        <p className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-1.5">{ct(col.key, col.fb)}</p>
                      </E>
                      <div className="space-y-1">
                        {[1,2,3].map(i => (
                          <div key={i} className="h-2 bg-gray-100 rounded-full w-3/4" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Bottom bar preview */}
              <div className="px-8 py-3 flex justify-between items-center bg-gray-50">
                <E active={selField?.sectionId==='bottom' && selField?.field.id==='copyright'}
                  onSelect={() => { const f = sections.find(s=>s.id==='bottom')?.fields.find(f=>f.id==='copyright'); if(f) setSelField({sectionId:'bottom', field:f}) }}
                  className="cursor-pointer">
                  <span className="text-xs text-gray-400">{g('bottom','copyright','© 2025 City Turizm')}</span>
                </E>
                <E active={selField?.sectionId==='bottom' && selField?.field.id==='tagline'}
                  onSelect={() => { const f = sections.find(s=>s.id==='bottom')?.fields.find(f=>f.id==='tagline'); if(f) setSelField({sectionId:'bottom', field:f}) }}
                  className="cursor-pointer">
                  <span className="text-xs text-gray-400">{g('bottom','tagline','Taşıdığımız en önemli şey güveniniz.')}</span>
                </E>
              </div>
            </div>

            {/* Field cards */}
            <div className="p-6 space-y-6 max-w-4xl mx-auto">
              <p className="text-xs text-gray-400 text-center pt-2">Yukarıdaki önizlemede alana tıklayın veya aşağıdan bölüm seçin</p>

              {sections.map(sec => (
                <div key={sec.id} ref={el => { sectionRefs.current[sec.id] = el }}>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span>{sec.icon}</span> {sec.label}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {sec.fields.map(field => (
                      <E key={field.id}
                        active={selField?.sectionId===sec.id && selField?.field.id===field.id}
                        onSelect={() => setSelField({sectionId: sec.id, field})}
                        className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{field.label}</p>
                        <p className="text-sm text-gray-800 truncate">{g(sec.id, field.id, field.tr) || '—'}</p>
                      </E>
                    ))}
                  </div>
                </div>
              ))}
              <div className="h-16" />
            </div>
          </div>
        </div>

        {/* Edit Panel */}
        <AnimatePresence>
          {selField && (
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl border-l border-gray-200 z-50 overflow-y-auto"
            >
              <EditPanel
                key={`${selField.sectionId}.${selField.field.id}`}
                field={selField.field} pageId={slug} sectionId={selField.sectionId}
                onClose={() => { setSelField(null); setLiveEdit(null) }}
                onLiveChange={handleLiveChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ── Special: Navbar (Üst Menü) live editor ──
  if (slug === 'ust-menu') {
    // Helpers for the preview
    const tb = (f: string, fb: string) => g('topbar', f, fb)
    const sc = (f: string, fb: string) => g('social', f, fb)
    const nv = (f: string, fb: string) => g('nav', f, fb)
    const ct = (f: string, fb: string) => g('cta', f, fb)
    const hm = (f: string, fb: string) => g('hizmetler_menu', f, fb)
    const km = (f: string, fb: string) => g('kurumsal_menu', f, fb)

    const isSel = (sec: string, fid: string) => selField?.sectionId === sec && selField?.field.id === fid
    const onSel = (sec: string, fid: string) => handleSelect(sec, fid)

    const sections = page!.sections

    return (
      <div className="h-screen flex flex-col bg-[#F7F7F8] overflow-hidden">
        {/* ── Top Bar ── */}
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white border-b border-gray-200 flex-shrink-0 shadow-sm z-10">
          <button onClick={() => router.push('/admin/pages')}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /><span>Sayfalar</span>
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
              <Menu className="w-4 h-4 text-white" />
            </div>
            <p className="text-gray-900 text-sm font-bold">Üst Menü Editörü</p>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Canlı Önizleme</span>
          </div>
          <button
            onClick={async () => { setSaving(true); await save('ust-menu'); setSaving(false); setSaveOk(true); setTimeout(() => setSaveOk(false), 2000) }}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : saveOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saveOk ? 'Kaydedildi!' : 'Kaydet'}
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* ── Left Sidebar: Section list ── */}
          <div className="w-56 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto py-3">
            <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Bölümler</p>
            {sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors text-sm ${
                  activeSec === sec.id ? 'bg-amber-50 text-amber-700 font-semibold border-r-2 border-amber-500' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-base leading-none">{sec.icon}</span>
                <span className="truncate">{sec.label}</span>
              </button>
            ))}
          </div>

          {/* ── Main: Preview + Fields ── */}
          <div ref={previewRef} className="flex-1 overflow-y-auto" onScroll={() => {}}>

            {/* ── NAVBAR LIVE PREVIEW ── */}
            <div className="sticky top-0 z-20 border-b border-gray-200 shadow-md bg-white">
              {/* Topbar preview */}
              <div
                ref={el => { sectionRefs.current['topbar'] = el }}
                className="bg-amber-500 text-white text-xs py-1.5 px-4 flex items-center justify-between cursor-pointer hover:brightness-95 transition-all"
                onClick={() => onSel('topbar', 'phone1')}
              >
                <div className="flex items-center gap-3">
                  <E active={isSel('topbar','phone1')} onSelect={() => onSel('topbar','phone1')} inline className="font-black text-sm">
                    {tb('phone1','444 1 289')}
                  </E>
                  <span className="opacity-40">|</span>
                  <E active={isSel('topbar','phone2')} onSelect={() => onSel('topbar','phone2')} inline>
                    {tb('phone2','+90 212 543 80 97')}
                  </E>
                  <span className="opacity-40">|</span>
                  <E active={isSel('topbar','phone3')} onSelect={() => onSel('topbar','phone3')} inline>
                    {tb('phone3','+90 212 583 61 61')}
                  </E>
                  <span className="opacity-40">|</span>
                  <E active={isSel('topbar','hours')} onSelect={() => onSel('topbar','hours')} inline>
                    {tb('hours','Pzt – Cmt: 09:00 – 18:00')}
                  </E>
                </div>
                <div
                  ref={el => { sectionRefs.current['social'] = el }}
                  className="flex items-center gap-2"
                >
                  {['facebook','instagram','youtube','linkedin'].map(k => (
                    <E key={k} active={isSel('social',k)} onSelect={() => onSel('social',k)} inline
                      className="w-5 h-5 rounded bg-white/20 flex items-center justify-center text-[10px] font-bold cursor-pointer">
                      {k[0].toUpperCase()}
                    </E>
                  ))}
                </div>
              </div>

              {/* Main nav preview */}
              <div className="flex items-center justify-between px-6 h-14 bg-white border-b border-gray-100">
                <div className="flex items-center gap-1">
                  <div
                    ref={el => { sectionRefs.current['nav'] = el }}
                    className="flex items-center gap-1"
                  >
                    {[
                      { key: 'kurumsal_label', fb: 'Kurumsal' },
                      { key: 'hizmetler_label', fb: 'Hizmetler' },
                      { key: 'medya_label', fb: 'Medya' },
                      { key: 'duyurular_label', fb: 'Duyurular' },
                      { key: 'iletisim_label', fb: 'İletişim' },
                    ].map(item => (
                      <E key={item.key} active={isSel('nav', item.key)} onSelect={() => onSel('nav', item.key)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 cursor-pointer">
                        {nv(item.key, item.fb)}
                      </E>
                    ))}
                  </div>
                </div>
                <div
                  ref={el => { sectionRefs.current['cta'] = el }}
                  className="flex items-center gap-2"
                >
                  <E active={isSel('cta','btn1_label')} onSelect={() => onSel('cta','btn1_label')}
                    className="text-sm font-semibold text-gray-700 border border-gray-200 px-3 py-1.5 rounded-xl cursor-pointer">
                    {ct('btn1_label','Başvuru')}
                  </E>
                  <E active={isSel('cta','btn2_label')} onSelect={() => onSel('cta','btn2_label')}
                    className="text-sm font-bold text-white bg-amber-500 px-4 py-1.5 rounded-xl cursor-pointer">
                    {ct('btn2_label','Teklif Al')}
                  </E>
                </div>
              </div>
            </div>

            {/* ── FIELD SECTIONS ── */}
            <div className="p-6 space-y-6 max-w-3xl mx-auto">
              <p className="text-xs text-gray-400 text-center pt-2">Yukarıdaki önizlemede bir alana tıklayın veya aşağıdan düzenleyin</p>

              {/* Topbar section */}
              <div ref={el => { /* already set above */ }}>
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span>🟠</span> Turuncu Üst Bar
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'phone1', label: 'Telefon 1' }, { id: 'phone1_href', label: 'Tel 1 Link' },
                    { id: 'phone2', label: 'Telefon 2' }, { id: 'phone2_href', label: 'Tel 2 Link' },
                    { id: 'phone3', label: 'Telefon 3' }, { id: 'phone3_href', label: 'Tel 3 Link' },
                    { id: 'hours', label: 'Çalışma Saatleri' },
                  ].map(f => (
                    <E key={f.id} active={isSel('topbar',f.id)} onSelect={() => onSel('topbar',f.id)}
                      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{f.label}</p>
                      <p className="text-sm text-gray-800 font-medium truncate">{tb(f.id, '—')}</p>
                    </E>
                  ))}
                </div>
              </div>

              {/* Social section */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span>📣</span> Sosyal Medya Linkleri
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {['facebook','instagram','youtube','linkedin'].map(k => (
                    <E key={k} active={isSel('social',k)} onSelect={() => onSel('social',k)}
                      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{k}</p>
                      <p className="text-xs text-gray-600 truncate">{sc(k, `https://${k}.com`)}</p>
                    </E>
                  ))}
                </div>
              </div>

              {/* Nav labels section */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span>🔗</span> Navigasyon Etiketleri
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'kurumsal_label', fb: 'Kurumsal' },
                    { id: 'hizmetler_label', fb: 'Hizmetler' },
                    { id: 'medya_label', fb: 'Medya' },
                    { id: 'duyurular_label', fb: 'Duyurular' },
                    { id: 'iletisim_label', fb: 'İletişim' },
                  ].map(f => (
                    <E key={f.id} active={isSel('nav',f.id)} onSelect={() => onSel('nav',f.id)}
                      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{f.id.replace('_label','')}</p>
                      <p className="text-sm font-bold text-gray-800">{nv(f.id, f.fb)}</p>
                    </E>
                  ))}
                </div>
              </div>

              {/* CTA section */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span>🎯</span> CTA Butonları
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'btn1_label', label: 'Buton 1 Yazı' }, { id: 'btn1_href', label: 'Buton 1 Link' },
                    { id: 'btn2_label', label: 'Buton 2 Yazı' }, { id: 'btn2_href', label: 'Buton 2 Link' },
                  ].map(f => (
                    <E key={f.id} active={isSel('cta',f.id)} onSelect={() => onSel('cta',f.id)}
                      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{f.label}</p>
                      <p className="text-sm font-bold text-gray-800">{ct(f.id, '—')}</p>
                    </E>
                  ))}
                </div>
              </div>

              {/* Hizmetler dropdown */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span>🚌</span> Hizmetler Dropdown
                </h3>
                {['personel','ogrenci','transfer','arac','turizm','akaryakit'].map((k, i) => {
                  const labels = ['Personel Taşımacılığı','Öğrenci Taşımacılığı','Özel Transfer Hizmetleri','Araç Kiralama','Turizm Acenteliği','Akaryakıt İstasyonu']
                  return (
                    <div key={k} className="bg-white border border-gray-200 rounded-xl p-4 mb-2 grid grid-cols-3 gap-3">
                      <E active={isSel('hizmetler_menu',`${k}_label`)} onSelect={() => onSel('hizmetler_menu',`${k}_label`)}
                        className="cursor-pointer">
                        <p className="text-[10px] text-gray-400 font-bold mb-0.5">ETİKET</p>
                        <p className="text-sm font-semibold text-gray-800">{hm(`${k}_label`, labels[i])}</p>
                      </E>
                      <E active={isSel('hizmetler_menu',`${k}_desc`)} onSelect={() => onSel('hizmetler_menu',`${k}_desc`)}
                        className="cursor-pointer">
                        <p className="text-[10px] text-gray-400 font-bold mb-0.5">AÇIKLAMA</p>
                        <p className="text-xs text-gray-500">{hm(`${k}_desc`, '—')}</p>
                      </E>
                      <E active={isSel('hizmetler_menu',`${k}_href`)} onSelect={() => onSel('hizmetler_menu',`${k}_href`)}
                        className="cursor-pointer">
                        <p className="text-[10px] text-gray-400 font-bold mb-0.5">LİNK</p>
                        <p className="text-xs text-blue-500 truncate">{hm(`${k}_href`, '—')}</p>
                      </E>
                    </div>
                  )
                })}
              </div>

              {/* Kurumsal dropdown */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span>🏢</span> Kurumsal Dropdown
                </h3>
                {[
                  { k:'bizkimiz', fb:'Biz Kimiz' }, { k:'baskan', fb:'Başkanın Mesajı' },
                  { k:'sirket', fb:'Şirket Profili' }, { k:'kalite', fb:'Kalite Politikası' },
                  { k:'cevre', fb:'Çevre & Su Politikaları' }, { k:'ik', fb:'İnsan Kaynakları' },
                  { k:'filo', fb:'Araç Filosu' }, { k:'isg', fb:'İş Sağlığı ve Güvenliği' },
                  { k:'kvkk', fb:'KVKK' }, { k:'gizlilik', fb:'Gizlilik ve Güvenlik' },
                  { k:'kullanim', fb:'Kullanım Koşulları' }, { k:'cerez', fb:'Çerez Politikası' },
                ].map(({ k, fb }) => (
                  <div key={k} className="bg-white border border-gray-200 rounded-xl p-4 mb-2 grid grid-cols-3 gap-3">
                    <E active={isSel('kurumsal_menu',`${k}_label`)} onSelect={() => onSel('kurumsal_menu',`${k}_label`)}
                      className="cursor-pointer">
                      <p className="text-[10px] text-gray-400 font-bold mb-0.5">ETİKET</p>
                      <p className="text-sm font-semibold text-gray-800">{km(`${k}_label`, fb)}</p>
                    </E>
                    <E active={isSel('kurumsal_menu',`${k}_desc`)} onSelect={() => onSel('kurumsal_menu',`${k}_desc`)}
                      className="cursor-pointer">
                      <p className="text-[10px] text-gray-400 font-bold mb-0.5">AÇIKLAMA</p>
                      <p className="text-xs text-gray-500">{km(`${k}_desc`, '—')}</p>
                    </E>
                    <E active={isSel('kurumsal_menu',`${k}_href`)} onSelect={() => onSel('kurumsal_menu',`${k}_href`)}
                      className="cursor-pointer">
                      <p className="text-[10px] text-gray-400 font-bold mb-0.5">LİNK</p>
                      <p className="text-xs text-blue-500 truncate">{km(`${k}_href`, '—')}</p>
                    </E>
                  </div>
                ))}
              </div>

              <div className="h-16" />
            </div>
          </div>
        </div>

        {/* Edit Panel */}
        <AnimatePresence>
          {selField && (
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl border-l border-gray-200 z-50 overflow-y-auto"
            >
              <EditPanel
                key={`${selField.sectionId}.${selField.field.id}`}
                field={selField.field} pageId={slug} sectionId={selField.sectionId}
                onClose={() => { setSelField(null); setLiveEdit(null) }}
                onLiveChange={handleLiveChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ── Special: WhatsApp settings page ──
  if (slug === 'whatsapp') {
    const phone   = g('contact', 'phone')
    const message = g('contact', 'message')
    const isSel   = (fId: string) => selField?.sectionId === 'contact' && selField?.field.id === fId
    const onSel   = (fId: string) => handleSelect('contact', fId)

    return (
      <div className="h-screen flex flex-col bg-[#F7F7F8] overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white border-b border-gray-200 flex-shrink-0 shadow-sm z-10">
          <button onClick={() => router.push('/admin/pages')}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /><span>Sayfalar</span>
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#25D366' }}>
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <p className="text-gray-900 text-sm font-bold">WhatsApp İletişim Ayarları</p>
          </div>
          <button
            onClick={async () => { setSaving(true); await save('whatsapp'); setSaving(false); setSaveOk(true); setTimeout(() => setSaveOk(false), 2000) }}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : saveOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saveOk ? 'Kaydedildi!' : 'Kaydet'}
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto py-12 px-6 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#25D366' }}>
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm mb-1">WhatsApp Butonu</p>
                <p className="text-xs text-gray-500 leading-relaxed">Siteyi ziyaret eden kullanıcıların sağ alt köşesinde sabit bir WhatsApp butonu görünür. Aşağıya numara girdiğinizde buton aktif olur.</p>
              </div>
            </div>

            <E active={isSel('phone')} onSelect={() => onSel('phone')} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Telefon Numarası</label>
              <p className="text-xs text-gray-400 mb-3">Örnek: <code className="bg-gray-100 px-1.5 py-0.5 rounded">05XX XXX XX XX</code></p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <span className="text-xl">📱</span>
                <span className="text-base font-semibold text-gray-900">{phone || <span className="text-gray-400 font-normal italic">Numara girilmedi — tıklayın</span>}</span>
              </div>
            </E>

            <E active={isSel('message')} onSelect={() => onSel('message')} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Ön Mesaj (Opsiyonel)</label>
              <p className="text-xs text-gray-400 mb-3">WhatsApp açıldığında metin kutusuna otomatik yazılır.</p>
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <p className="text-sm text-gray-700">{message || <span className="text-gray-400 italic">Ön mesaj girilmedi</span>}</p>
              </div>
            </E>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Önizleme</p>
              <div className="relative bg-gray-100 rounded-xl h-36 flex items-end justify-end p-4">
                <p className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">Site içeriği burada görünür</p>
                <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg relative" style={{ background: '#25D366' }}>
                  <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-30" />
                  <svg className="w-7 h-7 relative z-10" fill="white" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
              </div>
              {phone && (
                <p className="text-xs text-center text-green-600 font-semibold mt-3">
                  ✅ Buton aktif → wa.me/{phone.replace(/\D/g, '').replace(/^0/, '90')}
                </p>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selField && (
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl border-l border-gray-200 z-50 overflow-y-auto"
            >
              <EditPanel
                key={`${selField.sectionId}.${selField.field.id}`}
                field={selField.field} pageId={slug} sectionId={selField.sectionId}
                onClose={() => { setSelField(null); setLiveEdit(null) }}
                onLiveChange={handleLiveChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#F7F7F8] overflow-hidden">

      {/* ── Top Bar ── */}
      <div className="flex items-center gap-3 px-5 py-2.5 bg-white border-b border-gray-200 flex-shrink-0 shadow-sm z-10">
        <button onClick={() => router.push('/admin/pages')}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Sayfalar</span>
        </button>
        <div className="w-px h-5 bg-gray-200" />
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="min-w-0">
            <p className="text-gray-900 text-sm font-bold truncate leading-tight">{page!.title}</p>
            <p className="text-gray-400 text-base font-mono hidden sm:block">{page!.path}</p>
          </div>
        </div>

        {/* Language toggle */}
        <div className="flex items-center bg-gray-100 rounded-xl p-0.5">
          {(['tr','en'] as ActiveLang[]).map(lang => (
            <button key={lang} onClick={() => setActiveLang(lang)}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all',
                activeLang === lang ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700')}>
              {lang === 'tr' ? '🇹🇷' : '🇬🇧'} <span className="hidden sm:inline">{lang === 'tr' ? 'Türkçe' : 'English'}</span>
            </button>
          ))}
        </div>


        {unsaved && (
          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="hidden sm:inline">Kaydedilmemiş</span>
          </div>
        )}

        <button onClick={handleSave} disabled={saving}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex-shrink-0',
            saveOk ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/20 hover:-translate-y-0.5')}>
          {saving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Kaydediyor</>
            : saveOk ? <><CheckCircle2 className="w-3.5 h-3.5" />Kaydedildi</>
            : <><Save className="w-3.5 h-3.5" /><span className="hidden sm:inline">Kaydet</span></>}
        </button>

        <Link href={page!.path} target="_blank"
          className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0">
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Section nav — icon + label */}
        <div className="w-44 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col py-2 gap-0.5 overflow-y-auto">
          {page!.sections.map(s => (
            <button key={s.id} onClick={() => scrollToSection(s.id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 mx-2 rounded-xl transition-all duration-150 text-left',
                activeSec === s.id
                  ? 'bg-amber-50 ring-1 ring-amber-200 shadow-sm'
                  : 'hover:bg-gray-50 active:scale-[0.98]'
              )}>
              <span className={cn('text-lg flex-shrink-0 transition-transform', activeSec === s.id && 'scale-110')}>{s.icon}</span>
              <span className={cn('text-xs font-semibold leading-tight truncate', activeSec === s.id ? 'text-amber-700' : 'text-gray-500')}>
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── Live page preview — all sections stacked ── */}
        <div ref={previewRef} className="flex-1 overflow-y-auto p-6 space-y-6 min-w-0">
          {page!.sections.map(section => {
            const gSec    = (fid: string) => g(section.id, fid)
            const isSelSec = (fid: string) => selField?.sectionId === section.id && selField?.field.id === fid
            const onSelSec = (fid: string) => handleSelect(section.id, fid)
            return (
              <div
                key={section.id}
                ref={el => { sectionRefs.current[section.id] = el }}
                className="scroll-mt-4"
              >
                {/* Section label */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-lg">{section.icon}</span>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{section.label}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <SectionPreviewRouter
                  section={section}
                  g={gSec}
                  isSel={isSelSec}
                  onSel={onSelSec}
                  pageId={page!.id}
                />
              </div>
            )
          })}
          <div className="h-24" />
        </div>

        {/* ── Edit panel ── */}
        <AnimatePresence mode="wait">
          {selField ? (
            <EditPanel
              key={`${selField.sectionId}__${selField.field.id}`}
              field={selField.field}
              pageId={page!.id}
              sectionId={selField.sectionId}
              onClose={() => { setSelField(null); setLiveEdit(null) }}
              onLiveChange={handleLiveChange}
            />
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-[360px] flex-shrink-0 bg-white border-l border-gray-100 flex items-center justify-center"
            >
              <div className="text-center px-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center mx-auto mb-5">
                  <Pencil className="w-7 h-7 text-amber-400" />
                </div>
                <p className="text-gray-800 text-sm font-bold mb-2">Bir elemana tıklayın</p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Soldaki sayfa önizlemesinde herhangi bir metin veya görsele tıklayarak anında düzenleyin.
                </p>
                <div className="mt-5 space-y-2 text-left">
                  {[
                    ['🖱️', 'Tıkla — seç'],
                    ['⌨️', 'Yaz — canlı güncellenir'],
                    ['🌐', 'Çevir — otomatik EN'],
                    ['💾', 'Kaydet — yayınla'],
                  ].map(([icon, label]) => (
                    <div key={label} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 text-xs text-gray-500">
                      <span className="text-sm">{icon}</span> {label}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
