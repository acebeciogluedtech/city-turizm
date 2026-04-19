'use client'

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    category: 'Taşımacılık',
    items: [
      {
        q: 'Personel servis hizmetiniz nasıl işliyor?',
        a: 'Çalışanlarınızın ikamet adreslerine göre optimizasyon yazılımlarımız aracılığıyla en verimli güzergahlar belirleniyor. Tüm araçlarımız GPS takipli olup sürücülerimiz düzenli eğitimden geçmektedir. Sabah ve akşam olmak üzere çift yönlü servis planlaması yapılmaktadır.',
      },
      {
        q: 'Öğrenci taşımacılığında güvenlik nasıl sağlanıyor?',
        a: 'Tüm araçlarımızda kamera sistemi, emniyet kemeri ve GPS takibi mevcuttur. Sürücülerimiz SRC belgeli ve psikoteknik test onaylıdır. Veliler anlık konum bildirimi alabilmektedir. Araçlarımız düzenli teknik bakımdan geçmekte ve zorunlu sigorta kapsamında bulunmaktadır.',
      },
      {
        q: 'Yurt dışı VIP transfer hizmetleriniz hangi ülkeleri kapsıyor?',
        a: 'Başta Avrupa olmak üzere Ortadoğu ve Körfez ülkelerine yönelik VIP transfer hizmetleri sunmaktayız. İstanbul\'dan tüm uluslararası destinasyonlara karşılama ve transfer organizasyonu yapılmaktadır. Çok dilli rehberlik ve lounge hizmeti de talep üzerine sağlanmaktadır.',
      },
      {
        q: 'Toplantı ve seminer transferlerinde kaç kişilik gruplarla çalışıyorsunuz?',
        a: '10 kişilik küçük toplantılardan 3000+ katılımcılı uluslararası kongrelere kadar her ölçekte operasyon yürütme kapasitesine sahibiz. Farklı araç tipleriyle esnek konfigürasyon sağlanmakta, konferans merkezi ve otel koordinasyonu da ekibimiz tarafından üstlenilmektedir.',
      },
    ],
  },
  {
    category: 'Araç & Kiralama',
    items: [
      {
        q: 'Araç kiralama için hangi seçenekler mevcut?',
        a: 'Günlük, haftalık, aylık ve uzun dönem kiralama seçenekleri sunulmaktadır. Filomuzda 4-8 kişilik VIP minibüsler, 9-17 kişilik midibüsler ile 18-35 ve 36+ kişilik büyük otobüsler bulunmaktadır. Şoförlü veya şoförsüz kiralama talebinize göre teklif hazırlanmaktadır.',
      },
      {
        q: 'Araçlarınız hangi standartlarda?',
        a: 'Tüm araçlarımız klimalı, GPS takipli, yangın tüplü ve ilk yardım kitleri ile donatılmıştır. Ortalama araç yaşımız 3 yıl altında tutulmakta; periyodik bakım ve teknik kontroller düzenli olarak yapılmaktadır. Araçlarımızın tamamı zorunlu Mali Mesuliyet sigortası kapsamındadır.',
      },
      {
        q: 'Uzun dönem kiralama için nasıl bir süreç işliyor?',
        a: 'Kurumsal müşterilerimize özel sözleşme koşulları sunulmaktadır. Talep formu veya satış ekibimizle görüşme ile başlayan süreçte ihtiyaç analizi yapılır, uygun araç ve fiyatlandırma belirlenir. Sözleşme imzalanmasının ardından araçlar belirlenen tarihte teslim edilir.',
      },
      {
        q: 'Akaryakıt istasyonunuzda hangi hizmetler sunuluyor?',
        a: 'City Turizm akaryakıt istasyonlarımızda benzin, motorin ve LPG ikmali yapılmaktadır. Kurumsal filo müşterilerimize özel fatura ve tanker hizmetleri de sunulmaktadır. İstasyonlarımız 7/24 hizmet vermekte olup araç yıkama ve basit bakım hizmetleri de mevcuttur.',
      },
    ],
  },
  {
    category: 'Seyahat & Acentelik',
    items: [
      {
        q: 'A Grubu seyahat acenteliği ne anlama geliyor?',
        a: 'A Grubu lisansı, Kültür ve Turizm Bakanlığı tarafından verilen en kapsamlı seyahat acentesi belgesidir. Bu lisans kapsamında yurt içi ve yurt dışı paket tur düzenleyebilir, uçak bileti satabilir, otel ve transfer rezervasyonu yapabilir, kongre ve incentive turları organize edebiliriz.',
      },
      {
        q: 'Kurumsal incentive ve kongre turları düzenliyor musunuz?',
        a: 'Evet, şirketler için motivasyon gezileri, ödül turları ve uluslararası kongre organizasyonları en güçlü hizmet alanlarımızdan biridir. Ulaşım, konaklama, gezi programı ve tercümanlık dahil uçtan uca organizasyon sağlıyoruz.',
      },
      {
        q: 'Yurt dışı tur paketlerinizde vize desteği veriyor musunuz?',
        a: 'Tur paketlerimize vize danışmanlık hizmeti dahildir. Schengen, Amerika, Körfez ülkeleri ve diğer destinasyonlar için gerekli evrak listesi hazırlanır, randevu takibi yapılır ve süreç boyunca müşterilerimize rehberlik edilir.',
      },
      {
        q: 'Bireysel seyahat ile kurumsal seyahat paketleri arasındaki fark nedir?',
        a: 'Bireysel paketler belirli takvim ve programlar dahilinde sunulurken, kurumsal paketler şirketin takvimi, katılımcı sayısı ve bütçesine göre tamamen özelleştirilebilmektedir. Kurumsal müşterilerimize fatura ve kurumsal ödeme kolaylığı da sağlanmaktadır.',
      },
    ],
  },
  {
    category: 'Rezervasyon & Ödeme',
    items: [
      {
        q: 'Rezervasyon nasıl yapabilirim?',
        a: 'Web sitemizdeki iletişim formu, 444 1 289 numaralı çağrı merkezimiz veya +90 212 543 80 97 hattı üzerinden rezervasyon talebinde bulunabilirsiniz. Kurumsal müşterilerimiz için atanmış müşteri temsilcisi aracılığıyla da işlem yapılabilmektedir.',
      },
      {
        q: 'Ödeme seçenekleriniz nelerdir?',
        a: 'Tüm kredi ve banka kartları, banka havalesi/EFT ve kurumsal fatura seçenekleri mevcuttur. Belirli hizmetlerde peşin ödeme indirimi uygulanmaktadır. Uzun dönem kiralama ve büyük gruplar için özel ödeme planları oluşturulabilmektedir.',
      },
      {
        q: 'İptal politikanız nedir?',
        a: 'Hizmet başlangıcından 48 saat öncesine kadar yapılan iptallerde tam iade sağlanmaktadır. 24-48 saat arasındaki iptallerde %50 iade yapılır. 24 saatten kısa süreli iptallerde iade mümkün olmamaktadır. Mücbir sebep durumlarında (hastalık, doğal afet vb.) özel değerlendirme yapılmaktadır.',
      },
    ],
  },
]

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`border rounded-2xl overflow-hidden transition-all duration-200
                  ${open ? 'border-amber-300 shadow-md shadow-amber-500/10' : 'border-gray-200 hover:border-gray-300'}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white"
      >
        <span className={`font-semibold text-sm md:text-base transition-colors duration-200
                          ${open ? 'text-amber-600' : 'text-gray-800'}`}>
          {q}
        </span>
        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
                          transition-all duration-200
                          ${open ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
          {open ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden bg-white"
          >
            <p className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FaqSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [activeCategory, setActiveCategory] = useState('Taşımacılık')

  const current = faqs.find(f => f.category === activeCategory)!

  return (
    <section ref={ref} className="bg-gray-50 py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200
                          rounded-full px-4 py-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-amber-600 text-xs font-bold uppercase tracking-widest">SSS</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
            Sıkça Sorulan Sorular
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Merak ettiğiniz her şey burada. Cevabını bulamadığınız sorular için bizimle iletişime geçin.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Category tabs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-8 bg-white rounded-2xl p-1.5 border border-gray-200 shadow-sm"
          >
            {faqs.map(f => (
              <button
                key={f.category}
                onClick={() => setActiveCategory(f.category)}
                className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200
                            ${activeCategory === f.category
                              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                              : 'text-gray-500 hover:text-gray-800'}`}
              >
                {f.category}
              </button>
            ))}
          </motion.div>

          {/* FAQ items */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {current.items.map((item, i) => (
                <FaqItem key={item.q} q={item.q} a={item.a} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 text-center"
          >
            <p className="text-gray-500 text-sm mb-3">Sorunuzun cevabını bulamadınız mı?</p>
            <a href="#iletisim"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600
                         text-white font-bold text-sm px-6 py-3 rounded-xl transition-all
                         hover:-translate-y-0.5 shadow-lg shadow-amber-500/25">
              Bize Ulaşın
            </a>
          </motion.div>
        </div>

      </div>
    </section>
  )
}
