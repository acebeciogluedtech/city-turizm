'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, User, Mail, Phone, Calendar, GraduationCap, Upload, MapPin,
  Building2, Bus, Compass, CarFront, FileText, CreditCard, BadgeCheck,
  ChevronRight, Check, AlertCircle, Loader2, Send,
} from 'lucide-react'

// ── Types ──
type Category = 'genel' | 'arac' | 'rehber' | 'surucu'

interface CategoryInfo {
  id: Category
  title: string
  subtitle: string
  icon: React.ElementType
  color: string
}

const CATEGORIES: CategoryInfo[] = [
  { id: 'genel',  title: 'GENEL BAŞVURU',   subtitle: 'Kariyer fırsatları için başvurun',  icon: Building2, color: 'from-amber-500 to-orange-500'   },
  { id: 'surucu', title: 'SÜRÜCÜ BAŞVURU',  subtitle: 'Sürücü ekibimize katılın',          icon: Bus,       color: 'from-purple-500 to-violet-500'   },
  { id: 'rehber', title: 'REHBER BAŞVURU',  subtitle: 'Rehber kadromuzda yer alın',         icon: Compass,   color: 'from-emerald-500 to-teal-500'    },
  { id: 'arac',   title: 'ARAÇ BAŞVURU',    subtitle: 'Araç filonuzu bize katın',           icon: CarFront,  color: 'from-blue-500 to-indigo-500'     },
]

// ── Detect file type for display ──────────────────────────────────────────────
function detectFileType(url: string): 'image' | 'pdf' | 'other' {
  const lower = url.toLowerCase().split('?')[0]
  if (/\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)$/.test(lower)) return 'image'
  if (/\.pdf$/.test(lower)) return 'pdf'
  return 'other'
}

// ── Upload helper ─────────────────────────────────────────────────────────────
async function uploadFile(file: File, folder = 'applications'): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)

  // PDFs and docs should NOT be converted to WebP — pass them as-is
  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')
  const isDoc = file.name.endsWith('.doc') || file.name.endsWith('.docx')

  if (isPdf || isDoc) {
    // Upload non-image file directly (skip WebP conversion in the API)
    fd.append('passthrough', 'true')
  }

  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
  const data = await res.json()
  if (!res.ok || !data.url) throw new Error(data.error || 'Yükleme başarısız')
  return data.url
}

// ── File Upload Component ──────────────────────────────────────────────────────
function FileUpload({
  label, maxMB, accept, file, onChange, hint,
}: {
  label: string; maxMB: number; accept: string
  file: File | null; onChange: (f: File | null) => void; hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > maxMB * 1024 * 1024) {
      alert(`Dosya boyutu maksimum ${maxMB} MB olmalıdır.`)
      return
    }
    onChange(f)
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl px-4 py-5 text-center cursor-pointer
                    transition-all duration-300 group
                    ${file
                      ? 'border-amber-400 bg-amber-50/50'
                      : 'border-gray-200 hover:border-amber-400 hover:bg-amber-50/30'
                    }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <Check className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
              {file.name}
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null) }}
              className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-6 h-6 text-gray-300 group-hover:text-amber-500 mx-auto mb-1.5 transition-colors" />
            <p className="text-sm text-gray-400 group-hover:text-gray-600 transition-colors">
              Dosya yüklemek için tıklayın
            </p>
            <p className="text-xs text-gray-300 mt-1">{hint || `Maksimum ${maxMB} MB`}</p>
          </>
        )}
      </div>
    </div>
  )
}

