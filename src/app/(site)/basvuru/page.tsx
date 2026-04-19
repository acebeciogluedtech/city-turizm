'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, Calendar, GraduationCap, Upload, MapPin,
  Building2, Bus, Compass, CarFront, FileText, CreditCard, BadgeCheck,
  ChevronRight, Check, ArrowLeft, ArrowRight,
} from 'lucide-react'
import { useLanguage } from '@/lib/language'
import { cn } from '@/lib/utils'

type Category = 'genel' | 'arac' | 'rehber' | 'surucu'

// ── Reusable field components ─────────────────────────────────────────────────
function FInput({ label, icon: Icon, type = 'text', placeholder, value, onChange, required = true }: {
  label: string; icon: React.ElementType; type?: string; placeholder?: string
  value: string; onChange: (v: string) => void; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
          <Icon className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <input type={type} placeholder={placeholder || label} value={value}
          onChange={e => onChange(e.target.value)} required={required}
          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm
                     text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400
                     focus:bg-white focus:ring-2 focus:ring-amber-400/10 transition-all" />
      </div>
    </div>
  )
}

function FSelect({ label, icon: Icon, options, value, onChange, placeholder }: {
  label: string; icon: React.ElementType; options: string[]; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
          <Icon className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm
                     text-gray-800 appearance-none focus:outline-none focus:border-amber-400
                     focus:bg-white focus:ring-2 focus:ring-amber-400/10 transition-all">
          <option value="">{placeholder || label}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  )
}

function FTextarea({ label, placeholder, value, onChange }: {
  label: string; placeholder?: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <textarea rows={3} placeholder={placeholder || label} value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm
                   text-gray-800 placeholder-gray-400 resize-none focus:outline-none
                   focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/10 transition-all" />
    </div>
  )
}

