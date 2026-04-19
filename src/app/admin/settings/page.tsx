'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, Save, RefreshCw, Check, AlertCircle, Upload,
  Eye, EyeOff, Trash2, Plus, User, Lock, Globe,
  Phone, Mail, MapPin, Building, Palette,
  Shield, Bell, Clock, Image as ImageIcon,
  ExternalLink, Copy, Info, X, UserPlus, Key,
  Monitor, ChevronRight,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
type S = Record<string, string>
interface AdminUser {
  id: string; email: string; name: string
  created_at: string; last_sign_in_at?: string
}

// ── Navigation config ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'brand',        label: 'Marka & Kimlik',      icon: Palette,   desc: 'Logo, favicon, renk' },
  { id: 'contact',      label: 'İletişim Bilgileri',  icon: Phone,     desc: 'Telefon, adres, harita' },
  { id: 'social',       label: 'Sosyal Medya',         icon: Globe,     desc: 'Platform linkleri' },
  { id: 'behavior',     label: 'Site Davranışı',       icon: Monitor,   desc: 'Dil, bakım modu' },
  { id: 'notifications',label: 'Bildirimler',          icon: Bell,      desc: 'E-posta bildirimleri' },
  { id: 'password',     label: 'Şifre Değiştir',       icon: Lock,      desc: 'Hesap güvenliği' },
  { id: 'users',        label: 'Admin Kullanıcılar',   icon: User,      desc: 'Kullanıcı yönetimi' },
  { id: 'security',     label: 'Güvenlik',             icon: Shield,    desc: 'Erişim kısıtlamaları' },
  { id: 'legal',        label: 'Yasal Bilgiler',       icon: Building,  desc: 'Şirket bilgileri' },
  { id: 'system',       label: 'Sistem',               icon: Clock,     desc: 'Teknik bilgiler' },
] as const
type NavId = typeof NAV_ITEMS[number]['id']

