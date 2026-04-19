'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, Bus, GraduationCap, Car, Globe, Fuel, ArrowRight,
  ChevronRight, CheckCircle,
} from 'lucide-react'
import QuoteForm from '@/components/QuoteForm'
import { useLanguage } from '@/lib/language'

const SERVICE_CATEGORIES = [
  { id: 'personel-tasimacilik', icon: Bus,            labelTr: 'Personel Taşımacılığı', labelEn: 'Personnel Transport',  descTr: 'Kurumsal personel servis hizmeti', descEn: 'Corporate personnel shuttle service' },
  { id: 'ogrenci-tasimacilik',  icon: GraduationCap,  labelTr: 'Öğrenci Taşımacılığı',  labelEn: 'Student Transport',    descTr: 'Okul servisi ve öğrenci taşıma', descEn: 'School shuttle and student transport' },
  { id: 'ozel-transfer',        icon: Car,             labelTr: 'Özel Transfer',          labelEn: 'Private Transfer',     descTr: 'VIP ve özel transfer hizmeti', descEn: 'VIP and private transfer service' },
  { id: 'arac-kiralama',        icon: Car,             labelTr: 'Araç Kiralama',          labelEn: 'Vehicle Rental',       descTr: 'Şoförlü ve şoförsüz araç kiralama', descEn: 'Chauffeur-driven and self-drive rental' },
  { id: 'turizm-acenteligi',    icon: Globe,           labelTr: 'Turizm Acenteliği',      labelEn: 'Travel Agency',        descTr: 'Tur, vize ve otel rezervasyonu', descEn: 'Tour, visa and hotel reservations' },
  { id: 'akaryakit-istasyonu',   icon: Fuel,            labelTr: 'Akaryakıt İstasyonu',    labelEn: 'Fuel Station',         descTr: 'Kurumsal yakıt anlaşması', descEn: 'Corporate fuel agreements' },
]

export default function TeklifAlPage() {
  const { lang } = useLanguage()
  const [selected, setSelected] = useState<string | null>(null)
  const en = lang === 'en'

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <div className="bg-amber-500 pt-36 pb-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white text-xs font-bold tracking-widest">{en ? 'QUICK RESPONSE' : 'HIZLI YANIT'}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-3">{en ? 'Get a Quote' : 'Teklif Alın'}</h1>
            <p className="text-white/80 text-base max-w-lg mx-auto">
              {en
                ? 'Select the service category, fill out the form, and our team will contact you shortly.'
                : 'Hizmet kategorinizi seçin, formu doldurun, ekibimiz en kısa sürede size ulaşsın.'}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-10 pb-24">
        <AnimatePresence mode="wait">
          {!selected ? (
            /* ── Kategori Seçimi ── */
            <motion.div
              key="category-select"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-8 py-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-sm">{en ? 'Select Service' : 'Hizmet Seçin'}</p>
                    <p className="text-xs text-gray-400">{en ? 'Which service would you like a quote for?' : 'Hangi hizmet için teklif almak istiyorsunuz?'}</p>
                  </div>
                </div>

                <div className="p-6 grid sm:grid-cols-2 gap-3">
                  {SERVICE_CATEGORIES.map((cat, i) => {
                    const Icon = cat.icon
                    return (
                      <motion.button
                        key={cat.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        onClick={() => setSelected(cat.id)}
                        className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white
                                   hover:border-amber-300 hover:shadow-md hover:shadow-amber-500/10
                                   hover:-translate-y-0.5 transition-all duration-200 text-left"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-50 group-hover:bg-amber-500 flex items-center justify-center transition-colors duration-200">
                          <Icon className="w-6 h-6 text-amber-500 group-hover:text-white transition-colors duration-200" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm">{en ? cat.labelEn : cat.labelTr}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{en ? cat.descEn : cat.descTr}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            /* ── Teklif Formu ── */
            <motion.div
              key="quote-form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="max-w-xl mx-auto"
            >
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                {/* Seçili kategori gösterimi */}
                <div className="bg-gray-50 border-b border-gray-100 px-8 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                        {(() => {
                          const cat = SERVICE_CATEGORIES.find(c => c.id === selected)
                          const Icon = cat?.icon || Phone
                          return <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                        })()}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-sm">
                          {en
                            ? SERVICE_CATEGORIES.find(c => c.id === selected)?.labelEn
                            : SERVICE_CATEGORIES.find(c => c.id === selected)?.labelTr}
                        </p>
                        <p className="text-xs text-gray-400">{en ? 'Fill in your details below' : 'Bilgilerinizi girin, size özel teklif hazırlayalım'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="text-xs font-semibold text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1"
                    >
                      {en ? 'Change' : 'Değiştir'}
                    </button>
                  </div>

                  {/* Seçili kategori badge */}
                  <div className="mt-3 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs text-green-600 font-semibold">
                      {en
                        ? SERVICE_CATEGORIES.find(c => c.id === selected)?.labelEn
                        : SERVICE_CATEGORIES.find(c => c.id === selected)?.labelTr}
                      {en ? ' selected' : ' seçildi'}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <QuoteForm source={selected} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </main>
  )
}
