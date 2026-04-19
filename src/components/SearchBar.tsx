'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Calendar, Users, ChevronDown } from 'lucide-react'

export default function SearchBar() {
  const [activeTab, setActiveTab] = useState<'tour' | 'flight' | 'hotel'>('tour')

  const tabs = [
    { id: 'tour', label: 'Tur Ara' },
    { id: 'flight', label: 'Uçuş' },
    { id: 'hotel', label: 'Otel' },
  ] as const

  return (
    <section className="relative z-30 -mt-8">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl shadow-black/10 overflow-hidden"
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-4 text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-amber-600'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Search Fields */}
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Nereye gitmek istiyorsunuz?"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
                <input
                  type="date"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-gray-600"
                />
              </div>

              <div className="relative group">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-gray-600 appearance-none">
                  <option>1 Kişi</option>
                  <option>2 Kişi</option>
                  <option>3-5 Kişi</option>
                  <option>6-10 Kişi</option>
                  <option>10+ Kişi</option>
                </select>
              </div>

              <button className="bg-amber-600 hover:bg-amber-700 text-white py-3.5 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-amber-600/30 hover:-translate-y-0.5">
                <Search className="w-4 h-4" />
                Tur Ara
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