// ── Input Component ────────────────────────────────────────────────────────────
function FormInput({ label, icon: Icon, type = 'text', placeholder, value, onChange, required = true }: {
  label: string; icon: React.ElementType; type?: string
  placeholder?: string; value: string; onChange: (v: string) => void; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">
          <Icon className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <input
          type={type}
          placeholder={placeholder || label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                     text-sm text-gray-800 placeholder-gray-400
                     focus:outline-none focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/10
                     transition-all duration-200"
        />
      </div>
    </div>
  )
}

// ── Select Component ───────────────────────────────────────────────────────────
function FormSelect({ label, icon: Icon, options, value, onChange }: {
  label: string; icon: React.ElementType; options: string[]
  value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">
          <Icon className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                     text-sm text-gray-800 appearance-none
                     focus:outline-none focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/10
                     transition-all duration-200"
        >
          <option value="">{label} seçiniz</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  )
}

// ── Textarea Component ─────────────────────────────────────────────────────────
function FormTextarea({ label, placeholder, value, onChange }: {
  label: string; placeholder?: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <textarea
        rows={3}
        placeholder={placeholder || label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                   text-sm text-gray-800 placeholder-gray-400 resize-none
                   focus:outline-none focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/10
                   transition-all duration-200"
      />
    </div>
  )
}

// ── Submit Button ──────────────────────────────────────────────────────────────
function SubmitButton({ loading, onBeginClick }: { loading?: boolean; onBeginClick?: () => void }) {
  return (
    <button
      type="submit"
      disabled={loading}
      onClick={onBeginClick}  // fires before form onSubmit — shows spinner immediately
      className="w-full mt-2 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed
                 text-white font-bold text-sm rounded-xl transition-all duration-300
                 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30
                 hover:-translate-y-0.5 disabled:translate-y-0
                 flex items-center justify-center gap-2 group"
    >
      Başvuruyu Gönder <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </button>
  )
}

// ── Genel Form ────────────────────────────────────────────────────────────────
function GenelForm({ onBegin, onSuccess }: { onBegin: () => void; onSuccess: () => void }) {
  const [d, setD] = useState({ isim: '', email: '', telefon: '', dogumYili: '', ogrenim: '', adres: '', departman: '' })
  const [cv, setCv] = useState<File | null>(null)
  const submittingRef = useRef(false)
  const set = (k: string) => (v: string) => setD(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
    // onBegin() already called from SubmitButton onClick — spinner is already showing
    try {
      let cv_url = ''
      if (cv) cv_url = await uploadFile(cv, 'applications')

      await fetch('/api/admin/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_type: 'genel',
          name: d.isim, email: d.email, phone: d.telefon,
          data: { dogumYili: d.dogumYili, ogrenim: d.ogrenim, adres: d.adres, departman: d.departman, ...(cv_url && { cv_url }) },
        }),
      })
      onSuccess()
    } catch {
      alert('Gönderme sırasında hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput label="İsim Soyisim"        icon={User}         value={d.isim}      onChange={set('isim')} />
        <FormInput label="E-posta Adresi"       icon={Mail}         type="email"        value={d.email}     onChange={set('email')} />
        <FormInput label="Telefon Numarası"     icon={Phone}        type="tel"          value={d.telefon}   onChange={set('telefon')} />
        <FormInput label="Doğum Yılı"           icon={Calendar}     type="number"       placeholder="örn: 1990" value={d.dogumYili} onChange={set('dogumYili')} />
        <FormSelect label="Öğrenim Durumu"      icon={GraduationCap} options={['İlkokul','Ortaokul','Lise','Ön Lisans','Lisans','Yüksek Lisans','Doktora']} value={d.ogrenim} onChange={set('ogrenim')} />
        <FormInput label="Başvurulan Departman" icon={Building2}    value={d.departman} onChange={set('departman')} />
      </div>
      <FormInput label="Adres" icon={MapPin} value={d.adres} onChange={set('adres')} />
      <FileUpload label="Özgeçmiş (CV)" maxMB={10} accept=".pdf,.doc,.docx" file={cv} onChange={setCv}
        hint="PDF, DOC, DOCX — maksimum 10 MB" />
      <SubmitButton loading={false} onBeginClick={onBegin} />
    </form>
  )
}

// ── Araç Form ─────────────────────────────────────────────────────────────────
function AracForm({ onBegin, onSuccess }: { onBegin: () => void; onSuccess: () => void }) {
  const [d, setD] = useState({ isim: '', email: '', telefon: '', plaka: '', modelYili: '', aracCinsi: '', kapasite: '', adres: '', aciklama: '' })
  const [foto, setFoto] = useState<File | null>(null)
  const submittingRef = useRef(false)
  const set = (k: string) => (v: string) => setD(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
    // onBegin() already called from SubmitButton onClick — spinner is already showing
    try {
      let foto_url = ''
      if (foto) foto_url = await uploadFile(foto, 'applications')

      await fetch('/api/admin/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_type: 'arac',
          name: d.isim, email: d.email, phone: d.telefon,
          data: { plaka: d.plaka, modelYili: d.modelYili, aracCinsi: d.aracCinsi, kapasite: d.kapasite, adres: d.adres, aciklama: d.aciklama, ...(foto_url && { foto_url }) },
        }),
      })
      onSuccess()
    } catch {
      alert('Gönderme sırasında hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput label="İsim Soyisim"      icon={User}     value={d.isim}      onChange={set('isim')} />
        <FormInput label="E-posta Adresi"    icon={Mail}     type="email"        value={d.email}     onChange={set('email')} />
        <FormInput label="Telefon Numarası"  icon={Phone}    type="tel"          value={d.telefon}   onChange={set('telefon')} />
        <FormInput label="Plaka Numarası"    icon={CreditCard} value={d.plaka}   onChange={set('plaka')} />
        <FormInput label="Araç Model Yılı"   icon={Calendar} type="number"       placeholder="örn: 2022" value={d.modelYili} onChange={set('modelYili')} />
        <FormInput label="Araç Cinsi"        icon={CarFront} value={d.aracCinsi} onChange={set('aracCinsi')} />
        <FormInput label="Araç Kapasitesi"   icon={User}     placeholder="örn: 45 kişilik" value={d.kapasite} onChange={set('kapasite')} />
        <FormInput label="Adres"             icon={MapPin}   value={d.adres}     onChange={set('adres')} />
      </div>
      <FormTextarea label="Açıklama / Not" placeholder="Aracınız hakkında ek bilgi..." value={d.aciklama} onChange={set('aciklama')} />
      <FileUpload label="Araç Fotoğrafı" maxMB={5} accept="image/*" file={foto} onChange={setFoto}
        hint="JPG, PNG, WEBP — maksimum 5 MB" />
      <SubmitButton loading={false} onBeginClick={onBegin} />
    </form>
  )
}

