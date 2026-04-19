'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, ArrowRight } from 'lucide-react'
import { destinations } from '@/data/mock'

export default function Destinations() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mb-3"
          >
            <div className="w-8 h-0.5 bg-amber-600" />
            <span className="text-amber-600 text-sm font-semibold uppercase tracking-widest">Destinasyonlar</span>
            <div className="w-8 h-0.5 bg-amber-600" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black text-gray-900 mb-4"
          >
            Popüler Destinasyonlar
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 leading-relaxed"
          >
            Dünyatın en güzel köşelerini keşfetmek için en iyi destinasyonları sizin için seçtik.
          </motion.p>
        </div>

        {/* Grid — Masonry-style */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={i === 0 ? 'row-span-2' : ''}
            >
              <Link href={`/destinasyonlar/${dest.slug}`} className="group block relative overflow-hidden rounded-2xl h-full">
                <div className={`relative overflow-hidden ${i === 0 ? 'h-full min-h-[400px]' : 'h-48 md:h-56'}`}>
                  <Image
                    src={dest.image_url}
                    alt={dest.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                    <div className="flex items-center gap-1.5 text-amber-300 text-xs mb-1.5">
                      <MapPin className="w-3 h-3" />
                      <span>{dest.country}</span>
                    </div>
                    <h3 className="text-white font-black text-xl md:text-2xl mb-1">{dest.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-xs">{dest.tour_count} tur paketi</span>
                      <div className="w-7 h-7 bg-amber-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
