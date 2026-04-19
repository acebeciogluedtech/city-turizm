'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Bus, Briefcase, Shield, Heart } from 'lucide-react'

const stats = [
  {
    icon: Bus,
    value: 1000,
    suffix: '+',
    label: 'Geniş Filo',
    description: 'Modern araç filosu',
  },
  {
    icon: Briefcase,
    value: 100,
    suffix: '+',
    label: 'Kurumsal Müşteri',
    description: 'Güvenilen iş ortakları',
  },
  {
    icon: Shield,
    value: 20000,
    suffix: '+',
    label: 'Güvenli Yolcu',
    description: 'Memnun seyahat edenler',
  },
  {
    icon: Heart,
    value: 500,
    suffix: '+',
    label: 'Mutlu Ekip Arkadaşı',
    description: 'Uzman ve tutkulu ekip',
  },
]

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 1800
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, target])

  return (
    <span ref={ref}>
      {count.toLocaleString('tr-TR')}{suffix}
    </span>
  )
}

export default function StatsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`
                group relative flex flex-col items-center text-center
                py-8 px-4 md:py-10 md:px-8
                ${i % 2 === 0 && i < 3 ? 'border-r border-gray-100' : ''}
                ${i < 2 ? 'border-b border-gray-100 lg:border-b-0' : ''}
                lg:border-r lg:last:border-r-0
                transition-all duration-300 ease-out
                hover:bg-amber-500 hover:shadow-2xl hover:shadow-amber-500/25
                hover:-translate-y-2 hover:scale-[1.04] hover:z-10
                cursor-pointer rounded-2xl
              `}
            >
              {/* İkon — turuncu daire */}
              <div className="relative mb-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 group-hover:bg-white/20
                                flex items-center justify-center transition-all duration-300
                                border border-amber-100 group-hover:border-white/30
                                group-hover:scale-110">
                  <stat.icon
                    className="w-6 h-6 text-amber-500 group-hover:text-white transition-colors duration-300"
                    strokeWidth={1.5}
                  />
                </div>
                {/* Pulse efekti */}
                <div className="absolute inset-0 rounded-2xl bg-white/20
                                opacity-0 group-hover:opacity-100 scale-110
                                transition-all duration-300 blur-sm" />
              </div>

              {/* Sayı */}
              <div className="text-3xl md:text-4xl font-black text-gray-900 group-hover:text-white leading-none mb-1.5 transition-colors duration-300">
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>

              {/* Etiket */}
              <div className="font-bold text-gray-800 group-hover:text-white/90 text-sm md:text-base mb-1 transition-colors duration-300">
                {stat.label}
              </div>

              {/* Açıklama */}
              <div className="text-gray-400 group-hover:text-white/70 text-xs leading-relaxed hidden md:block transition-colors duration-300">
                {stat.description}
              </div>

              {/* Alt beyaz çizgi — hover'da görünür */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-0
                              bg-white group-hover:w-16
                              transition-all duration-300 rounded-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