// ── Rehber Form ───────────────────────────────────────────────────────────────
function RehberForm({ onBegin, onSuccess }: { onBegin: () => void; onSuccess: () => void }) {
  const [d, setD] = useState({ isim: '', email: '', telefon: '', dogumYili: '', ogrenim: '', adres: '', aciklama: '' })
  const [cv, setCv] = useState<File | null>(null)
  const submittingRef = useRef(false)
  const set = (k: string) => (v: string) => setD(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
    // onBegin() already called from SubmitButton onClick — spinner is already showing
    try {
      let cv_url = ''
      if (cv) cv_url = await uploadFile(cv, 'applications')

      await fetch('/api/admin/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_type: 'rehber',
          name: d.isim, email: d.email, phone: d.telefon,
          data: { dogumYili: d.dogumYili, ogrenim: d.ogrenim, adres: d.adres, aciklama: d.aciklama, ...(cv_url && { cv_url }) },
        }),
      })
      onSuccess()
    } catch {
      alert('Gönderme sırasında hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput label="İsim Soyisim"    icon={User}         value={d.isim}      onChange={set('isim')} />
        <FormInput label="E-posta Adresi"  icon={Mail}         type="email"        value={d.email}     onChange={set('email')} />
        <FormInput label="Telefon Numarası" icon={Phone}       type="tel"          value={d.telefon}   onChange={set('telefon')} />
        <FormInput label="Doğum Yılı"      icon={Calendar}     type="number"       placeholder="örn: 1990" value={d.dogumYili} onChange={set('dogumYili')} />
        <FormSelect label="Öğrenim Durumu" icon={GraduationCap} options={['İlkokul','Ortaokul','Lise','Ön Lisans','Lisans','Yüksek Lisans','Doktora']} value={d.ogrenim} onChange={set('ogrenim')} />
        <FormInput label="Adres"           icon={MapPin}       value={d.adres}     onChange={set('adres')} />
      </div>
      <FormTextarea label="Açıklama / Not" placeholder="Rehberlik deneyiminiz, konuştuğunuz diller..." value={d.aciklama} onChange={set('aciklama')} />
      <FileUpload label="Özgeçmiş (CV)" maxMB={10} accept=".pdf,.doc,.docx" file={cv} onChange={setCv}
        hint="PDF, DOC, DOCX — maksimum 10 MB" />
      <SubmitButton loading={false} onBeginClick={onBegin} />
    </form>
  )
}

