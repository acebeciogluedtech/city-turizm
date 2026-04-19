'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, Mail, MapPin, Clock,
  MessageSquare, Printer,
  ArrowRight, Globe, Headphones,
  Send, CheckCircle, AlertCircle, User, AtSign, PhoneCall, FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/language'
import type { BilingualContent } from '@/lib/content'

type OfficeId = 'merkez' | 'umraniye' | 'kocaeli'
type FormStatus = 'idle' | 'sending' | 'success' | 'error'

interface Props {
  initialContent: BilingualContent
}

export default function IletisimClient({ initialContent }: Props) {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const [activeOffice, setActiveOffice] = useState<OfficeId>('merkez')

  /* ── Contact form state ── */
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  })
  const [formStatus, setFormStatus] = useState<FormStatus>('idle')

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return
    setFormStatus('sending')
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.subject
            ? `[${formData.subject}] ${formData.message}`
            : formData.message,
          source: 'contact',
        }),
      })
      if (!res.ok) throw new Error()
      setFormStatus('success')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch {
      setFormStatus('error')
    }
  }

  /** Get content value — picks language from bilingual data */
  function v(sectionId: string, fieldId: string, fallback = ''): string {
    const entry = initialContent[`${sectionId}.${fieldId}`]
    if (!entry) return fallback
    const val = lang === 'tr' ? entry.tr : (entry.en || entry.tr)
    return val || fallback
  }

  const heroImg = v('hero', 'hero_img', '/city-bina.jpeg')

  const offices: { id: OfficeId; icon: string; defaultName: string }[] = [
    { id: 'merkez',   icon: '🏛', defaultName: 'Merkez' },
    { id: 'umraniye', icon: '🏢', defaultName: 'Ümraniye Ofis' },
    { id: 'kocaeli',  icon: '🏭', defaultName: 'Kocaeli Ofis' },
  ]

  const activeData = offices.find(o => o.id === activeOffice)!

  return (
    <main className="min-h-screen bg-[#FAFAFA]">

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-[520px] flex items-end overflow-hidden">
        {/* Background image */}
        {heroImg && (
          <img src={heroImg} alt=""
            className="absolute inset-0 w-full h-full object-cover scale-105"
            style={{ filter: 'brightness(0.55)' }}
          />
        )}
        {/* Gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-gray-900/20" />

        {/* Decorative amber line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500" />

        {/* Content */}
        <div className="relative container mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-14 sm:pb-20 z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30
                         backdrop-blur-sm text-amber-300 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {v('hero', 'badge', 'İletişim')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-[1.05] tracking-tight"
            >
              {v('hero', 'title', 'Bize Ulaşın')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg text-slate-300/90 max-w-xl leading-relaxed"
            >
              {v('hero', 'subtitle', 'Sorularınız, talepleriniz veya önerileriniz için 7/24 yanınızdayız.')}
            </motion.p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CONTACT INFO BAR
      ══════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {[
              { icon: Headphones, id: 'c1', color: 'text-amber-500',   bg: 'bg-amber-50',   href: `tel:${(v('info_bar', 'c1_value', '4441289')).replace(/\s/g, '')}`,      defLabel: en ? 'Call Center' : 'Call Center', defValue: '444 12 89',              defSub: en ? '24/7 at your service' : '7/24 hizmetinizdeyiz' },
              { icon: Mail,       id: 'c2', color: 'text-blue-500',    bg: 'bg-blue-50',    href: `mailto:${v('info_bar', 'c2_value', 'info@cityturizm.com')}`,            defLabel: en ? 'E-Mail' : 'E-Posta',          defValue: 'info@cityturizm.com',    defSub: en ? 'Reply within 4 hours' : 'En geç 4 saat içinde yanıt' },
              { icon: Clock,      id: 'c3', color: 'text-emerald-500', bg: 'bg-emerald-50', href: null,                                                                    defLabel: en ? 'Working Hours' : 'Çalışma Saati', defValue: en ? 'Mon – Sat' : 'Pzt – Cmt', defSub: '09:00 – 18:00' },
              { icon: Globe,      id: 'c4', color: 'text-purple-500',  bg: 'bg-purple-50',  href: null,                                                                    defLabel: en ? 'Office Count' : 'Ofis Sayısı', defValue: en ? '3 Locations' : '3 Lokasyon', defSub: 'İstanbul (×2) & Kocaeli' },
            ].map((card, i) => {
              const label = v('info_bar', `${card.id}_label`, card.defLabel)
              const value = v('info_bar', `${card.id}_value`, card.defValue)
              const sub = v('info_bar', `${card.id}_sub`, card.defSub)
              const inner = (
                <div className="flex items-center gap-4 px-4 sm:px-6 py-4 sm:py-5">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', card.bg)}>
                    <card.icon className={cn('w-5 h-5', card.color)} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                    <p className="text-sm font-black text-gray-900 leading-snug truncate sm:truncate break-all sm:break-normal">{value}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{sub}</p>
                  </div>
                </div>
              )
              return (
                <motion.div key={card.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                >
                  {card.href ? (
                    <a href={card.href} className="block hover:bg-gray-50 transition-colors">{inner}</a>
                  ) : (
                    <div>{inner}</div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          OFFICES SECTION
      ══════════════════════════════════════════════ */}
      <section className="container mx-auto px-6 py-14 mb-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">{v('offices', 'offices_badge', en ? 'Our Offices' : 'Ofislerimiz')}</p>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{v('offices', 'offices_title', en ? '3 Locations at Your Service' : '3 Konumda Yanınızdayız')}</h2>
          </div>
          {/* Office tabs */}
          <div className="flex items-center bg-gray-100 rounded-2xl p-1 gap-1">
            {offices.map(o => (
              <button key={o.id} onClick={() => setActiveOffice(o.id)}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200',
                  activeOffice === o.id
                    ? 'bg-white text-gray-900 shadow-md shadow-black/8'
                    : 'text-gray-400 hover:text-gray-700'
                )}>
                {v(o.id, 'name', o.defaultName)}
              </button>
            ))}
          </div>
        </div>

        {/* Office card with map */}
        <AnimatePresence mode="wait">
          <motion.div key={activeOffice}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xl shadow-black/5"
          >
            {/* Info bar — horizontal, above map */}
            <div className="px-8 py-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 justify-between mb-5">
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">
                    {v(activeOffice, 'name', activeData.defaultName)}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    {v(activeOffice, 'office_title')}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(v(activeOffice, 'address'))}`}
                  target="_blank" rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-200
                             text-gray-600 hover:text-amber-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 self-start"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Google Maps
                  <ArrowRight className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <OfficeRow
                  icon={<MapPin className="w-4 h-4 text-amber-500" strokeWidth={1.75} />}
                  bg="bg-amber-50"
                  label={en ? 'Address' : 'Adres'}
                  value={v(activeOffice, 'address')}
                  multiline
                />
                <OfficeRow
                  icon={<Headphones className="w-4 h-4 text-emerald-500" strokeWidth={1.75} />}
                  bg="bg-emerald-50"
                  label="Call Center"
                  value={v(activeOffice, 'call_center', '444 12 89')}
                  href={`tel:${v(activeOffice, 'call_center', '4441289').replace(/\s/g, '')}`}
                />
                <OfficeRow
                  icon={<Phone className="w-4 h-4 text-blue-500" strokeWidth={1.75} />}
                  bg="bg-blue-50"
                  label={en ? 'Phone' : 'Telefon'}
                  value={v(activeOffice, 'phone')}
                />
                <OfficeRow
                  icon={<Printer className="w-4 h-4 text-purple-500" strokeWidth={1.75} />}
                  bg="bg-purple-50"
                  label={en ? 'Fax' : 'Faks'}
                  value={v(activeOffice, 'fax')}
                />
                <OfficeRow
                  icon={<Mail className="w-4 h-4 text-rose-500" strokeWidth={1.75} />}
                  bg="bg-rose-50"
                  label={en ? 'Email' : 'E-Posta'}
                  value={v(activeOffice, 'email', 'info@cityturizm.com')}
                  href={`mailto:${v(activeOffice, 'email', 'info@cityturizm.com')}`}
                />
              </div>
            </div>

            {/* Map — full width below info bar */}
            <div className="relative h-[380px] bg-slate-100">
              {v(activeOffice, 'map_url') ? (
                <iframe
                  src={v(activeOffice, 'map_url')}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
                  <MapPin className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-sm text-slate-400 font-medium">Harita URL&apos;si admin panelinden ekleyin</p>
                </div>
              )}
              <div className="absolute inset-0 pointer-events-none"
                style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.06)' }} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Office switcher dots — mobile hint */}
        <div className="flex justify-center gap-2 mt-5">
          {offices.map(o => (
            <button key={o.id} onClick={() => setActiveOffice(o.id)}
              className={cn(
                'rounded-full transition-all duration-200',
                activeOffice === o.id ? 'w-6 h-2 bg-amber-500' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              )}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CONTACT FORM SECTION
      ══════════════════════════════════════════════ */}
      <section className="bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 py-16">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">
              {v('form', 'sec_badge', en ? 'Get in Touch' : 'İletişim Formu')}
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-3">
              {v('form', 'sec_title', en ? 'Send Us a Message' : 'Bize Mesaj Gönderin')}
            </h2>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              {v('form', 'sec_desc', en
                ? 'Fill out the form below and our team will get back to you within 4 hours.'
                : 'Aşağıdaki formu doldurun, ekibimiz en geç 4 saat içinde size dönüş yapsın.')}
            </p>
          </motion.div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-black/5 overflow-hidden">
              <div className="grid lg:grid-cols-5">

                {/* Left decorative panel */}
                <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 p-8 lg:p-10 text-white relative overflow-hidden">
                  {/* Decorative circles */}
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-500/8 rounded-full blur-2xl" />

                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-6">
                      <MessageSquare className="w-6 h-6 text-amber-400" />
                    </div>
                    <h3 className="text-2xl font-black mb-3 leading-tight">
                      {v('form', 'left_title', en ? "We'd love to hear from you" : 'Sizden haber almak isteriz')}
                    </h3>
                    <p className="text-slate-300/80 text-sm leading-relaxed mb-8">
                      {v('form', 'left_desc', en
                        ? 'Whether you have a question, suggestion, or business inquiry — our team is always ready to help.'
                        : 'Sorunuz, öneriniz veya iş birliği talebiniz olsun — ekibimiz her zaman yardıma hazır.')}
                    </p>

                    <div className="space-y-4">
                      {[
                        { icon: Headphones, labelId: 'info1_label', descId: 'info1_desc', defLabel: en ? 'Quick Response' : 'Hızlı Yanıt', defDesc: en ? 'Within 4 hours' : '4 saat içinde' },
                        { icon: Globe,      labelId: 'info2_label', descId: 'info2_desc', defLabel: en ? '3 Offices' : '3 Ofis',           defDesc: en ? 'İstanbul & Kocaeli' : 'İstanbul & Kocaeli' },
                        { icon: Clock,      labelId: 'info3_label', descId: 'info3_desc', defLabel: en ? 'Business Hours' : 'Çalışma Saatleri', defDesc: en ? 'Mon–Sat 09:00–18:00' : 'Pzt–Cmt 09:00–18:00' },
                      ].map((item) => (
                        <div key={item.labelId} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                            <item.icon className="w-4 h-4 text-amber-400" strokeWidth={1.75} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{v('form', item.labelId, item.defLabel)}</p>
                            <p className="text-xs text-slate-400">{v('form', item.descId, item.defDesc)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right form panel */}
                <div className="lg:col-span-3 p-8 lg:p-10">
                  <AnimatePresence mode="wait">
                    {formStatus === 'success' ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center text-center py-12"
                      >
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                          <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">
                          {en ? 'Message Sent!' : 'Mesajınız Gönderildi!'}
                        </h3>
                        <p className="text-sm text-gray-400 mb-6">
                          {en
                            ? 'Thank you for reaching out. We\'ll get back to you shortly.'
                            : 'Bizimle iletişime geçtiğiniz için teşekkürler. En kısa sürede dönüş yapacağız.'}
                        </p>
                        <button
                          onClick={() => setFormStatus('idle')}
                          className="text-sm font-bold text-amber-500 hover:text-amber-600 transition-colors"
                        >
                          {en ? 'Send another message' : 'Yeni mesaj gönder'}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleFormSubmit}
                        className="space-y-5"
                      >
                        {/* Name & Email row */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                              {v('form', 'label_name', en ? 'Full Name' : 'Ad Soyad')} <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" strokeWidth={1.75} />
                              <input
                                name="name" type="text" required
                                value={formData.name} onChange={handleFormChange}
                                placeholder={en ? 'John Doe' : 'Adınız Soyadınız'}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-300
                                           focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                              {v('form', 'label_email', en ? 'E-mail' : 'E-Posta')} <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" strokeWidth={1.75} />
                              <input
                                name="email" type="email" required
                                value={formData.email} onChange={handleFormChange}
                                placeholder={en ? 'your@email.com' : 'ornek@mail.com'}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-300
                                           focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Phone & Subject row */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                              {v('form', 'label_phone', en ? 'Phone' : 'Telefon')}
                            </label>
                            <div className="relative">
                              <PhoneCall className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" strokeWidth={1.75} />
                              <input
                                name="phone" type="tel"
                                value={formData.phone} onChange={handleFormChange}
                                placeholder={en ? '+90 5XX XXX XX XX' : '+90 5XX XXX XX XX'}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-300
                                           focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                              {v('form', 'label_konu', en ? 'Subject' : 'Konu')}
                            </label>
                            <div className="relative">
                              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" strokeWidth={1.75} />
                              <select
                                name="subject"
                                value={formData.subject} onChange={handleFormChange}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900
                                           focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all appearance-none"
                              >
                                <option value="">{en ? 'Select a topic...' : 'Konu seçiniz...'}</option>
                                <option value={en ? 'General Inquiry' : 'Genel Bilgi'}>{en ? 'General Inquiry' : 'Genel Bilgi'}</option>
                                <option value={en ? 'Quote Request' : 'Teklif Talebi'}>{en ? 'Quote Request' : 'Teklif Talebi'}</option>
                                <option value={en ? 'Partnership' : 'İş Birliği'}>{en ? 'Partnership' : 'İş Birliği'}</option>
                                <option value={en ? 'Complaint' : 'Şikayet'}>{en ? 'Complaint' : 'Şikayet'}</option>
                                <option value={en ? 'Suggestion' : 'Öneri'}>{en ? 'Suggestion' : 'Öneri'}</option>
                                <option value={en ? 'Other' : 'Diğer'}>{en ? 'Other' : 'Diğer'}</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Message */}
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                            {v('form', 'label_mesaj', en ? 'Message' : 'Mesajınız')} <span className="text-red-400">*</span>
                          </label>
                          <textarea
                            name="message" required rows={4}
                            value={formData.message} onChange={handleFormChange}
                            placeholder={en ? 'Write your message here...' : 'Mesajınızı buraya yazınız...'}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-300
                                       focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all resize-none"
                          />
                        </div>

                        {/* Error message */}
                        {formStatus === 'error' && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                          >
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <p className="text-xs font-semibold text-red-600">
                              {en ? 'Something went wrong. Please try again.' : 'Bir hata oluştu. Lütfen tekrar deneyin.'}
                            </p>
                          </motion.div>
                        )}

                        {/* Submit button */}
                        <button
                          type="submit"
                          disabled={formStatus === 'sending'}
                          className={cn(
                            'w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm transition-all duration-200',
                            formStatus === 'sending'
                              ? 'bg-gray-100 text-gray-400 cursor-wait'
                              : 'bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]'
                          )}
                        >
                          {formStatus === 'sending' ? (
                            <>
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                              {en ? 'Sending...' : 'Gönderiliyor...'}
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" strokeWidth={2} />
                              {v('form', 'btn_submit', en ? 'Send Message' : 'Mesaj Gönder')}
                            </>
                          )}
                        </button>

                        <p className="text-[11px] text-gray-300 text-center">
                          {v('form', 'privacy_note', en
                            ? 'By submitting this form, you agree to our privacy policy.'
                            : 'Formu göndererek gizlilik politikamızı kabul etmiş olursunuz.')}
                        </p>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </main>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OfficeRow({ icon, bg, label, value, href, multiline }: {
  icon: React.ReactNode; bg: string; label: string; value: string
  href?: string | null; multiline?: boolean
}) {
  const inner = (
    <div className="flex flex-col gap-2 p-3 rounded-2xl bg-gray-50 border border-gray-100 h-full">
      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={cn('text-xs font-semibold text-gray-800 leading-relaxed', multiline && 'whitespace-pre-line')}>
          {value || '—'}
        </p>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block hover:opacity-80 transition-opacity h-full">
        {inner}
      </a>
    )
  }
  return inner
}
