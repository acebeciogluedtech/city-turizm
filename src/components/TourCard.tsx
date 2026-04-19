'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Clock, Users, MapPin, Heart } from 'lucide-react'
import { Tour } from '@/types'
import { useState } from 'react'

interface TourCardProps {
  tour: Tour
  index?: number
}

export default function TourCard({ tour, index = 0 }: TourCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/turlar/${tour.slug}`} className="group block">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
          {/* Image */}
          <div className="relative h-56 overflow-hidden">
            <Image
              src={tour.image_url}
              alt={tour.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                {tour.category}
              </span>
              {tour.featured && (
                <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Öne Çıkan
                </span>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted) }}
              className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
            >
              <Heart
                className="w-4 h-4 transition-colors"
                fill={isWishlisted ? '#ef4444' : 'none'}
                stroke={isWishlisted ? '#ef4444' : '#6b7280'}
              />
            </button>

            {/* Duration overlay */}
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {tour.duration_days} Gece
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-amber-600 transition-colors line-clamp-1">
                {tour.title}
              </h3>
              <div className="flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-0.5 rounded-lg">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-amber-700">{tour.rating}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{tour.destination}, {tour.country}</span>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
              {tour.short_description}
            </p>

            {/* Includes */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tour.includes.slice(0, 3).map((item) => (
                <span key={item} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                  {item}
                </span>
              ))}
              {tour.includes.length > 3 && (
                <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">
                  +{tour.includes.length - 3}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <span className="text-xs text-gray-400">Kişi başı</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-amber-600">
                    {tour.price.toLocaleString('tr-TR')}
                  </span>
                  <span className="text-sm font-semibold text-amber-600">₺</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <Users className="w-3.5 h-3.5" />
                <span>Max {tour.max_persons} kişi</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
