'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, Building2, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react'
import { useLanguage } from '@/lib/language'

interface Props {
  onSuccess?: () => void
  source?: string  // Which page the quote came from (e.g. 'personel-tasimacilik')
}

export default function QuoteForm({ onSuccess, source = 'genel' }: Props) {
  const { lang } = useLanguage()
  const [form, setForm] = useState({ ad: '', email: '', telefon: '', firma: '', mesaj: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const en = lang === 'en'

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    try {
      await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.ad,
          email: form.email,
          phone: form.telefon,
          company: form.firma,
          message: form.mesaj,
          source,
        }),
      })
    } catch (err) {
      console.error('Quote submit failed:', err)
    }
    setSending(false)
    setSent(true)
    onSuccess?.()
  }

  const fields = [
    { key: 'ad',      icon: User,      label: en ? 'Full Name'      : 'İsim Soyisim',       type: 'text',  placeholder: en ? 'Your full name'          : 'Adınız Soyadınız',         required: true },
    { key: 'email',   icon: Mail,      label: en ? 'Email Address'  : 'E-Posta Adresi',     type: 'email', placeholder: en ? 'example@company.com'     : 'ornek@firma.com',          required: true },
    { key: 'telefon', icon: Phone,     label: en ? 'Phone Number'   : 'Telefon Numarası',   type: 'tel',   placeholder: en ? '+90 (5__) ___ __ __'     : '0 (5__) ___ __ __',        required: true },
    { key: 'firma',   icon: Building2, label: en ? 'Company Name'   : 'Firma / Kurum Adı',  type: 'text',  placeholder: en ? 'Your company or organization' : 'Şirket veya kurum adınız', required: false },
  ] as const

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-8 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-black text-gray-900 mb-1">
          {en ? 'Request Received!' : 'Talebiniz Alındı!'}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {en
            ? <>Our team will contact you <strong className="text-gray-700">within 24 hours</strong>.</>
            : <>Ekibimiz <strong className="text-gray-700">24 saat içinde</strong> sizinle iletişime geçecek.</>
          }
        </p>
      </motion.div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.form
        key="form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {fields.map(f => {
          const Icon = f.icon
          return (
            <div key={f.key}>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                <Icon className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
                {f.label}{f.required && <span className="text-amber-500">*</span>}
              </label>
              <input
                type={f.type}
                required={f.required}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={set(f.key)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm
                           focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
              />
            </div>
          )
        })}

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
            {en ? 'Requests & Suggestions' : 'İstek ve Öneri'}
          </label>
          <textarea
            rows={4}
            placeholder={en ? 'Your service request, special requirements or questions...' : 'Hizmet talebiniz, özel istekleriniz veya sorularınız...'}
            value={form.mesaj}
            onChange={set('mesaj')}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm
                       focus:outline-none focus:border-amber-400 focus:bg-white transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600
                     text-white font-bold text-sm py-3.5 rounded-xl transition-all
                     hover:-translate-y-0.5 shadow-lg shadow-amber-500/25 disabled:opacity-60"
        >
          {sending
            ? (en ? 'Sending...' : 'Gönderiliyor...')
            : (en ? 'Send Quote Request' : 'Teklif Talebini Gönder')
          }
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.form>
    </AnimatePresence>
  )
}