// ── Helpers ───────────────────────────────────────────────────────────────────
const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-semibold text-sm backdrop-blur-sm
        ${ok ? 'bg-green-600' : 'bg-red-500'}`}
    >
      {ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {msg}
    </motion.div>
  )
}

// ── Field primitives ──────────────────────────────────────────────────────────
function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="text-xs font-bold text-gray-600">{children}</label>
      {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800
        placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 hover:border-gray-300 transition-all" />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea value={value} placeholder={placeholder} rows={rows}
      onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800
        placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 hover:border-gray-300 transition-all resize-none" />
  )
}

function Toggle({ value, onChange, label, desc }: { value: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {desc && <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button type="button" onClick={() => onChange(!value)}
        className={`relative flex-shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${value ? 'bg-amber-500' : 'bg-gray-200'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 bg-white text-sm text-gray-800
          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 hover:border-gray-300 transition-all font-mono" />
      <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

// ── Image upload ──────────────────────────────────────────────────────────────
function ImageField({ label, value, onChange, hint }: {
  label: string; value: string; onChange: (url: string) => void; hint?: string
}) {
  const [uploading, setUploading] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'settings')
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const { url } = await res.json()
      if (url) onChange(url)
    } catch { /* silent */ }
    setUploading(false)
  }

  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
      <p className="text-xs font-bold text-gray-600 mb-3">{label}</p>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-16 h-16 object-contain rounded-xl border border-gray-200 bg-white p-1.5" />
          ) : (
            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-gray-300" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input type="text" value={value} onChange={e => onChange(e.target.value)}
            placeholder="https://... veya dosya seçin"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40" />
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => ref.current?.click()}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-all">
              {uploading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              {uploading ? 'Yükleniyor...' : 'Yükle'}
            </button>
            {value && (
              <button onClick={() => onChange('')} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium">
                <X className="w-3 h-3" /> Kaldır
              </button>
            )}
          </div>
          {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*,image/svg+xml" className="hidden"
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────
function PanelHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-4 pb-6 mb-6 border-b border-gray-100">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-500/20">
        <Icon className="w-5 h-5 text-white" strokeWidth={1.75} />
      </div>
      <div>
        <h2 className="text-base font-black text-gray-900">{title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

// ── Row layout ────────────────────────────────────────────────────────────────
function Row({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 | 3 }) {
  const cls = cols === 1 ? '' : cols === 3 ? 'grid grid-cols-3 gap-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'
  return <div className={cls}>{children}</div>
}

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label hint={hint}>{label}</Label>
      {children}
    </div>
  )
}

// ── Save button ───────────────────────────────────────────────────────────────
function SaveBar({ onSave, saving, label = 'Kaydet' }: { onSave: () => void; saving: boolean; label?: string }) {
  return (
    <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
      <button onClick={onSave} disabled={saving}
        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-60 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-amber-500/20 hover:-translate-y-0.5">
        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {label}
      </button>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function SettingsPage() {
  const [active, setActive] = useState<NavId>('brand')
  const [s, setS] = useState<S>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const [users, setUsers]       = useState<AdminUser[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName]   = useState('')
  const [newPass, setNewPass]   = useState('')
  const [addingUser, setAddingUser] = useState(false)
  const [showAdd, setShowAdd]   = useState(false)

  const [pwNew, setPwNew]           = useState('')
  const [pwConfirm, setPwConfirm]   = useState('')
  const [changingPw, setChangingPw] = useState(false)

  function set(key: string, val: string) { setS(prev => ({ ...prev, [key]: val })) }
  function setB(key: string, val: boolean) { set(key, val ? 'true' : 'false') }
  function g(key: string) { return s[key] || '' }
  function gb(key: string) { return s[key] === 'true' }

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [setRes, userRes] = await Promise.all([
        fetch('/api/admin/settings').then(r => r.json()),
        fetch('/api/admin/users').then(r => r.json()).catch(() => ({ users: [] })),
      ])
      setS(setRes.settings || {})
      setUsers(userRes.users || [])
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function save(subset?: S) {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: subset || s }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showToast('Kaydedildi')
    } catch (e: unknown) { showToast((e as Error).message || 'Hata oluştu', false) }
    setSaving(false)
  }

  async function changePassword() {
    if (!pwNew || pwNew.length < 8) { showToast('Şifre en az 8 karakter olmalıdır.', false); return }
    if (pwNew !== pwConfirm) { showToast('Şifreler uyuşmuyor.', false); return }
    setChangingPw(true)
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: pwNew }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPwNew(''); setPwConfirm('')
      showToast('Şifre güncellendi')
    } catch (e: unknown) { showToast((e as Error).message || 'Hata', false) }
    setChangingPw(false)
  }

  async function addUser() {
    if (!newEmail || !newPass) { showToast('E-posta ve şifre zorunludur.', false); return }
    setAddingUser(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, password: newPass, name: newName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNewEmail(''); setNewPass(''); setNewName(''); setShowAdd(false)
      showToast('Kullanıcı eklendi')
      load()
    } catch (e: unknown) { showToast((e as Error).message || 'Hata', false) }
    setAddingUser(false)
  }

  async function removeUser(userId: string, email: string) {
    if (!confirm(`"${email}" kullanıcısını silmek istiyor musunuz?`)) return
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showToast('Kullanıcı silindi')
      load()
    } catch (e: unknown) { showToast((e as Error).message || 'Hata', false) }
  }

  // ── Panel renderer ──────────────────────────────────────────────────────────
  function renderPanel() {
    if (loading) {
      return (
        <div className="space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      )
    }

    switch (active) {
      // ── Brand ──────────────────────────────────────────────────────────────
      case 'brand': return (
        <div className="space-y-5">
          <PanelHeader icon={Palette} title="Marka ve Görsel Kimlik" subtitle="Site logosu, favicon ve marka rengi" />
          <Row cols={2}>
            <ImageField label="Ana Logo" value={g('logo_url')} onChange={v => set('logo_url', v)}
              hint="Navbar'da gösterilir — PNG/SVG, şeffaf zemin tercih edilir" />
            <ImageField label="Favicon / Site İkonu" value={g('favicon_url')} onChange={v => set('favicon_url', v)}
              hint="32×32 veya 64×64 ICO/PNG — tarayıcı sekmesinde görünür" />
          </Row>
          <Row cols={2}>
            <FieldGroup label="Site Adı">
              <Input value={g('site_name')} onChange={v => set('site_name', v)} placeholder="City Turizm" />
            </FieldGroup>
            <FieldGroup label="Marka Rengi (HEX)">
              <div className="flex items-center gap-2">
                <input type="color" value={g('brand_color') || '#F59E0B'} onChange={e => set('brand_color', e.target.value)}
                  className="w-11 h-11 rounded-xl border border-gray-200 cursor-pointer p-1 flex-shrink-0" />
                <Input value={g('brand_color')} onChange={v => set('brand_color', v)} placeholder="#F59E0B" />
              </div>
            </FieldGroup>
          </Row>
          <FieldGroup label="Slogan / Tagline" hint="Header veya footer'da kullanılabilir">
            <Input value={g('site_tagline')} onChange={v => set('site_tagline', v)} placeholder="40 Yıllık Güven ve Deneyimle..." />
          </FieldGroup>
          <SaveBar onSave={() => save({ logo_url: g('logo_url'), favicon_url: g('favicon_url'), site_name: g('site_name'), brand_color: g('brand_color'), site_tagline: g('site_tagline') })} saving={saving} />
        </div>
      )

      // ── Contact ────────────────────────────────────────────────────────────
      case 'contact': return (
        <div className="space-y-5">
          <PanelHeader icon={Phone} title="İletişim Bilgileri" subtitle="Telefon, e-posta, adres ve çalışma saatleri" />
          <Row cols={2}>
            <FieldGroup label="Telefon 1">
              <Input value={g('phone_1')} onChange={v => set('phone_1', v)} placeholder="+90 212 543 80 97" />
            </FieldGroup>
            <FieldGroup label="Telefon 2 (Opsiyonel)">
              <Input value={g('phone_2')} onChange={v => set('phone_2', v)} placeholder="+90 212 543 80 98" />
            </FieldGroup>
            <FieldGroup label="WhatsApp" hint="Ülke kodunu dahil edin, + ve boşluk olmadan">
              <Input value={g('whatsapp')} onChange={v => set('whatsapp', v)} placeholder="905321234567" />
            </FieldGroup>
            <FieldGroup label="E-posta Adresi">
              <Input value={g('contact_email')} onChange={v => set('contact_email', v)} type="email" placeholder="info@cityturizm.com" />
            </FieldGroup>
          </Row>
          <FieldGroup label="Adres">
            <Textarea value={g('address')} onChange={v => set('address', v)} placeholder="Örnekli Mahallesi, Örnek Caddesi No:1, Beşiktaş / İstanbul" rows={2} />
          </FieldGroup>
          <Row cols={2}>
            <FieldGroup label="Çalışma Saatleri (Hafta İçi)">
              <Input value={g('hours_weekday')} onChange={v => set('hours_weekday', v)} placeholder="08:00 - 18:00" />
            </FieldGroup>
            <FieldGroup label="Çalışma Saatleri (Hafta Sonu)">
              <Input value={g('hours_weekend')} onChange={v => set('hours_weekend', v)} placeholder="09:00 - 15:00 / Kapalı" />
            </FieldGroup>
          </Row>
          <FieldGroup label="Google Maps Embed URL" hint="Google Maps 'Paylaş' > 'Haritayı Göm' linkini yapıştırın">
            <Textarea value={g('maps_embed')} onChange={v => set('maps_embed', v)} placeholder="https://www.google.com/maps/embed?pb=..." rows={2} />
          </FieldGroup>
          <SaveBar onSave={() => save()} saving={saving} />
        </div>
      )

      // ── Social ─────────────────────────────────────────────────────────────
      case 'social': return (
        <div className="space-y-5">
          <PanelHeader icon={Globe} title="Sosyal Medya Linkleri" subtitle="Platformlara doğrudan bağlantı URL'leri" />
          <div className="grid gap-4">
            {[
              { key: 'social_instagram', label: 'Instagram',    placeholder: 'https://instagram.com/cityturizm' },
              { key: 'social_facebook',  label: 'Facebook',     placeholder: 'https://facebook.com/cityturizm' },
              { key: 'social_twitter',   label: 'Twitter / X',  placeholder: 'https://twitter.com/cityturizm' },
              { key: 'social_linkedin',  label: 'LinkedIn',     placeholder: 'https://linkedin.com/company/...' },
              { key: 'social_youtube',   label: 'YouTube',      placeholder: 'https://youtube.com/@cityturizm' },
              { key: 'social_tiktok',    label: 'TikTok',       placeholder: 'https://tiktok.com/@cityturizm' },
            ].map(item => (
              <FieldGroup key={item.key} label={item.label}>
                <Input value={g(item.key)} onChange={v => set(item.key, v)} placeholder={item.placeholder} type="url" />
              </FieldGroup>
            ))}
          </div>
          <SaveBar onSave={() => save()} saving={saving} />
        </div>
      )

      // ── Behavior ───────────────────────────────────────────────────────────
      case 'behavior': return (
        <div className="space-y-5">
          <PanelHeader icon={Monitor} title="Site Davranışı" subtitle="Dil, bakım modu, çerez banneri ve diğer davranışlar" />
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <Toggle value={gb('maintenance_mode')} onChange={v => setB('maintenance_mode', v)}
              label="Bakım Modu" desc="Aktifken ziyaretçiler bakım sayfası görür" />
            <Toggle value={gb('cookie_banner')} onChange={v => setB('cookie_banner', v)}
              label="Çerez Onay Banneri" desc="KVKK / GDPR uyumu için çerez bildirimi" />
            <Toggle value={gb('show_whatsapp')} onChange={v => setB('show_whatsapp', v)}
              label="WhatsApp Butonu Göster" desc="Sayfanın köşesinde sabit WhatsApp butonu" />
            <Toggle value={gb('enable_en')} onChange={v => setB('enable_en', v)}
              label="İngilizce Dil Seçeneği" desc="Navbar'da TR / EN dil geçişi göster" />
          </div>
          <Row cols={2}>
            <FieldGroup label="Varsayılan Dil">
              <select value={g('default_lang') || 'tr'} onChange={e => set('default_lang', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400/40">
                <option value="tr">Türkçe (TR)</option>
                <option value="en">İngilizce (EN)</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Bakım Bitiş Tarihi">
              <Input value={g('maintenance_until')} onChange={v => set('maintenance_until', v)} type="datetime-local" />
            </FieldGroup>
          </Row>
          <FieldGroup label="Bakım Modu Mesajı" hint="Bakımdayken görünecek metin">
            <Input value={g('maintenance_msg')} onChange={v => set('maintenance_msg', v)}
              placeholder="Sitemiz bakımda, yakında geri döneceğiz." />
          </FieldGroup>
          <SaveBar onSave={() => save()} saving={saving} />
        </div>
      )

      // ── Notifications ──────────────────────────────────────────────────────
      case 'notifications': return (
        <div className="space-y-5">
          <PanelHeader icon={Bell} title="Bildirim ve E-posta" subtitle="Form bildirimlerinin gönderileceği adresler" />
          <FieldGroup label="Genel Bildirim E-postası" hint="Tüm form bildirimleri bu adrese gönderilir. Virgülle ayrılmış birden fazla adres girilebilir.">
            <Input value={g('notify_email')} onChange={v => set('notify_email', v)}
              placeholder="admin@cityturizm.com, manager@cityturizm.com" />
          </FieldGroup>
          <Row cols={2}>
            <FieldGroup label="Teklif Bildirimleri" hint="Boş bırakılırsa genel adres kullanılır">
              <Input value={g('notify_email_quotes')} onChange={v => set('notify_email_quotes', v)} placeholder="sales@cityturizm.com" />
            </FieldGroup>
            <FieldGroup label="Başvuru Bildirimleri">
              <Input value={g('notify_email_applications')} onChange={v => set('notify_email_applications', v)} placeholder="hr@cityturizm.com" />
            </FieldGroup>
          </Row>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Hangi olaylarda bildirim gönderilsin?</p>
            <Toggle value={gb('notify_new_message')} onChange={v => setB('notify_new_message', v)}
              label="Yeni iletişim mesajı" desc="Birisi iletişim formu doldurduğunda" />
            <Toggle value={gb('notify_new_quote')} onChange={v => setB('notify_new_quote', v)}
              label="Yeni teklif talebi" desc="Birisi teklif formu doldurduğunda" />
            <Toggle value={gb('notify_new_application')} onChange={v => setB('notify_new_application', v)}
              label="Yeni iş başvurusu" desc="Birisi başvuru formu doldurduğunda" />
            <Toggle value={gb('notify_newsletter')} onChange={v => setB('notify_newsletter', v)}
              label="Yeni bülten abonesi" desc="Birisi e-posta listesine katıldığında" />
          </div>
          <SaveBar onSave={() => save()} saving={saving} />
        </div>
      )

      // ── Password ───────────────────────────────────────────────────────────
      case 'password': return (
        <div className="space-y-5">
          <PanelHeader icon={Lock} title="Şifre Değiştir" subtitle="Admin hesabının giriş şifresini güncelle" />
          <div className="max-w-md space-y-4">
            <FieldGroup label="Yeni Şifre">
              <PasswordInput value={pwNew} onChange={setPwNew} placeholder="En az 8 karakter" />
            </FieldGroup>
            <FieldGroup label="Yeni Şifre (Tekrar)">
              <PasswordInput value={pwConfirm} onChange={setPwConfirm} placeholder="Şifrenizi tekrar girin" />
            </FieldGroup>
            {pwNew && pwConfirm && pwNew !== pwConfirm && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-semibold bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> Şifreler uyuşmuyor
              </div>
            )}
            {pwNew && pwNew.length >= 8 && pwNew === pwConfirm && (
              <div className="flex items-center gap-2 text-green-600 text-xs font-semibold bg-green-50 border border-green-100 px-3 py-2.5 rounded-xl">
                <Check className="w-3.5 h-3.5 flex-shrink-0" /> Şifreler uyuşuyor
              </div>
            )}
          </div>
          <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
            <button onClick={changePassword} disabled={changingPw || !pwNew || pwNew !== pwConfirm || pwNew.length < 8}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all">
              {changingPw ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Şifreyi Güncelle
            </button>
          </div>
        </div>
      )

      // ── Users ──────────────────────────────────────────────────────────────
      case 'users': return (
        <div className="space-y-5">
          <PanelHeader icon={User} title="Admin Kullanıcılar" subtitle="Panele erişim yetkisi olan hesaplar" />
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {users.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">Kullanıcı bulunamadı</div>
            )}
            {users.map((u, i) => (
              <div key={u.id} className={`flex items-center gap-4 px-5 py-4 bg-white hover:bg-gray-50 transition-colors ${i < users.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-4.5 h-4.5 text-amber-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{u.name || 'Admin'}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  {u.last_sign_in_at && (
                    <p className="text-[10px] text-gray-300 mt-0.5">Son giriş: {new Date(u.last_sign_in_at).toLocaleDateString('tr-TR')}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Admin</span>
                  {users.length > 1 && (
                    <button onClick={() => removeUser(u.id, u.email || '')}
                      className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!showAdd ? (
            <button onClick={() => setShowAdd(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-gray-200 hover:border-amber-300 rounded-xl text-sm font-semibold text-gray-400 hover:text-amber-600 hover:bg-amber-50/20 transition-all">
              <UserPlus className="w-4 h-4" /> Yeni Admin Ekle
            </button>
          ) : (
            <AnimatePresence>
              <motion.div initialOpacity={0} {...{ initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 } }}
                className="border border-amber-200 bg-amber-50/30 rounded-xl p-5 space-y-4 overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-800">Yeni Admin Kullanıcı</p>
                  <button onClick={() => setShowAdd(false)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <Row cols={2}>
                  <FieldGroup label="Ad Soyad (Opsiyonel)">
                    <Input value={newName} onChange={setNewName} placeholder="Ad Soyad" />
                  </FieldGroup>
                  <FieldGroup label="E-posta *">
                    <Input value={newEmail} onChange={setNewEmail} placeholder="admin@firma.com" type="email" />
                  </FieldGroup>
                </Row>
                <FieldGroup label="Şifre *">
                  <PasswordInput value={newPass} onChange={setNewPass} placeholder="En az 8 karakter" />
                </FieldGroup>
                <div className="flex items-center gap-3 justify-end">
                  <button onClick={() => setShowAdd(false)} className="text-sm text-gray-500 hover:text-gray-700 font-medium px-4 py-2">İptal</button>
                  <button onClick={addUser} disabled={addingUser}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all">
                    {addingUser ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Kullanıcı Oluştur
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )

      // ── Security ───────────────────────────────────────────────────────────
      case 'security': return (
        <div className="space-y-5">
          <PanelHeader icon={Shield} title="Güvenlik ve Erişim" subtitle="Oturum, yetkilendirme ve güvenlik ayarları" />
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <Toggle value={gb('login_captcha')} onChange={v => setB('login_captcha', v)}
              label="Giriş CAPTCHA" desc="Otomatik saldırılara karşı CAPTCHA doğrulama" />
            <Toggle value={gb('block_on_5_fail')} onChange={v => setB('block_on_5_fail', v)}
              label="5 Hatalı Denemede Kilitle" desc="Art arda 5 hatalı giriş denemesinde hesabı kilitle" />
            <Toggle value={gb('two_factor_hint')} onChange={v => setB('two_factor_hint', v)}
              label="2FA Yönlendirmesi" desc="Giriş sayfasında iki faktörlü doğrulama bildirim göster" />
          </div>
          <Row cols={2}>
            <FieldGroup label="Oturum Süresi (Dakika)" hint="0 = süresiz">
              <Input value={g('session_timeout')} onChange={v => set('session_timeout', v)} placeholder="120" type="number" />
            </FieldGroup>
            <FieldGroup label="İzin Verilen IP Adresleri" hint="Boş bırakılırsa tüm IP'ler erişebilir. Virgülle ayırın.">
              <Input value={g('allowed_ips')} onChange={v => set('allowed_ips', v)} placeholder="192.168.1.1, 85.x.x.x" />
            </FieldGroup>
          </Row>
          <SaveBar onSave={() => save()} saving={saving} />
        </div>
      )

      // ── Legal ──────────────────────────────────────────────────────────────
      case 'legal': return (
        <div className="space-y-5">
          <PanelHeader icon={Building} title="Yasal Bilgiler" subtitle="Şirket kimliği ve hukuki bilgiler" />
          <Row cols={2}>
            <FieldGroup label="Şirket Ünvanı">
              <Input value={g('company_name')} onChange={v => set('company_name', v)} placeholder="City Turizm A.Ş." />
            </FieldGroup>
            <FieldGroup label="Vergi No">
              <Input value={g('tax_number')} onChange={v => set('tax_number', v)} placeholder="1234567890" />
            </FieldGroup>
            <FieldGroup label="Vergi Dairesi">
              <Input value={g('tax_office')} onChange={v => set('tax_office', v)} placeholder="Beşiktaş" />
            </FieldGroup>
            <FieldGroup label="Ticaret Sicil No">
              <Input value={g('trade_registry')} onChange={v => set('trade_registry', v)} placeholder="TR-123456" />
            </FieldGroup>
            <FieldGroup label="TURSAB Belge No" hint="Turizm acentesi lisans numarası">
              <Input value={g('tursab_no')} onChange={v => set('tursab_no', v)} placeholder="1234" />
            </FieldGroup>
            <FieldGroup label="Kuruluş Yılı">
              <Input value={g('founded_year')} onChange={v => set('founded_year', v)} placeholder="1984" type="number" />
            </FieldGroup>
          </Row>
          <FieldGroup label="Footer Telif Hakkı Metni">
            <Input value={g('copyright_text')} onChange={v => set('copyright_text', v)} placeholder="© 2025 City Turizm A.Ş. Tüm hakları saklıdır." />
          </FieldGroup>
          <SaveBar onSave={() => save()} saving={saving} />
        </div>
      )

      // ── System ─────────────────────────────────────────────────────────────
      case 'system': return (
        <div className="space-y-5">
          <PanelHeader icon={Clock} title="Sistem Bilgisi" subtitle="Teknik platform ve yapılandırma detayları" />
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: 'Framework',    value: 'Next.js 15 (App Router)' },
              { label: 'Veritabanı',   value: 'Supabase (PostgreSQL)' },
              { label: 'Depolama',     value: 'Supabase Storage' },
              { label: 'Barındırma',   value: 'Vercel / Self-hosted' },
              { label: 'Sitemap',      value: '/sitemap.xml', link: '/sitemap.xml' },
              { label: 'Robots',       value: '/robots.txt',  link: '/robots.txt' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</p>
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    {item.value} <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <p className="text-xs font-semibold text-gray-700">{item.value}</p>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Veritabanı Migration
            </p>
            <p className="text-[11px] text-amber-600 mb-3">Henüz oluşturulmadıysa aşağıdaki SQL'i Supabase panelinde çalıştırın:</p>
            <div className="relative">
              <pre className="text-[10px] font-mono bg-white/80 text-gray-700 p-3 rounded-lg overflow-x-auto border border-amber-100">
{`CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`}
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS site_settings (\n  key        TEXT PRIMARY KEY,\n  value      TEXT,\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n);`)}
                className="absolute top-2 right-2 p-1.5 bg-amber-100 hover:bg-amber-200 rounded-lg text-amber-700 transition-colors">
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )

      default: return null
    }
  }

  const currentNav = NAV_ITEMS.find(n => n.id === active)!

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">

      {/* ── Sidebar Navigation ──────────────────────────────────────────────── */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <Settings className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">Ayarlar</p>
              <p className="text-[10px] text-gray-400">Sistem yapılandırması</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {NAV_ITEMS.map(item => {
            const isActive = active === item.id
            return (
              <button key={item.id} onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all mb-0.5 group
                  ${isActive
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <item.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-600'}`} strokeWidth={1.75} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${isActive ? 'text-amber-800' : ''}`}>{item.label}</p>
                </div>
                {isActive && <ChevronRight className="w-3 h-3 text-amber-500 flex-shrink-0" />}
              </button>
            )
          })}
        </nav>

        <div className="px-4 py-3 border-t border-gray-100">
          <button onClick={load}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>
      </aside>

      {/* ── Content area ─────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-xs text-gray-400">
            <Settings className="w-3.5 h-3.5" />
            <span>Ayarlar</span>
            <ChevronRight className="w-3 h-3" />
            <span className="font-semibold text-gray-700">{currentNav.label}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={active} {...fadeIn}>
              {renderPanel()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} ok={toast.ok} />}
      </AnimatePresence>
    </div>
  )
}
