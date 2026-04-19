'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Share2, Code2, BarChart3, Globe, Shield, MapPin,
  Zap, Save, RefreshCw, Check, AlertCircle, ExternalLink,
  ChevronDown, ChevronRight, Info, Copy,
  AtSign, Link, FileText, Bot,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────
type Settings = Record<string, string>

interface Section {
  id: string
  title: string
  subtitle: string
  icon: React.ElementType
  color: string
  fields: Field[]
}

interface Field {
  key: string
  label: string
  type: 'text' | 'textarea' | 'toggle' | 'select' | 'code' | 'url' | 'color'
  placeholder?: string
  hint?: string
  options?: string[]
  maxLength?: number
  rows?: number
}

// ── SEO Schema Definition ─────────────────────────────────────────────────────
const SECTIONS: Section[] = [
  {
    id: 'meta',
    title: 'Meta Etiketler',
    subtitle: 'Temel site başlığı, açıklaması ve anahtar kelimeler',
    icon: Search,
    color: 'from-blue-500 to-indigo-600',
    fields: [
      { key: 'site_name',        label: 'Site Adı',          type: 'text',     placeholder: 'City Turizm',                                   hint: 'Tüm sayfalarda başlık template\'inde kullanılır' },
      { key: 'site_url',         label: 'Site URL',           type: 'url',      placeholder: 'https://cityturizm.com',                        hint: 'Canonical URL tabanı — sonunda / olmadan' },
      { key: 'site_language',    label: 'Dil Kodu',           type: 'select',   options: ['tr','en','tr,en'],                                  hint: 'HTML lang attribute' },
      { key: 'meta_title',       label: 'Meta Başlık',        type: 'text',     placeholder: 'City Turizm | Yurt İçi ve Yurt Dışı Tur Paketleri', maxLength: 60, hint: 'Google\'da görünen başlık (maks. 60 karakter)' },
      { key: 'meta_description', label: 'Meta Açıklama',      type: 'textarea', placeholder: '40 yıllık deneyimle ulaşım ve turizm hizmetleri...', maxLength: 160, rows: 3, hint: 'Arama sonucunda görünen açıklama (maks. 160 karakter)' },
      { key: 'meta_keywords',    label: 'Anahtar Kelimeler',  type: 'textarea', placeholder: 'city turizm, personel taşımacılığı, istanbul',  rows: 2, hint: 'Virgülle ayrılmış anahtar kelimeler' },
      { key: 'meta_author',      label: 'Yazar',              type: 'text',     placeholder: 'City Turizm A.Ş.' },
      { key: 'meta_theme_color', label: 'Tema Rengi',         type: 'color',    placeholder: '#F59E0B',                                        hint: 'Mobil tarayıcı adres çubuğu rengi' },
      { key: 'canonical_url',    label: 'Canonical URL',      type: 'url',      placeholder: 'https://cityturizm.com',                        hint: 'Boş bırakılırsa site_url kullanılır' },
      { key: 'robots_noindex',   label: 'Noindex (görünmez)', type: 'toggle',   hint: 'Etkinleştirilirse site Google\'da görünmez!' },
      { key: 'robots_nofollow',  label: 'Nofollow',           type: 'toggle',   hint: 'Etkinleştirilirse linklerin linki aktarılmaz' },
    ],
  },
  {
    id: 'og',
    title: 'Open Graph & Sosyal Medya',
    subtitle: 'Facebook, WhatsApp, LinkedIn paylaşım görüntüleme ayarları',
    icon: Share2,
    color: 'from-purple-500 to-pink-600',
    fields: [
      { key: 'og_title',       label: 'OG Başlık',       type: 'text',     placeholder: 'City Turizm – Güvenilir Ulaşım Çözümleri', maxLength: 60,  hint: 'Paylaşımda görünen başlık (boş = meta_title)' },
      { key: 'og_description', label: 'OG Açıklama',     type: 'textarea', placeholder: 'Personel taşımacılığı, özel transfer...',   maxLength: 200, rows: 3, hint: 'Paylaşımda görünen açıklama (boş = meta_description)' },
      { key: 'og_image',       label: 'OG Resim URL',    type: 'url',      placeholder: 'https://cityturizm.com/og-image.jpg',      hint: '1200×630 px önerilen boyut (JPG veya PNG)' },
      { key: 'og_image_alt',   label: 'OG Resim Alt',    type: 'text',     placeholder: 'City Turizm – Ulaşım Hizmetleri' },
      { key: 'og_locale',      label: 'OG Locale',       type: 'select',   options: ['tr_TR','en_US','tr_TR,en_US'],                hint: 'Paylaşım dil bölgesi' },
      { key: 'fb_app_id',      label: 'Facebook App ID', type: 'text',     placeholder: '123456789012345',                          hint: 'Facebook Insights için gerekli' },
      { key: 'twitter_handle', label: 'Twitter Handle',  type: 'text',     placeholder: '@cityturizm',                             hint: 'Twitter Card için' },
    ],
  },
  {
    id: 'tracking',
    title: 'Google & Analitik',
    subtitle: 'GA4, GTM, Search Console ve diğer tracking araçları',
    icon: BarChart3,
    color: 'from-green-500 to-emerald-600',
    fields: [
      { key: 'ga4_id',                  label: 'Google Analytics 4 (Ölçüm ID)', type: 'text', placeholder: 'G-XXXXXXXXXX',         hint: 'GA4 ölçüm ID — örn: G-ABC123DEF' },
      { key: 'gtm_id',                  label: 'Google Tag Manager (Container)', type: 'text', placeholder: 'GTM-XXXXXXX',          hint: 'GTM container ID — örn: GTM-ABCDEF' },
      { key: 'google_site_verification',label: 'Google Search Console Doğrulama', type: 'text', placeholder: 'abc123xyz...',       hint: 'Google Search Console HTML tag doğrulama kodu' },
      { key: 'msvalidate',              label: 'Bing Webmaster Doğrulama',       type: 'text', placeholder: 'ABC123...',            hint: 'Bing/msvalidate.01 kodu' },
      { key: 'yandex_verification',     label: 'Yandex Webmaster Doğrulama',    type: 'text', placeholder: 'abc123...',            hint: 'Yandex doğrulama kodu' },
      { key: 'fb_pixel_id',             label: 'Facebook Pixel ID',              type: 'text', placeholder: '1234567890',           hint: 'Meta/Facebook reklam pixel ID' },
    ],
  },
  {
    id: 'schema',
    title: 'Yapılandırılmış Veri (JSON-LD)',
    subtitle: 'Google rich snippets için şirket ve yerel işletme bilgileri',
    icon: Code2,
    color: 'from-orange-500 to-amber-600',
    fields: [
      { key: 'schema_org_name',      label: 'Şirket Adı',          type: 'text',   placeholder: 'City Turizm A.Ş.' },
      { key: 'schema_org_phone',     label: 'Telefon',             type: 'text',   placeholder: '+90 212 543 80 97',          hint: 'E.164 formatında (+905xx)' },
      { key: 'schema_org_email',     label: 'E-posta',             type: 'text',   placeholder: 'info@cityturizm.com' },
      { key: 'schema_org_logo',      label: 'Logo URL',            type: 'url',    placeholder: 'https://cityturizm.com/logo.png', hint: 'Şirket logosu (Google Knowledge Panel)' },
      { key: 'schema_org_street',    label: 'Sokak / Adres',       type: 'text',   placeholder: 'Örnek Cad. No:1' },
      { key: 'schema_org_city',      label: 'Şehir',               type: 'text',   placeholder: 'İstanbul' },
      { key: 'schema_org_country',   label: 'Ülke Kodu',           type: 'select', options: ['TR','US','DE','GB','FR'] },
      { key: 'schema_local_business',label: 'LocalBusiness Şeması Ekle', type: 'toggle', hint: 'Harita ve yerel aramalar için önerilir' },
      { key: 'schema_price_range',   label: 'Fiyat Aralığı',       type: 'select', options: ['₺','₺₺','₺₺₺','₺₺₺₺'] },
      { key: 'schema_opening_hours', label: 'Çalışma Saatleri',    type: 'text',   placeholder: 'Mo-Sa 09:00-18:00',          hint: 'Schema.org formatında' },
    ],
  },
  {
    id: 'social',
    title: 'Sosyal Medya Hesapları',
    subtitle: 'Knowledge Graph ve yapılandırılmış veri için sosyal profiller',
    icon: Globe,
    color: 'from-cyan-500 to-blue-600',
    fields: [
      { key: 'social_instagram', label: 'Instagram',  type: 'text', placeholder: '@cityturizm' },
      { key: 'social_facebook',  label: 'Facebook',   type: 'text', placeholder: 'cityturizm' },
      { key: 'social_twitter',   label: 'Twitter/X',  type: 'text', placeholder: '@cityturizm' },
      { key: 'social_linkedin',  label: 'LinkedIn',   type: 'text', placeholder: 'city-turizm' },
      { key: 'social_youtube',   label: 'YouTube',    type: 'text', placeholder: '@cityturizm' },
    ],
  },
  {
    id: 'custom_code',
    title: 'Özel Kod Enjeksiyonu',
    subtitle: '<head> ve <body> etiketlerine özel script/kod ekleme',
    icon: Zap,
    color: 'from-red-500 to-rose-600',
    fields: [
      { key: 'custom_head_code', label: '<head> İçine Kod',  type: 'code', rows: 8, placeholder: '<!-- Örnek: Hotjar, Clarity, vs. -->\n<script>/* ... */</script>', hint: '</head> kapanış etiketinden önce eklenir' },
      { key: 'custom_body_code', label: '<body> Sonu Kodu',  type: 'code', rows: 8, placeholder: '<!-- Örnek: Chat widget, retargeting -->\n<script>/* ... */</script>', hint: '</body> kapanış etiketinden önce eklenir' },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 80) return 'text-green-600 bg-green-50'
  if (score >= 50) return 'text-amber-600 bg-amber-50'
  return 'text-red-600 bg-red-50'
}

function scoreBg(score: number) {
  if (score >= 80) return 'bg-green-500'
  if (score >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

function calcScore(settings: Settings): number {
  const checks = [
    !!settings.meta_title,
    !!settings.meta_description,
    !!settings.meta_keywords,
    !!settings.og_title || !!settings.meta_title,
    !!settings.og_description || !!settings.meta_description,
    !!settings.og_image,
    !!settings.ga4_id || !!settings.gtm_id,
    !!settings.google_site_verification,
    !!settings.schema_org_name,
    !!settings.schema_org_phone,
    !!settings.schema_org_email,
    !!settings.site_url,
    !!settings.schema_org_logo,
    settings.robots_noindex !== 'true',
    !!settings.social_instagram || !!settings.social_facebook,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

// ── Field Component ──────────────────────────────────────────────────────────
function FieldInput({ field, value, onChange }: {
  field: Field
  value: string
  onChange: (v: string) => void
}) {
  const charLeft = field.maxLength ? field.maxLength - (value?.length || 0) : null
  const charWarn = charLeft !== null && charLeft < 10

  const baseClass = `w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800
    transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/50
    placeholder-gray-400
    ${field.type === 'code' ? 'font-mono text-xs bg-gray-950 text-green-400 border-gray-700 focus:ring-green-500/30' : 'bg-white border-gray-200 hover:border-gray-300'}`

  if (field.type === 'toggle') {
    const isOn = value === 'true'
    return (
      <button
        type="button"
        onClick={() => onChange(isOn ? 'false' : 'true')}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isOn ? 'bg-amber-500' : 'bg-gray-200'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    )
  }

  if (field.type === 'select') {
    return (
      <select value={value} onChange={e => onChange(e.target.value)}
        className={`${baseClass} bg-white`}>
        <option value="">— Seçiniz —</option>
        {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }

  if (field.type === 'color') {
    return (
      <div className="flex items-center gap-3">
        <input type="color" value={value || '#F59E0B'} onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder} className={baseClass} />
      </div>
    )
  }

  if (field.type === 'textarea' || field.type === 'code') {
    return (
      <div className="relative">
        <textarea
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder} rows={field.rows || 3}
          className={`${baseClass} resize-y`}
          maxLength={field.maxLength}
        />
        {charLeft !== null && (
          <span className={`absolute bottom-2 right-3 text-[10px] font-mono ${charWarn ? 'text-red-500' : 'text-gray-400'}`}>
            {charLeft}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <input
        type={field.type === 'url' ? 'url' : 'text'}
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={baseClass}
        maxLength={field.maxLength}
      />
      {charLeft !== null && (
        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono ${charWarn ? 'text-red-500' : 'text-gray-400'}`}>
          {charLeft}
        </span>
      )}
    </div>
  )
}

// ── Checklist Item ────────────────────────────────────────────────────────────
function CheckItem({ label, done, tip }: { label: string; done: boolean; tip?: string }) {
  return (
    <div className={`flex items-start gap-2.5 p-2.5 rounded-xl ${done ? 'bg-green-50' : 'bg-red-50/60'}`}>
      <div className={`mt-0.5 flex-shrink-0 w-4.5 h-4.5 rounded-full flex items-center justify-center ${done ? 'bg-green-500' : 'bg-red-400'}`}>
        {done
          ? <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
          : <AlertCircle className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
      </div>
      <div>
        <p className={`text-xs font-semibold ${done ? 'text-green-700' : 'text-red-700'}`}>{label}</p>
        {!done && tip && <p className="text-[11px] text-red-500 mt-0.5">{tip}</p>}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SeoPage() {
  const [settings, setSettings]     = useState<Settings>({})
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [activeSection, setActive]  = useState('meta')
  const [expandedTip, setExpTip]    = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/seo')
      const data = await res.json()
      setSettings(data.settings || {})
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function set(key: string, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  async function save() {
    setSaving(true)
    try {
      await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { /* ignore */ }
    setSaving(false)
  }

  const score = calcScore(settings)
  const currentSection = SECTIONS.find(s => s.id === activeSection)!
  const siteUrl = settings.site_url || 'https://cityturizm.com'

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Search className="w-4.5 h-4.5 text-white" />
            </div>
            SEO Yönetimi
          </h1>
          <p className="text-gray-400 text-sm mt-1">Meta etiketler, analitik, yapılandırılmış veri ve daha fazlası</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow shadow-amber-500/25 hover:-translate-y-0.5">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Kaydedildi!' : saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* ── Left: Score + Nav ── */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {/* SEO Score Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">SEO Skoru</p>
            <div className="flex items-center gap-4 mb-3">
              <div className={`text-4xl font-black ${scoreColor(score).split(' ')[0]}`}>{score}</div>
              <div className="flex-1">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full transition-all ${scoreBg(score)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <p className={`text-xs font-semibold mt-1 ${scoreColor(score).split(' ')[0]}`}>
                  {score >= 80 ? 'Mükemmel 🎉' : score >= 50 ? 'Geliştirilmeli 🔧' : 'Düşük — Acil! 🚨'}
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-1.5 mt-4">
              <CheckItem label="Meta başlık"              done={!!settings.meta_title} tip="meta_title alanını doldurun" />
              <CheckItem label="Meta açıklama"            done={!!settings.meta_description} tip="meta_description alanını doldurun" />
              <CheckItem label="OG resim"                 done={!!settings.og_image} tip="Sosyal medya için og_image ekleyin" />
              <CheckItem label="Google Analytics / GTM"   done={!!(settings.ga4_id || settings.gtm_id)} tip="GA4 veya GTM ID girin" />
              <CheckItem label="Search Console"           done={!!settings.google_site_verification} tip="Doğrulama kodunu girin" />
              <CheckItem label="Şirket şeması"            done={!!settings.schema_org_name} tip="JSON-LD için şirket adı girin" />
              <CheckItem label="Telefon (JSON-LD)"        done={!!settings.schema_org_phone} />
              <CheckItem label="Site URL"                 done={!!settings.site_url} tip="site_url alanını doldurun" />
              <CheckItem label="Logo URL"                 done={!!settings.schema_org_logo} />
              <CheckItem label="İndexleme Açık"           done={settings.robots_noindex !== 'true'} tip="Noindex kapalı olmalı!" />
            </div>
          </div>

          {/* Technical Links */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Teknik Dosyalar</p>
            <div className="space-y-2">
              {[
                { label: 'sitemap.xml',  path: '/sitemap.xml',  icon: FileText },
                { label: 'robots.txt',   path: '/robots.txt',   icon: Bot },
              ].map(item => (
                <a key={item.path}
                  href={item.path} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/40 transition-all group">
                  <item.icon className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700 flex-1">{item.label}</span>
                  <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-amber-400" />
                </a>
              ))}
              <button
                onClick={() => { navigator.clipboard.writeText(`${siteUrl}/sitemap.xml`) }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all group text-left">
                <Copy className="w-4 h-4 text-gray-400 group-hover:text-amber-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-600 group-hover:text-amber-700">Sitemap URL Kopyala</p>
                  <p className="text-[10px] text-gray-400 truncate">{siteUrl}/sitemap.xml</p>
                </div>
              </button>
            </div>
          </div>

          {/* Section Nav */}
          <nav className="bg-white rounded-2xl border border-gray-200 p-3 space-y-0.5">
            {SECTIONS.map(sec => {
              const active = activeSection === sec.id
              return (
                <button key={sec.id} onClick={() => setActive(sec.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active ? 'bg-amber-50 text-amber-700 border border-amber-200/60' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}>
                  <sec.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-amber-500' : 'text-gray-400'}`} />
                  <span className="flex-1 text-left truncate">{sec.title}</span>
                  <ChevronRight className={`w-3 h-3 opacity-40 transition-transform ${active ? 'rotate-90' : ''}`} />
                </button>
              )
            })}
          </nav>
        </div>

        {/* ── Right: Section Editor ── */}
        <div className="col-span-12 lg:col-span-9 space-y-4">
          {/* Section header */}
          <div className={`bg-gradient-to-r ${currentSection.color} rounded-2xl p-6 text-white`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <currentSection.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black">{currentSection.title}</h2>
                <p className="text-white/80 text-sm mt-0.5">{currentSection.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Fields */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 flex items-center justify-center py-20">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
              {currentSection.fields.map(field => {
                const value = settings[field.key] || ''
                return (
                  <div key={field.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        {field.label}
                        {field.type === 'toggle' && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            value === 'true' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {value === 'true' ? 'Açık' : 'Kapalı'}
                          </span>
                        )}
                      </label>
                      {field.hint && (
                        <button onClick={() => setExpTip(expandedTip === field.key ? null : field.key)}
                          className="text-gray-400 hover:text-gray-600 transition-colors">
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {expandedTip === field.key && field.hint && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden">
                          <div className="mb-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                            💡 {field.hint}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <FieldInput field={field} value={value} onChange={(v) => set(field.key, v)} />

                    {/* Character count bar for title/description */}
                    {field.maxLength && value && (
                      <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            value.length > field.maxLength * 0.9 ? 'bg-red-400' :
                            value.length > field.maxLength * 0.7 ? 'bg-amber-400' : 'bg-green-400'
                          }`}
                          style={{ width: `${Math.min(100, (value.length / field.maxLength) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* SERP Preview — only for meta section */}
          {activeSection === 'meta' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Google Önizleme</p>
              <div className="border border-gray-200 rounded-xl p-5 max-w-lg">
                <p className="text-[13px] text-gray-400 mb-0.5 truncate">
                  {(settings.site_url || 'https://cityturizm.com').replace('https://', '')}
                </p>
                <p className="text-[18px] text-blue-700 font-medium leading-snug truncate hover:underline cursor-pointer mb-1">
                  {settings.meta_title || 'City Turizm | Yurt İçi ve Yurt Dışı Tur Paketleri'}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                  {settings.meta_description || 'Meta açıklama buraya gelecek...'}
                </p>
              </div>
            </div>
          )}

          {/* OG Preview — only for og section */}
          {activeSection === 'og' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Sosyal Medya Önizleme</p>
              <div className="border border-gray-200 rounded-xl overflow-hidden max-w-sm">
                {settings.og_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={settings.og_image} alt="OG" className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                    <Share2 className="w-8 h-8 text-amber-400" />
                  </div>
                )}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-[11px] text-gray-500 uppercase mb-1">{(settings.site_url || 'cityturizm.com').replace('https://', '')}</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{settings.og_title || settings.meta_title || 'Başlık'}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{settings.og_description || settings.meta_description || 'Açıklama'}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                  <Share2 className="w-3.5 h-3.5 text-blue-600" /> Facebook / WhatsApp / LinkedIn
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-sky-50 px-3 py-2 rounded-lg border border-sky-100">
                  <AtSign className="w-3.5 h-3.5 text-sky-500" /> Twitter/X Card
                </div>
              </div>
            </div>
          )}

          {/* Tracking help — GA4 section */}
          {activeSection === 'tracking' && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-800 space-y-2">
              <p className="font-bold flex items-center gap-2"><Info className="w-4 h-4" /> Kurulum Rehberi</p>
              <ul className="list-disc list-inside text-xs space-y-1 text-blue-700">
                <li><strong>GA4:</strong> <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="underline">analytics.google.com</a> → Yönetici → Veri Akışları → Ölçüm ID (G-XXXX)</li>
                <li><strong>GTM:</strong> <a href="https://tagmanager.google.com" target="_blank" rel="noreferrer" className="underline">tagmanager.google.com</a> → Kapsayıcı → GTM-XXXX</li>
                <li><strong>Search Console:</strong> <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="underline">search.google.com/search-console</a> → HTML etiketi yöntemi → içerik değeri</li>
                <li><strong>Not:</strong> GA4 ile GTM birlikte kullanılabilir (GTM içinde GA4 tag kurulur, ikisi de doldurmayın)</li>
              </ul>
            </div>
          )}

          {/* Schema preview */}
          {activeSection === 'schema' && settings.schema_org_name && (
            <div className="bg-gray-950 rounded-2xl p-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">JSON-LD Önizleme</p>
              <pre className="text-green-400 text-xs overflow-auto max-h-80 leading-relaxed">
                {JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Organization',
                  name: settings.schema_org_name,
                  url: siteUrl,
                  telephone: settings.schema_org_phone,
                  email: settings.schema_org_email,
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: settings.schema_org_street,
                    addressLocality: settings.schema_org_city,
                    addressCountry: settings.schema_org_country || 'TR',
                  },
                }, null, 2)}
              </pre>
            </div>
          )}

          {/* Save button bottom */}
          <div className="flex justify-end">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold text-sm px-8 py-3 rounded-xl transition-all shadow shadow-amber-500/25 hover:-translate-y-0.5">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Kaydedildi!' : 'Tüm Ayarları Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
