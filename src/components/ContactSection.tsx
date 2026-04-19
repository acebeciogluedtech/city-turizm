'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/lib/language'

interface Props {
  contentTr: Record<string, string>
  contentEn: Record<string, string>
}

export default function ContactSection({ contentTr, contentEn }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const { lang } = useLanguage()

  const c = lang === 'tr' ? contentTr : contentEn
  const v = (key: string, fallback = '') => c[key] || contentTr[key] || fallback

  const contactInfo = [
    {
      icon: Phone,
      label: v('contact.phone_label', 'Telefon'),
      primary: v('contact.phone_primary', '444 1 289'),
      secondary: v('contact.phone_secondary', '+90 212 543 80 97\n+90 212 583 61 61'),
      href: `tel:${v('contact.phone_primary', '4441289').replace(/\s/g, '')}`,
    },
    {
      icon: Mail,
      label: v('contact.email_label', 'E-posta'),
      primary: v('contact.email_primary', 'info@cityturizm.com'),
      secondary: v('contact.email_note', 'Yanıt süresi: 24 saat'),
      href: `mailto:${v('contact.email_primary', 'info@cityturizm.com')}`,
    },
    {
      icon: MapPin,
      label: v('contact.address_label', 'Adres'),
      primary: v('contact.address_short', 'Kartaltepe Mahallesi, Bakırköy / İstanbul'),
      secondary: v('contact.address_full', 'Kartaltepe Mahallesi, Koşuyolu Aksu Caddesi\nNo:48, Bakırköy - İstanbul'),
      href: 'https://maps.google.com',
    },
    {
      icon: Clock,
      label: v('contact.hours_label', 'Çalışma Saatleri'),
      primary: v('contact.hours_primary', 'Pzt – Cmt: 09:00 – 18:00'),
      secondary: v('contact.hours_note', 'Acil hat 7/24 hizmetinizde'),
      href: null as string | null,
    },
  ]

  const mapUrl = v('contact.map_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.711955377155!2d28.883813599999996!3d40.98778780000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cabb60ad6b0a01%3A0xffd0ff966811dacb!2sCity%20Turizm!5e0!3m2!1str!2str!4v1776474610666!5m2!1str!2str')

  return (
    <section id="iletisim" ref={ref} className="bg-white pb-20 md:pb-28">

      {/* ── Header ── */}
      <div className="bg-amber-500 py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30
                            rounded-full px-4 py-1.5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white text-xs font-bold uppercase tracking-widest">
                {v('contact.badge', 'İletişim')}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
              {v('contact.title', 'Bizimle İletişime Geçin')}
            </h2>
            <p className="text-white/80 text-base max-w-xl mx-auto">
              {v('contact.subtitle', 'Hizmetlerimiz hakkında bilgi almak veya teklif talep etmek için bize ulaşın.')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-8">

        {/* ── Info cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {contactInfo.map((ci, i) => {
            const inner = (
              <div className="h-full flex flex-col bg-white rounded-2xl border border-gray-200
                              shadow-sm p-5 transition-all duration-200
                              group-hover:border-amber-300 group-hover:shadow-md group-hover:shadow-amber-500/10
                              group-hover:-translate-y-1">
                {/* Icon row */}
                <div className="w-11 h-11 rounded-xl bg-amber-50 group-hover:bg-amber-500
                                flex items-center justify-center mb-4 transition-colors duration-200 flex-shrink-0">
                  <ci.icon className="w-5 h-5 text-amber-500 group-hover:text-white
                                     transition-colors duration-200" strokeWidth={1.75} />
                </div>

                {/* Label */}
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  {ci.label}
                </p>

                {/* Primary */}
                <p className="text-gray-900 font-bold text-sm leading-snug mb-1">
                  {ci.primary}
                </p>

                {/* Secondary */}
                <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-line mt-auto pt-2 border-t border-gray-100">
                  {ci.secondary}
                </p>

                {/* Arrow for linked cards */}
                {ci.href && (
                  <div className="flex items-center gap-1 mt-2 text-amber-500
                                  opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            )

            return (
              <motion.div
                key={ci.label}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.1 + i * 0.08 }}
                className="group h-full"
              >
                {ci.href ? (
                  <a href={ci.href}
                    target={ci.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="block h-full">
                    {inner}
                  </a>
                ) : (
                  <div className="h-full">{inner}</div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* ── Map + Form ── */}
        <div className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden
                        border border-gray-200 shadow-xl">

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative min-h-[420px]"
          >
            <iframe
              src={mapUrl}
              width="100%" height="100%"
              style={{ border: 0, minHeight: 420 }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
            />
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="bg-white px-8 md:px-10 py-10 flex flex-col justify-center"
          >
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">{lang === 'tr' ? 'Mesajınız İletildi' : 'Message Sent'}</h3>
                <p className="text-gray-500 text-sm">{lang === 'tr' ? 'En kısa sürede sizinle iletişime geçeceğiz.' : 'We will contact you as soon as possible.'}</p>
              </motion.div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-gray-900 mb-1">
                    {v('contact.form_title', 'Bize Yazın')}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {v('contact.form_subtitle', 'Ekibimiz en kısa sürede size ulaşacak.')}
                  </p>
                </div>

                <form onSubmit={async e => {
                  e.preventDefault()
                  try {
                    await fetch('/api/admin/messages', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ...form, source: 'contact' }),
                    })
                    setSent(true)
                  } catch {}
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                        {v('contact.label_name', 'Ad Soyad *')}
                      </label>
                      <input type="text" required value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder={v('contact.label_name', 'Ad Soyad').replace(' *', '')}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                                   text-gray-800 placeholder-gray-300 bg-gray-50
                                   focus:outline-none focus:border-amber-400 focus:bg-white transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                        {v('contact.label_phone', 'Telefon')}
                      </label>
                      <input type="tel" value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="+90 5__ ___ __ __"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                                   text-gray-800 placeholder-gray-300 bg-gray-50
                                   focus:outline-none focus:border-amber-400 focus:bg-white transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                      {v('contact.label_email', 'E-posta *')}
                    </label>
                    <input type="email" required value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="ornek@mail.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                                 text-gray-800 placeholder-gray-300 bg-gray-50
                                 focus:outline-none focus:border-amber-400 focus:bg-white transition-all" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                      {v('contact.label_message', 'Mesajınız *')}
                    </label>
                    <textarea required rows={4} value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Hizmet talebinizi veya sorunuzu yazın..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                                 text-gray-800 placeholder-gray-300 bg-gray-50
                                 focus:outline-none focus:border-amber-400 focus:bg-white
                                 transition-all resize-none" />
                  </div>

                  <button type="submit"
                    className="w-full flex items-center justify-center gap-2
                               bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm
                               py-4 rounded-xl transition-all hover:-translate-y-0.5
                               shadow-lg shadow-amber-500/25">
                    <Send className="w-4 h-4" />
                    {v('contact.button_text', 'Mesaj Gönder')}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>

      </div>
    </section>
  )
}
