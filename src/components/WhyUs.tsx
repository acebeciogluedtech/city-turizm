'use client'

import { motion } from 'framer-motion'
import { Shield, Award, Headphones, Globe, CreditCard, ThumbsUp } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Güvenli Seyahat',
    description: 'Tüm turlarımız sigorta kapsamında, seyahatiniz boyunca güvencedeyiz.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Award,
    title: '15+ Yıl Tecrübe',
    description: 'Sektörde 15 yılı aşkın deneyimimizle en kaliteli hizmeti sunuyoruz.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Headphones,
    title: '7/24 Destek',
    description: 'Seyahatiniz süresince 7/24 müşteri desteği ve acil hat hizmetimiz.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Globe,
    title: '120+ Destinasyon',
    description: 'Türkiye ve dünya genelinde 120\'den fazla destinasyona özel turlar.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: CreditCard,
    title: 'Taksit İmkânı',
    description: 'Tüm kredi kartlarına 12 aya kadar taksit seçenekleri sunuyoruz.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: ThumbsUp,
    title: 'Memnuniyet Garantisi',
    description: '%98 müşteri memnuniyeti ile güvenilir seyahat deneyimi vaat ediyoruz.',
    color: 'bg-cyan-50 text-cyan-600',
  },
]

export default function WhyUs() {
  return (
    <section className="py-20 bg-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />
      </div>

      <div className="relative container mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mb-3"
          >
            <div className="w-8 h-0.5 bg-amber-500" />
            <span className="text-amber-400 text-sm font-semibold uppercase tracking-widest">Neden Biz?</span>
            <div className="w-8 h-0.5 bg-amber-500" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black text-white mb-4"
          >
            City Turizm Farkı
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 leading-relaxed"
          >
            Seyahat planlamasından dönüşe kadar her adımda yanınızdayız.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
