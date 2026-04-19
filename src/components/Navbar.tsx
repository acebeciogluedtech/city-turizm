'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/language'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, ChevronDown, Phone, Globe,
  Users, MessageSquare, Building2, Award, Leaf, UserCheck, Truck, ShieldCheck, FileText, Lock, Eye, ScrollText, Cookie,
  BusFront, GraduationCap, ArrowRightLeft, Car, Compass, Fuel,
  ArrowRight,
} from 'lucide-react'
import { navItems } from '@/data/mock'
import { cn } from '@/lib/utils'

// ── Icon maps ──────────────────────────────────────────────────────────────────
const kurumsal: Record<string, { icon: React.ElementType; desc: string; section: string }> = {
  'Biz Kimiz':                    { icon: Users,       desc: '40 yıllık köklü geçmişimiz',      section: 'Hakkımızda' },
  'Başkanın Mesajı':              { icon: MessageSquare,desc: 'Yönetim vizyonu ve hedeflerimiz', section: 'Hakkımızda' },
  'Şirket Profili':               { icon: Building2,   desc: 'Yapı, misyon ve değerlerimiz',    section: 'Hakkımızda' },
  'Kalite Politikası':            { icon: Award,       desc: 'ISO belgeli hizmet standartları',  section: 'Politikalar' },
  'Çevre & Su Politikaları':      { icon: Leaf,        desc: 'Sürdürülebilir operasyon anlayışı',section: 'Politikalar' },
  'İnsan Kaynakları':             { icon: UserCheck,   desc: 'Ekibimize katılma fırsatları',    section: 'Politikalar' },
  'Araç Filosu':                  { icon: Truck,       desc: 'Modern ve geniş araç parkurumuzu', section: 'Hakkımızda' },
  'İş Sağlığı ve Güvenliği':     { icon: ShieldCheck, desc: 'Çalışan güvenliği standartlarımız',section: 'Politikalar' },
  'Kişisel Verilerin Korunması':  { icon: Lock,        desc: 'KVKK kapsamında veri işleme',     section: 'Yasal Bilgilendirme' },
  'Gizlilik ve Güvenlik':         { icon: Eye,         desc: 'Bilgi güvenliği politikamız',     section: 'Yasal Bilgilendirme' },
  'Kullanım Koşulları':           { icon: ScrollText,  desc: 'Site kullanım şart ve kuralları', section: 'Yasal Bilgilendirme' },
  'Çerez Politikası':             { icon: Cookie,      desc: 'Çerez kullanımı ve tercihleri',   section: 'Yasal Bilgilendirme' },
}

const hizmetler: Record<string, { icon: React.ElementType; desc: string }> = {
  'Personel Taşımacılığı':  { icon: BusFront,        desc: 'Kurumsal servis ve personel ulaşımı' },
  'Öğrenci Taşımacılığı':   { icon: GraduationCap,   desc: 'Güvenli ve düzenli öğrenci servisleri' },
  'Özel Transfer Hizmetleri':{ icon: ArrowRightLeft,  desc: 'Havalimanı ve VIP transfer çözümleri' },
  'Araç Kiralama':           { icon: Car,             desc: 'Günlük ve uzun dönem kiralama' },
  'Turizm Acenteliği':       { icon: Compass,         desc: 'Yurt içi ve yurt dışı tur paketleri' },
  'Akaryakıt İstasyonu':     { icon: Fuel,            desc: 'Yakıt tedarik ve ikmal hizmetleri' },
}