function FUpload({ label, maxMB, accept, file, onChange, clickLabel }: {
  label: string; maxMB: number; accept: string; file: File | null; onChange: (f: File | null) => void; clickLabel?: string
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl
                         px-4 py-6 cursor-pointer transition-all group
                         ${file ? 'border-amber-400 bg-amber-50/40' : 'border-gray-200 hover:border-amber-400 hover:bg-amber-50/20'}`}>
        <input type="file" accept={accept} className="hidden"
          onChange={e => {
            const f = e.target.files?.[0]
            if (f && f.size <= maxMB * 1024 * 1024) onChange(f)
          }} />
        {file ? (
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-gray-700 truncate max-w-[220px]">{file.name}</span>
            <button type="button" onClick={e => { e.preventDefault(); onChange(null) }}
              className="text-gray-400 hover:text-red-400 transition-colors ml-1">×</button>
          </div>
        ) : (
          <>
            <Upload className="w-6 h-6 text-gray-300 group-hover:text-amber-400 mb-1.5 transition-colors" />
            <p className="text-sm text-gray-400">{clickLabel || 'Yüklemek için tıklayın'}</p>
            <p className="text-xs text-gray-300 mt-0.5">Maks. {maxMB} MB</p>
          </>
        )}
      </label>
    </div>
  )
}

// ── Forms ─────────────────────────────────────────────────────────────────────
function GenelForm({ onSubmit, lang }: { onSubmit: () => void; lang: 'tr' | 'en' }) {
  const isEn = lang === 'en'
  const [d, setD] = useState({ isim:'', email:'', telefon:'', dogumYili:'', ogrenim:'', adres:'', departman:'' })
  const [cv, setCv] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const s = (k: string) => (v: string) => setD(p => ({ ...p, [k]: v }))
  const educationOptions = isEn
    ? ['Primary School','Middle School','High School','Associate Degree','Bachelor\'s Degree','Master\'s Degree','Doctorate']
    : ['İlkokul','Ortaokul','Lise','Ön Lisans','Lisans','Yüksek Lisans','Doktora']
  async function handleSubmit() {
    if (!d.isim || !d.email || !d.telefon) return
    setSubmitting(true)
    try {
      let cv_url = ''
      if (cv) {
        const fd = new FormData(); fd.append('file', cv); fd.append('folder', 'applications')
        const up = await fetch('/api/admin/upload', { method: 'POST', body: fd }).then(r => r.json()).catch(() => ({}))
        cv_url = up.url || ''
      }
      await fetch('/api/admin/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_type: 'genel', name: d.isim, email: d.email, phone: d.telefon,
          data: { dogumYili: d.dogumYili, ogrenim: d.ogrenim, adres: d.adres, departman: d.departman, ...(cv_url ? { cv_url } : {}) } }) }).catch(() => {})
      onSubmit()
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <form noValidate onSubmit={e => { e.preventDefault(); handleSubmit() }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FInput label={isEn ? 'Full Name' : 'İsim Soyisim'} icon={User} value={d.isim} onChange={s('isim')} />
        <FInput label={isEn ? 'E-mail' : 'E-posta'} icon={Mail} type="email" value={d.email} onChange={s('email')} />
        <FInput label={isEn ? 'Phone' : 'Telefon'} icon={Phone} type="tel" value={d.telefon} onChange={s('telefon')} />
        <FInput label={isEn ? 'Birth Year' : 'Doğum Yılı'} icon={Calendar} type="number" placeholder={isEn ? 'e.g. 1990' : 'örn: 1990'} value={d.dogumYili} onChange={s('dogumYili')} />
        <FSelect label={isEn ? 'Education Level' : 'Öğrenim Durumu'} icon={GraduationCap} options={educationOptions} placeholder={isEn ? 'Select level' : undefined} value={d.ogrenim} onChange={s('ogrenim')} />
        <FInput label={isEn ? 'Applied Department' : 'Başvurulan Departman'} icon={Building2} value={d.departman} onChange={s('departman')} />
      </div>
      <FInput label={isEn ? 'Address' : 'Adres'} icon={MapPin} value={d.adres} onChange={s('adres')} />
      <FUpload label={isEn ? 'Resume (CV)' : 'Özgeçmiş (CV)'} maxMB={5} accept=".pdf,.doc,.docx" file={cv} onChange={setCv} clickLabel={isEn ? 'Click to upload' : 'Yüklemek için tıklayın'} />
      <SubmitBtn label={isEn ? 'Submit Application' : 'Başvuruyu Gönder'} loading={submitting} />
    </form>
  )
}

function SurucuForm({ onSubmit, lang }: { onSubmit: () => void; lang: 'tr' | 'en' }) {
  const isEn = lang === 'en'
  const [d, setD] = useState({ isim:'', email:'', telefon:'', dogumYili:'', ogrenim:'', adres:'', aciklama:'', ehliyet:'', topluTasima:'', src:'' })
  const [cv, setCv] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const s = (k: string) => (v: string) => setD(p => ({ ...p, [k]: v }))
  const educationOptions = isEn
    ? ['Primary School','Middle School','High School','Associate Degree','Bachelor\'s Degree','Master\'s Degree','Doctorate']
    : ['İlkokul','Ortaokul','Lise','Ön Lisans','Lisans','Yüksek Lisans','Doktora']
  const transitOptions = isEn ? ['Yes','No'] : ['Var','Yok']
  async function handleSubmit() {
    if (!d.isim || !d.email || !d.telefon) return
    setSubmitting(true)
    try {
      let cv_url = ''
      if (cv) {
        const fd = new FormData(); fd.append('file', cv); fd.append('folder', 'applications')
        const up = await fetch('/api/admin/upload', { method: 'POST', body: fd }).then(r => r.json()).catch(() => ({}))
        cv_url = up.url || ''
      }
      await fetch('/api/admin/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_type: 'surucu', name: d.isim, email: d.email, phone: d.telefon,
          data: { dogumYili: d.dogumYili, ogrenim: d.ogrenim, adres: d.adres, aciklama: d.aciklama, ehliyet: d.ehliyet, topluTasima: d.topluTasima, src: d.src, ...(cv_url ? { cv_url } : {}) } }) }).catch(() => {})
      onSubmit()
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <form noValidate onSubmit={e => { e.preventDefault(); handleSubmit() }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FInput label={isEn ? 'Full Name' : 'İsim Soyisim'} icon={User} value={d.isim} onChange={s('isim')} />
        <FInput label={isEn ? 'E-mail' : 'E-posta'} icon={Mail} type="email" value={d.email} onChange={s('email')} />
        <FInput label={isEn ? 'Phone' : 'Telefon'} icon={Phone} type="tel" value={d.telefon} onChange={s('telefon')} />
        <FInput label={isEn ? 'Birth Year' : 'Doğum Yılı'} icon={Calendar} type="number" placeholder={isEn ? 'e.g. 1990' : 'örn: 1990'} value={d.dogumYili} onChange={s('dogumYili')} />
        <FSelect label={isEn ? 'Education Level' : 'Öğrenim Durumu'} icon={GraduationCap} options={educationOptions} placeholder={isEn ? 'Select level' : undefined} value={d.ogrenim} onChange={s('ogrenim')} />
        <FSelect label={isEn ? 'Driver License Class' : 'Ehliyet Sınıfı'} icon={CreditCard} options={['B','C','D','E','D1','D1E']} value={d.ehliyet} onChange={s('ehliyet')} />
        <FSelect label={isEn ? 'Public Transport Certificate' : 'Toplu Taşıma Belgesi'} icon={BadgeCheck} options={transitOptions} value={d.topluTasima} onChange={s('topluTasima')} />
        <FSelect label={isEn ? 'SRC Certificate' : 'SRC Belgesi'} icon={FileText} options={['SRC-1','SRC-2','SRC-3','SRC-4', isEn ? 'None' : 'Yok']} value={d.src} onChange={s('src')} />
      </div>
      <FInput label={isEn ? 'Address' : 'Adres'} icon={MapPin} value={d.adres} onChange={s('adres')} />
      <FTextarea label={isEn ? 'Notes / Description' : 'Açıklama / Not'} placeholder={isEn ? 'Tell us about your driving experience...' : 'Sürücülük deneyiminiz hakkında bilgi...'} value={d.aciklama} onChange={s('aciklama')} />
      <FUpload label={isEn ? 'Resume (CV)' : 'Özgeçmiş (CV)'} maxMB={5} accept=".pdf,.doc,.docx" file={cv} onChange={setCv} clickLabel={isEn ? 'Click to upload' : 'Yüklemek için tıklayın'} />
      <SubmitBtn label={isEn ? 'Submit Application' : 'Başvuruyu Gönder'} loading={submitting} />
    </form>
  )
}

function RehberForm({ onSubmit, lang }: { onSubmit: () => void; lang: 'tr' | 'en' }) {
  const isEn = lang === 'en'
  const [d, setD] = useState({ isim:'', email:'', telefon:'', dogumYili:'', ogrenim:'', adres:'', aciklama:'' })
  const [cv, setCv] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const s = (k: string) => (v: string) => setD(p => ({ ...p, [k]: v }))
  const educationOptions = isEn
    ? ['Primary School','Middle School','High School','Associate Degree','Bachelor\'s Degree','Master\'s Degree','Doctorate']
    : ['İlkokul','Ortaokul','Lise','Ön Lisans','Lisans','Yüksek Lisans','Doktora']
  async function handleSubmit() {
    if (!d.isim || !d.email || !d.telefon) return
    setSubmitting(true)
    try {
      let cv_url = ''
      if (cv) {
        const fd = new FormData(); fd.append('file', cv); fd.append('folder', 'applications')
        const up = await fetch('/api/admin/upload', { method: 'POST', body: fd }).then(r => r.json()).catch(() => ({}))
        cv_url = up.url || ''
      }
      await fetch('/api/admin/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_type: 'rehber', name: d.isim, email: d.email, phone: d.telefon,
          data: { dogumYili: d.dogumYili, ogrenim: d.ogrenim, adres: d.adres, aciklama: d.aciklama, ...(cv_url ? { cv_url } : {}) } }) }).catch(() => {})
      onSubmit()
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <form noValidate onSubmit={e => { e.preventDefault(); handleSubmit() }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FInput label={isEn ? 'Full Name' : 'İsim Soyisim'} icon={User} value={d.isim} onChange={s('isim')} />
        <FInput label={isEn ? 'E-mail' : 'E-posta'} icon={Mail} type="email" value={d.email} onChange={s('email')} />
        <FInput label={isEn ? 'Phone' : 'Telefon'} icon={Phone} type="tel" value={d.telefon} onChange={s('telefon')} />
        <FInput label={isEn ? 'Birth Year' : 'Doğum Yılı'} icon={Calendar} type="number" placeholder={isEn ? 'e.g. 1990' : 'örn: 1990'} value={d.dogumYili} onChange={s('dogumYili')} />
        <FSelect label={isEn ? 'Education Level' : 'Öğrenim Durumu'} icon={GraduationCap} options={educationOptions} placeholder={isEn ? 'Select level' : undefined} value={d.ogrenim} onChange={s('ogrenim')} />
        <FInput label={isEn ? 'Address' : 'Adres'} icon={MapPin} value={d.adres} onChange={s('adres')} />
      </div>
      <FTextarea label={isEn ? 'Notes / Description' : 'Açıklama / Not'} placeholder={isEn ? 'Your guide experience, languages spoken...' : 'Rehberlik deneyiminiz, konuştuğunuz diller...'} value={d.aciklama} onChange={s('aciklama')} />
      <FUpload label={isEn ? 'Resume (CV)' : 'Özgeçmiş (CV)'} maxMB={5} accept=".pdf,.doc,.docx" file={cv} onChange={setCv} clickLabel={isEn ? 'Click to upload' : 'Yüklemek için tıklayın'} />
      <SubmitBtn label={isEn ? 'Submit Application' : 'Başvuruyu Gönder'} loading={submitting} />
    </form>
  )
}

function AracForm({ onSubmit, lang }: { onSubmit: () => void; lang: 'tr' | 'en' }) {
  const isEn = lang === 'en'
  const [d, setD] = useState({ isim:'', email:'', telefon:'', plaka:'', modelYili:'', aracCinsi:'', kapasite:'', adres:'', aciklama:'' })
  const [foto, setFoto] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const s = (k: string) => (v: string) => setD(p => ({ ...p, [k]: v }))
  async function handleSubmit() {
    if (!d.isim || !d.email || !d.telefon) return
    setSubmitting(true)
    try {
      let foto_url = ''
      if (foto) {
        const fd = new FormData(); fd.append('file', foto); fd.append('folder', 'applications')
        const up = await fetch('/api/admin/upload', { method: 'POST', body: fd }).then(r => r.json()).catch(() => ({}))
        foto_url = up.url || ''
      }
      await fetch('/api/admin/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_type: 'arac', name: d.isim, email: d.email, phone: d.telefon,
          data: { plaka: d.plaka, modelYili: d.modelYili, aracCinsi: d.aracCinsi, kapasite: d.kapasite, adres: d.adres, aciklama: d.aciklama, ...(foto_url ? { foto_url } : {}) } }) }).catch(() => {})
      onSubmit()
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <form noValidate onSubmit={e => { e.preventDefault(); handleSubmit() }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FInput label={isEn ? 'Full Name' : 'İsim Soyisim'} icon={User} value={d.isim} onChange={s('isim')} />
        <FInput label={isEn ? 'E-mail' : 'E-posta'} icon={Mail} type="email" value={d.email} onChange={s('email')} />
        <FInput label={isEn ? 'Phone' : 'Telefon'} icon={Phone} type="tel" value={d.telefon} onChange={s('telefon')} />
        <FInput label={isEn ? 'License Plate' : 'Plaka Numarası'} icon={CreditCard} value={d.plaka} onChange={s('plaka')} />
        <FInput label={isEn ? 'Vehicle Model Year' : 'Araç Model Yılı'} icon={Calendar} type="number" placeholder={isEn ? 'e.g. 2022' : 'örn: 2022'} value={d.modelYili} onChange={s('modelYili')} />
        <FInput label={isEn ? 'Vehicle Type' : 'Araç Cinsi'} icon={CarFront} value={d.aracCinsi} onChange={s('aracCinsi')} />
        <FInput label={isEn ? 'Seating Capacity' : 'Araç Kapasitesi'} icon={User} placeholder={isEn ? 'e.g. 45 seats' : 'örn: 45 kişilik'} value={d.kapasite} onChange={s('kapasite')} />
        <FInput label={isEn ? 'Address' : 'Adres'} icon={MapPin} value={d.adres} onChange={s('adres')} />
      </div>
      <FTextarea label={isEn ? 'Notes / Description' : 'Açıklama / Not'} placeholder={isEn ? 'Additional information about the vehicle...' : 'Aracınız hakkında ek bilgi...'} value={d.aciklama} onChange={s('aciklama')} />
      <FUpload label={isEn ? 'Vehicle Photo' : 'Araç Fotoğrafı'} maxMB={2} accept="image/*" file={foto} onChange={setFoto} clickLabel={isEn ? 'Click to upload' : 'Yüklemek için tıklayın'} />
      <SubmitBtn label={isEn ? 'Submit Application' : 'Başvuruyu Gönder'} loading={submitting} />
    </form>
  )
}

function SubmitBtn({ label, loading }: { label: string; loading?: boolean }) {
  return (
    <button type="submit" disabled={loading}
      className={cn(
        'w-full mt-2 py-4 text-white font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2',
        loading
          ? 'bg-amber-400 cursor-not-allowed shadow-amber-400/20'
          : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25 hover:-translate-y-0.5 group'
      )}>
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          Yükleniyor...
        </>
      ) : (
        <>
          {label}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
function BasvuruPageInner() {
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState<Category | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const { lang } = useLanguage()
  const isEn = lang === 'en'

  const CATEGORIES = [
    { id: 'genel'  as Category, title: isEn ? 'General Application' : 'Genel Başvuru',  subtitle: isEn ? 'Apply for career opportunities' : 'Kariyer fırsatları için başvurun',  icon: Building2, color: 'from-amber-500 to-orange-500' },
    { id: 'surucu' as Category, title: isEn ? 'Driver Application'  : 'Sürücü Başvuru', subtitle: isEn ? 'Join our driver team'           : 'Sürücü ekibimize katılın',         icon: Bus,       color: 'from-purple-500 to-violet-500' },
    { id: 'rehber' as Category, title: isEn ? 'Guide Application'   : 'Rehber Başvuru', subtitle: isEn ? 'Join our guide staff'            : 'Rehber kadromuzda yer alın',       icon: Compass,   color: 'from-emerald-500 to-teal-500' },
    { id: 'arac'   as Category, title: isEn ? 'Vehicle Application' : 'Araç Başvuru',   subtitle: isEn ? 'Add your vehicle to our fleet'  : 'Araç filonuzu bize katın',         icon: CarFront,  color: 'from-blue-500 to-indigo-500' },
  ]

  useEffect(() => {
    const kat = searchParams.get('kategori')
    if (kat && ['genel','arac','rehber','surucu'].includes(kat)) {
      setSelected(kat as Category)
    }
  }, [searchParams])

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-amber-500 pt-36 pb-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30
                            rounded-full px-4 py-1.5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white text-xs font-bold tracking-widest">
                {isEn ? 'CAREERS' : 'KARİYER'}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-3">
              {isEn ? 'Application Form' : 'Başvuru Formu'}
            </h1>
            <p className="text-white/80 text-base max-w-lg mx-auto">
              {isEn
                ? 'Select the appropriate category to join the City Turizm family or submit a vehicle application.'
                : 'City Turizm ailesine katılmak veya araç başvurusunda bulunmak için uygun kategoriyi seçin.'}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-10 pb-24">
        <div className="max-w-2xl mx-auto">

          {/* Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">

            {/* Card header */}
            <div className="px-8 pt-7 pb-5 border-b border-gray-100">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.p key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-xl font-black text-gray-900">
                    {isEn ? 'Application Received!' : 'Başvurunuz Alındı!'}
                  </motion.p>
                ) : selected ? (
                  <motion.div key="form-hdr" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <button onClick={() => setSelected(null)}
                      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-amber-500
                                 transition-colors mb-1.5">
                      <ArrowLeft className="w-3.5 h-3.5" />
                      {isEn ? 'Back to Categories' : 'Kategorilere Dön'}
                    </button>
                    <h2 className="text-xl font-black text-gray-900">
                      {CATEGORIES.find(c => c.id === selected)?.title}
                    </h2>
                  </motion.div>
                ) : (
                  <motion.div key="cat-hdr" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-xl font-black text-gray-900 mb-0.5">
                      {isEn ? 'Select Application Category' : 'Başvuru Kategorisi Seçin'}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {isEn ? 'Which area would you like to apply for?' : 'Hangi alanda başvuru yapmak istiyorsunuz?'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Card body */}
            <div className="px-8 py-7">
              <AnimatePresence mode="wait">

                {/* Success */}
                {submitted && (
                  <motion.div key="success"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center py-10 text-center"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center mb-5">
                      <Check className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">
                      {isEn ? 'Thank You!' : 'Teşekkürler!'}
                    </h3>
                    <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-8">
                      {isEn
                        ? 'Your application has been received successfully. We will get in touch with you as soon as possible.'
                        : 'Başvurunuz başarıyla alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.'}
                    </p>
                    <a href="/"
                      className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600
                                 text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-all
                                 hover:-translate-y-0.5 shadow-lg shadow-amber-500/25">
                      {isEn ? 'Back to Home' : 'Ana Sayfaya Dön'} <ArrowRight className="w-4 h-4" />
                    </a>
                  </motion.div>
                )}

                {/* Category selection */}
                {!submitted && !selected && (
                  <motion.div key="cats"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    {CATEGORIES.map((cat, i) => (
                      <motion.button key={cat.id}
                        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        onClick={() => setSelected(cat.id)}
                        className="group relative flex items-center gap-4 p-5 rounded-2xl
                                   border border-gray-100 hover:border-transparent text-left
                                   hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${cat.color}
                                         opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        <div className="relative z-10 w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-white/20
                                        flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                          <cat.icon className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-300"
                            strokeWidth={1.5} />
                        </div>
                        <div className="relative z-10 flex-1">
                          <p className="font-bold text-sm text-gray-900 group-hover:text-white transition-colors duration-300">
                            {cat.title}
                          </p>
                          <p className="text-xs text-gray-400 group-hover:text-white/80 mt-0.5 transition-colors duration-300">
                            {cat.subtitle}
                          </p>
                        </div>
                        <ChevronRight className="relative z-10 w-4 h-4 text-gray-300 group-hover:text-white/70
                                                  group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {/* Form */}
                {!submitted && selected && (
                  <motion.div key={selected}
                    initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}
                  >
                    {selected === 'genel'  && <GenelForm  onSubmit={() => setSubmitted(true)} lang={lang} />}
                    {selected === 'surucu' && <SurucuForm onSubmit={() => setSubmitted(true)} lang={lang} />}
                    {selected === 'rehber' && <RehberForm onSubmit={() => setSubmitted(true)} lang={lang} />}
                    {selected === 'arac'   && <AracForm   onSubmit={() => setSubmitted(true)} lang={lang} />}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}

export default function BasvuruPage() {
  return (
    <Suspense>
      <BasvuruPageInner />
    </Suspense>
  )
}