// ── Sürücü Form ───────────────────────────────────────────────────────────────
function SurucuForm({ onBegin, onSuccess }: { onBegin: () => void; onSuccess: () => void }) {
  const [d, setD] = useState({ isim: '', email: '', telefon: '', dogumYili: '', ogrenim: '', adres: '', aciklama: '', ehliyet: '', topluTasima: '', src: '' })
  const [cv, setCv] = useState<File | null>(null)
  const submittingRef = useRef(false)
  const set = (k: string) => (v: string) => setD(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
    // onBegin() already called from SubmitButton onClick — spinner is already showing
    try {
      let cv_url = ''
      if (cv) cv_url = await uploadFile(cv, 'applications')

      await fetch('/api/admin/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_type: 'surucu',
          name: d.isim, email: d.email, phone: d.telefon,
          data: { dogumYili: d.dogumYili, ogrenim: d.ogrenim, adres: d.adres, aciklama: d.aciklama, ehliyet: d.ehliyet, topluTasima: d.topluTasima, src: d.src, ...(cv_url && { cv_url }) },
        }),
      })
      onSuccess()
    } catch {
      alert('Gönderme sırasında hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput label="İsim Soyisim"     icon={User}         value={d.isim}     onChange={set('isim')} />
        <FormInput label="E-posta Adresi"   icon={Mail}         type="email"       value={d.email}    onChange={set('email')} />
        <FormInput label="Telefon Numarası" icon={Phone}        type="tel"         value={d.telefon}  onChange={set('telefon')} />
        <FormInput label="Doğum Yılı"       icon={Calendar}     type="number"      placeholder="örn: 1990" value={d.dogumYili} onChange={set('dogumYili')} />
        <FormSelect label="Öğrenim Durumu"  icon={GraduationCap} options={['İlkokul','Ortaokul','Lise','Ön Lisans','Lisans','Yüksek Lisans','Doktora']} value={d.ogrenim} onChange={set('ogrenim')} />
        <FormSelect label="Ehliyet Sınıfı"  icon={CreditCard}   options={['B','C','D','E','D1','D1E']} value={d.ehliyet} onChange={set('ehliyet')} />
        <FormSelect label="Toplu Taşıma Belgesi" icon={BadgeCheck} options={['Var','Yok']} value={d.topluTasima} onChange={set('topluTasima')} />
        <FormSelect label="SRC Belgesi"     icon={FileText}     options={['SRC-1','SRC-2','SRC-3','SRC-4','Yok']} value={d.src} onChange={set('src')} />
      </div>
      <FormInput label="Adres" icon={MapPin} value={d.adres} onChange={set('adres')} />
      <FormTextarea label="Açıklama / Not" placeholder="Sürücülük deneyiminiz hakkında bilgi..." value={d.aciklama} onChange={set('aciklama')} />
      <FileUpload label="Özgeçmiş (CV)" maxMB={10} accept=".pdf,.doc,.docx" file={cv} onChange={setCv}
        hint="PDF, DOC, DOCX — maksimum 10 MB" />
      <SubmitButton loading={false} onBeginClick={onBegin} />
    </form>
  )
}