// ── Language dropdown ──────────────────────────────────────────────────────────
function LanguageDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const { lang: globalLang, setLang: setGlobalLang } = useLanguage()
  const lang = globalLang === 'en' ? 'EN' : 'TR'
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 hover:text-amber-200 transition-colors">
        <Globe className="w-3.5 h-3.5" />
        <span className="font-medium">{lang}</span>
        <ChevronDown className={cn('w-3 h-3 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 z-50"
          >
            {[{ code: 'TR' as const, flag: '🇹🇷', label: 'Türkçe' }, { code: 'EN' as const, flag: '🇬🇧', label: 'English' }].map(l => (
              <button key={l.code} onClick={() => { setGlobalLang(l.code === 'EN' ? 'en' : 'tr'); setIsOpen(false) }}
                className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  lang === l.code ? 'text-amber-600 bg-amber-50 font-semibold' : 'text-gray-700 hover:bg-gray-50')}>
                <span className="text-base">{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Mobil Dil Seçici ──
function MobileLanguageSwitch() {
  const { lang: globalLang, setLang: setGlobalLang } = useLanguage()
  const lang = globalLang === 'en' ? 'EN' : 'TR'

  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
      <button
        onClick={() => setGlobalLang('tr')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          lang === 'TR'
            ? 'bg-white text-amber-600 shadow-sm font-bold'
            : 'text-gray-500 hover:text-gray-700'
        )}
      >
        <span>🇹🇷</span>
        <span>Türkçe</span>
      </button>
      <button
        onClick={() => setGlobalLang('en')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          lang === 'EN'
            ? 'bg-white text-amber-600 shadow-sm font-bold'
            : 'text-gray-500 hover:text-gray-700'
        )}
      >
        <span>🇬🇧</span>
        <span>English</span>
      </button>
    </div>
  )
}
// ── Kurumsal mega-menu ─────────────────────────────────────────────────────────
function KurumsalMega({ items }: { items: { label: string; href: string; desc?: string; sectionKey?: string; icon?: React.ElementType }[] }) {
  const { lang } = useLanguage()
  const isEn = lang === 'en'

  const sectionLabels = isEn
    ? { about: 'About Us', policy: 'Policies', legal: 'Legal Information' }
    : { about: 'Hakkımızda', policy: 'Politikalar', legal: 'Yasal Bilgilendirme' }

  const grouped = (['about','policy','legal'] as const).map(key => ({
    title: sectionLabels[key],
    items: items.filter(i => i.sectionKey === key),
  }))
  const ungrouped = items.filter(i => !i.sectionKey)
  if (ungrouped.length) grouped[0].items = [...grouped[0].items, ...ungrouped]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50
                 bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)]
                 border border-gray-100/80 overflow-hidden"
      style={{ width: 720 }}
    >
      {/* Header strip */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-4">
        <p className="text-white font-bold text-base">{isEn ? 'Corporate' : 'Kurumsal'}</p>
        <p className="text-amber-100 text-xs mt-0.5">
          {isEn ? 'With 40 years of trust and experience by your side' : '40 yıllık güven ve deneyimle yanınızdayız'}
        </p>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-3 divide-x divide-gray-100">
        {grouped.map(({ title, items: gItems }) => (
          <div key={title} className="py-4">
            <p className="px-5 pb-2 text-[10px] font-bold uppercase tracking-widest text-amber-500">
              {title}
            </p>
            {gItems.map(item => {
              const Icon = item.icon ?? FileText
              return (
                <Link key={item.href} href={item.href}
                  className="group flex items-start gap-3 px-5 py-2.5
                             hover:bg-amber-50/70 transition-colors duration-150">
                  <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-amber-50 group-hover:bg-amber-100
                                  flex items-center justify-center transition-colors">
                    <Icon className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 group-hover:text-amber-700 transition-colors leading-tight">
                      {item.label}
                    </p>
                    {item.desc && (
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{item.desc}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Hizmetler mega-menu ────────────────────────────────────────────────────────
function HizmetlerMega({ items }: { items: { label: string; href: string; desc?: string; icon?: React.ElementType }[] }) {
  const { lang } = useLanguage()
  const isEn = lang === 'en'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50
                 bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)]
                 border border-gray-100/80 overflow-hidden"
      style={{ width: 480 }}
    >
      {/* Header strip */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-4">
        <p className="text-white font-bold text-base">{isEn ? 'Services' : 'Hizmetler'}</p>
        <p className="text-amber-100 text-xs mt-0.5">
          {isEn ? 'Explore our wide range of services' : 'Geniş hizmet yelpazemizi keşfedin'}
        </p>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-2 p-3 gap-1">
        {items.map(item => {
          const Icon = item.icon ?? Truck
          return (
            <Link key={item.href} href={item.href}
              className="group flex items-start gap-3 p-3.5 rounded-xl
                         hover:bg-amber-50 transition-colors duration-150 border border-transparent hover:border-amber-100">
              <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-amber-100
                              flex items-center justify-center transition-colors">
                <Icon className="w-4.5 h-4.5 text-slate-600 group-hover:text-amber-600 transition-colors" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-amber-700 transition-colors leading-tight">
                  {item.label}
                </p>
                {item.desc && (
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{item.desc}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Footer CTA */}
      <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/60 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {isEn ? 'Looking for a custom solution?' : 'Özel çözüm mü arıyorsunuz?'}
        </p>
        <Link href="/teklif-al"
          className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors">
          {isEn ? 'Get a Quote' : 'Teklif Alın'} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  )
}


// ── Main Navbar ────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [isScrolled, setIsScrolled]         = useState(false)
  const [isMobileOpen, setIsMobileOpen]     = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [cms, setCms] = useState<Record<string, { tr: string; en: string }>>({})
  const [logoUrl, setLogoUrl] = useState<string>('')
  const { lang } = useLanguage()

  // Load navbar CMS content + site settings (logo)
  useEffect(() => {
    fetch('/api/admin/content?pageId=ust-menu')
      .then(r => r.json())
      .then(({ data }) => {
        if (data?.length) {
          const map: Record<string, { tr: string; en: string }> = {}
          for (const row of data) {
            map[`${row.section_id}.${row.field_id}`] = { tr: row.tr || '', en: row.en || '' }
          }
          setCms(map)
        }
      })
      .catch(() => {})

    // Fetch logo from site_settings
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(({ settings }) => {
        if (settings?.logo_url) setLogoUrl(settings.logo_url)
      })
      .catch(() => {})
  }, [])

  // English defaults — used when lang='en' and no CMS EN value exists
  const NAV_EN: Record<string, string> = {
    'topbar.hours':             'Mon – Sat: 09:00 – 18:00',
    'nav.kurumsal_label':       'Corporate',
    'nav.hizmetler_label':      'Services',
    'nav.medya_label':          'Media',
    'nav.duyurular_label':      'Announcements',
    'nav.iletisim_label':       'Contact',
    'cta.btn1_label':           'Apply',
    'cta.btn2_label':           'Get Quote',
    'hizmetler_menu.personel_label':  'Personnel Transportation',
    'hizmetler_menu.ogrenci_label':   'Student Transportation',
    'hizmetler_menu.transfer_label':  'Private Transfer Services',
    'hizmetler_menu.arac_label':      'Vehicle Rental',
    'hizmetler_menu.turizm_label':    'Tourism Agency',
    'hizmetler_menu.akaryakit_label': 'Fuel Station',
    'kurumsal_menu.bizkimiz_label':   'About Us',
    'kurumsal_menu.baskan_label':     "Chairman's Message",
    'kurumsal_menu.sirket_label':     'Company Profile',
    'kurumsal_menu.filo_label':       'Vehicle Fleet',
    'kurumsal_menu.kalite_label':     'Quality Policy',
    'kurumsal_menu.cevre_label':      'Environmental & Water Policies',
    'kurumsal_menu.ik_label':         'Human Resources',
    'kurumsal_menu.isg_label':        'Occupational Health & Safety',
    'kurumsal_menu.kvkk_label':       'GDPR / KVKK',
    'kurumsal_menu.gizlilik_label':   'Privacy & Security',
    'kurumsal_menu.kullanim_label':   'Terms of Use',
    'kurumsal_menu.cerez_label':      'Cookie Policy',
  }

  // CMS helper — current lang → CMS EN_DEFAULTS → hardcoded TR fallback
  function cm(sectionId: string, fieldId: string, fallback: string): string {
    const key = `${sectionId}.${fieldId}`
    const effectiveFb = lang === 'en' ? (NAV_EN[key] ?? fallback) : fallback
    const entry = cms[key]
    if (!entry) return effectiveFb
    const val = lang === 'en' ? (entry.en || entry.tr) : entry.tr
    return val || effectiveFb
  }


  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Build CMS-overridden nav items
  const cmsNavItems = navItems.map(item => {
    const labelKey = item.label === 'Kurumsal' ? 'kurumsal_label'
      : item.label === 'Hizmetler' ? 'hizmetler_label'
      : item.label === 'Medya' ? 'medya_label'
      : item.label === 'Duyurular' ? 'duyurular_label'
      : item.label === 'İletişim' ? 'iletisim_label' : null
    const label = labelKey ? cm('nav', labelKey, item.label) : item.label

    if (item.label === 'Hizmetler' && item.children) {
      const keys    = ['personel','ogrenci','transfer','arac','turizm','akaryakit']
      const icons   = [BusFront, GraduationCap, ArrowRightLeft, Car, Compass, Fuel]
      const children = keys.map((k, i) => ({
        label: cm('hizmetler_menu', `${k}_label`, item.children![i]?.label ?? ''),
        href:  cm('hizmetler_menu', `${k}_href`,  item.children![i]?.href  ?? '#'),
        desc:  cm('hizmetler_menu', `${k}_desc`,  '') || (hizmetler[item.children![i]?.label ?? '']?.desc ?? ''),
        icon:  icons[i],
      }))
      return { ...item, label, children }
    }
    if (item.label === 'Kurumsal' && item.children) {
      // sectionKey groups: about=0-3, policy=4-7, legal=8-11
      const keys       = ['bizkimiz','baskan','sirket','filo','kalite','cevre','ik','isg','kvkk','gizlilik','kullanim','cerez']
      const sectionKeys= ['about','about','about','about','policy','policy','policy','policy','legal','legal','legal','legal'] as const
      const icons      = [Users, MessageSquare, Building2, Truck, Award, Leaf, UserCheck, ShieldCheck, Lock, Eye, ScrollText, Cookie]
      const children = keys.map((k, i) => ({
        label:      cm('kurumsal_menu', `${k}_label`, item.children![i]?.label ?? ''),
        href:       cm('kurumsal_menu', `${k}_href`,  item.children![i]?.href  ?? '#'),
        desc:       cm('kurumsal_menu', `${k}_desc`,  '') || (kurumsal[item.children![i]?.label ?? '']?.desc ?? ''),
        sectionKey: sectionKeys[i],
        icon:       icons[i],
      }))
      return { ...item, label, children }
    }
    return { ...item, label }
  })

  function renderDropdown(item: typeof cmsNavItems[0]) {
    if (!item.children) return null
    // Find original label from navItems by position
    const idx = cmsNavItems.indexOf(item)
    const origLabel = navItems[idx]?.label
    if (origLabel === 'Kurumsal') return <KurumsalMega items={item.children as any} />
    if (origLabel === 'Hizmetler') return <HizmetlerMega items={item.children as any} />
    return null
  }

  return (
    <>
      {/* ── TOP BAR ── */}
      <div className="bg-amber-500 text-white text-xs lg:text-sm py-2 lg:py-2.5 relative z-50">
        <div className="container mx-auto px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-5">
            <a href={cm('topbar','phone1_href','tel:4441289')}
               className="flex items-center gap-1.5 text-white font-black text-sm lg:text-base hover:text-amber-100 transition-colors">
              <Phone className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span>{cm('topbar','phone1','444 1 289')}</span>
            </a>
            {cm('topbar','phone2','') && <>
              <span className="hidden lg:inline text-amber-300/50 text-xs">|</span>
              <a href={cm('topbar','phone2_href','tel:+902125438097')}
                 className="hidden lg:flex items-center gap-2 hover:text-amber-100 transition-colors text-white">
                <Phone className="w-3.5 h-3.5" />
                <span>{cm('topbar','phone2','+90 212 543 80 97')}</span>
              </a>
            </>}
            {cm('topbar','phone3','') && <>
              <span className="hidden lg:inline text-white/40 text-xs">|</span>
              <a href={cm('topbar','phone3_href','tel:+902125836161')}
                 className="hidden lg:flex items-center gap-2 hover:text-amber-100 transition-colors text-white">
                <Phone className="w-3.5 h-3.5" />
                <span>{cm('topbar','phone3','+90 212 583 61 61')}</span>
              </a>
            </>}
            <span className="hidden lg:inline text-white/40 text-xs">|</span>
            <span className="hidden lg:inline text-white">{cm('topbar','hours','Pzt – Cmt: 09:00 – 18:00')}</span>
            <span className="lg:hidden text-white/80">{cm('topbar','hours','Pzt – Cmt: 09:00 – 18:00')}</span>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              {[
                { title: 'Facebook',  key: 'facebook',  d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                { title: 'Instagram', key: 'instagram', d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                { title: 'YouTube',   key: 'youtube',   d: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
                { title: 'LinkedIn',  key: 'linkedin',  d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
              ].map(s => {
                const href = cm('social', s.key, `https://${s.key}.com`)
                return (
                  <a key={s.title} href={href} target="_blank" rel="noopener noreferrer"
                     title={s.title} className="hover:text-amber-200 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={s.d} />
                    </svg>
                  </a>
                )
              })}
            </div>
            <span className="text-amber-300/50 text-xs">|</span>
            <LanguageDropdown />
          </div>
        </div>
      </div>

      {/* ── MAIN NAVBAR ── */}
      <nav className={cn(
        'fixed left-0 right-0 z-40 transition-all duration-300 bg-white border-b border-gray-100',
        isScrolled ? 'top-0 shadow-md' : 'top-[36px] lg:top-[44px]'
      )}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between" style={{ height: 72 }}>

            {/* Logo */}
            <Link href="/" className="shrink-0" style={{ cursor: 'pointer' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {logoUrl ? (
                <img src={logoUrl} alt="City Turizm Logo"
                  className="h-12 w-auto object-contain transition-opacity duration-150 hover:opacity-80"
                  style={{ cursor: 'pointer' }} />
              ) : (
                <Image src="/images.png" alt="City Turizm" width={140} height={56}
                  className="h-12 w-auto object-contain transition-opacity duration-150 hover:opacity-80"
                  style={{ cursor: 'pointer' }} priority />
              )}
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {cmsNavItems.map((item) => (
                <div key={item.label} className="relative"
                  onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.children ? (
                    <button
                      className={cn(
                        'flex items-center gap-1 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        activeDropdown === item.label
                          ? 'text-amber-600 bg-amber-50'
                          : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                      )}
                    >
                      {item.label}
                      <ChevronDown className={cn(
                        'w-3.5 h-3.5 opacity-60 transition-transform duration-200',
                        activeDropdown === item.label && 'rotate-180 opacity-100'
                      )} />
                    </button>
                  ) : (
                    <Link href={item.href}
                      className="flex items-center gap-1 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-gray-700 hover:text-amber-600 hover:bg-amber-50"
                    >
                      {item.label}
                    </Link>
                  )}

                  <AnimatePresence>
                    {activeDropdown === item.label && renderDropdown(item)}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-2.5">
              <Link href={cm('cta','btn1_href','/basvuru')}
                className="text-sm font-semibold text-gray-700 hover:text-amber-600
                           border border-gray-200 hover:border-amber-300 px-4 py-2.5
                           rounded-xl transition-all duration-200 hover:bg-amber-50">
                {cm('cta','btn1_label','Başvuru')}
              </Link>
              <Link href={cm('cta','btn2_href','/teklif-al')}
                className="text-sm font-bold text-white bg-amber-500 hover:bg-amber-600
                           px-5 py-2.5 rounded-xl transition-all duration-200
                           shadow-lg shadow-amber-500/25 hover:-translate-y-0.5">
                {cm('cta','btn2_label','Teklif Al')}
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="container mx-auto px-4 py-3 space-y-0.5">
                <a href="tel:4441289"
                   className="flex items-center gap-2 px-4 py-3 text-amber-600 font-black text-base">
                  <Phone className="w-4 h-4" />
                  444 1 289
                </a>
                <div className="h-px bg-gray-100 mx-4 mb-1" />

                {cmsNavItems.map((item) => (
                  <div key={item.label}>
                    {item.children ? (
                      <>
                        <button
                          onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                          className="w-full flex items-center justify-between px-4 py-3
                                     text-gray-800 font-medium hover:text-amber-600 hover:bg-amber-50
                                     rounded-xl transition-colors text-sm"
                        >
                          {item.label}
                          <ChevronDown className={cn('w-4 h-4 transition-transform duration-200',
                            mobileExpanded === item.label && 'rotate-180')} />
                        </button>
                        <AnimatePresence>
                          {mobileExpanded === item.label && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                              className="overflow-hidden pl-4"
                            >
                              {item.children.map(child => {
                                const meta = kurumsal[child.label] ?? hizmetler[child.label]
                                const Icon = meta?.icon ?? FileText
                                return (
                                  <Link key={child.label} href={child.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm
                                               text-gray-600 hover:text-amber-600 hover:bg-amber-50
                                               rounded-lg transition-colors"
                                  >
                                    <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                      <Icon className="w-3 h-3 text-amber-500" strokeWidth={1.75} />
                                    </div>
                                    {child.label}
                                  </Link>
                                )
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link href={item.href} onClick={() => setIsMobileOpen(false)}
                        className="block px-4 py-3 text-gray-800 font-medium text-sm
                                   hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors">
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}

                {/* Dil Seçici - Mobil */}
                <div className="px-4 pt-3">
                  <MobileLanguageSwitch />
                </div>

                <div className="pt-3 pb-2 flex gap-2 px-2">
                  <Link href={cm('cta','btn2_href','/teklif-al')} onClick={() => setIsMobileOpen(false)}
                    className="flex-1 text-center bg-amber-500 hover:bg-amber-600 text-white font-bold
                               text-sm py-3 rounded-xl transition-all shadow-md shadow-amber-500/25">
                    {cm('cta','btn2_label','Teklif Al')}
                  </Link>
                  <button
                    onClick={() => { setIsMobileOpen(false); window.dispatchEvent(new CustomEvent('open-application-modal')) }}
                    className="flex-1 text-center bg-gray-900 hover:bg-gray-800 text-white font-bold
                               text-sm py-3 rounded-xl transition-all shadow-md shadow-gray-900/25"
                  >
                    {cm('cta','btn1_label','Başvuru')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}