// ══════════════════════════════════════════
// ANA MODAL
// ══════════════════════════════════════════
export default function ApplicationModal({
  isOpen, onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setSelectedCategory(null)
    setSubmitted(false)
    setIsSubmitting(false)
    onClose()
  }, [onClose])

  const handleBack = () => { setSelectedCategory(null); setSubmitted(false); setIsSubmitting(false) }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* ── Full sending screen — replaces all content while submitting ── */}
            {isSubmitting && (
              <div className="absolute inset-0 z-[60] bg-white rounded-3xl flex flex-col items-center justify-center gap-6 px-8 text-center">
                {/* Animated rings */}
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-[3px] border-amber-100" />
                  <div className="absolute inset-0 rounded-full border-[3px] border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                  <div className="absolute inset-3 rounded-full border-[3px] border-amber-50" />
                  <div className="absolute inset-3 rounded-full border-[3px] border-t-amber-300 border-r-transparent border-b-transparent border-l-transparent animate-spin [animation-duration:1.5s]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Send className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900">Başvurunuz Gönderiliyor</p>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    Dosyanız yükleniyor, lütfen bekleyin.<br />
                    <span className="text-xs text-gray-400">Bu pencereyi kapatmayın.</span>
                  </p>
                </div>
                {/* Progress dots */}
                <div className="flex gap-1.5">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  {selectedCategory && !submitted && !isSubmitting && (
                    <button onClick={handleBack}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-amber-500 transition-colors mb-1">
                      <ChevronRight className="w-3.5 h-3.5 rotate-180" />Kategoriler
                    </button>
                  )}
                  <h2 className="text-xl font-black text-gray-900">
                    {submitted ? 'Başvurunuz Alındı!'
                      : isSubmitting ? 'Gönderiliyor...'
                      : selectedCategory ? CATEGORIES.find(c => c.id === selectedCategory)?.title
                      : 'Başvuru Kategorisi Seçin'}
                  </h2>
                  {!submitted && !selectedCategory && !isSubmitting && (
                    <p className="text-sm text-gray-400 mt-0.5">Hangi alanda başvuru yapmak istiyorsunuz?</p>
                  )}
                </div>
                <button onClick={isSubmitting ? undefined : handleClose}
                  disabled={isSubmitting}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div key="success"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
                      <Check className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Teşekkürler!</h3>
                    <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-8">
                      Başvurunuz başarıyla alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.
                    </p>
                    <button onClick={handleClose}
                      className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20">
                      Kapat
                    </button>
                  </motion.div>

                ) : selectedCategory ? (
                  <motion.div key={selectedCategory}
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                    {selectedCategory === 'genel'  && <GenelForm  onBegin={() => setIsSubmitting(true)} onSuccess={() => { setIsSubmitting(false); setSubmitted(true) }} />}
                    {selectedCategory === 'arac'   && <AracForm   onBegin={() => setIsSubmitting(true)} onSuccess={() => { setIsSubmitting(false); setSubmitted(true) }} />}
                    {selectedCategory === 'rehber' && <RehberForm onBegin={() => setIsSubmitting(true)} onSuccess={() => { setIsSubmitting(false); setSubmitted(true) }} />}
                    {selectedCategory === 'surucu' && <SurucuForm onBegin={() => setIsSubmitting(true)} onSuccess={() => { setIsSubmitting(false); setSubmitted(true) }} />}
                  </motion.div>

                ) : (
                  <motion.div key="categories"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -30 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CATEGORIES.map((cat, i) => {
                      const Icon = cat.icon
                      return (
                        <motion.button key={cat.id}
                          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                          onClick={() => setSelectedCategory(cat.id)}
                          className="group relative flex items-center gap-4 p-5 rounded-2xl
                                     border border-gray-100 hover:border-transparent
                                     bg-white hover:bg-gradient-to-br hover:shadow-xl
                                     transition-all duration-300 text-left overflow-hidden hover:-translate-y-1">
                          <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
                          <div className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gray-50 group-hover:bg-white/20 transition-all duration-300">
                            <Icon className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
                          </div>
                          <div className="relative z-10">
                            <div className="font-bold text-sm text-gray-900 group-hover:text-white transition-colors duration-300">{cat.title}</div>
                            <div className="text-xs text-gray-400 group-hover:text-white/80 mt-0.5 transition-colors duration-300">{cat.subtitle}</div>
                          </div>
                          <ChevronRight className="relative z-10 w-4 h-4 ml-auto text-gray-200 group-hover:text-white/70 group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                        </motion.button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
