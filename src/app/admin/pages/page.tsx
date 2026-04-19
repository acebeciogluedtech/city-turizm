'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, ArrowRight, ExternalLink, FileText, Layers, ChevronRight } from 'lucide-react'
import { pageDefinitions, pageCategoryLabels } from '@/lib/admin/definitions'
import type { PageDef } from '@/lib/admin/types'
import { cn } from '@/lib/utils'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
})

const categoryColors: Record<PageDef['category'], { bg: string; text: string; border: string; icon: string }> = {
  'ana-sayfa':  { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: 'bg-amber-500' },
  'hizmetler':  { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: 'bg-blue-500' },
  'kurumsal':   { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', icon: 'bg-purple-500' },
  'medya':      { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', icon: 'bg-pink-500' },
  'duyurular':  { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', icon: 'bg-orange-500' },
  'iletisim':   { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: 'bg-emerald-500' },
  'diger':      { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', icon: 'bg-gray-500' },
}

const categoryBadge: Record<PageDef['category'], string> = {
  'ana-sayfa':  'bg-amber-50 text-amber-600 border-amber-200',
  'hizmetler':  'bg-blue-50 text-blue-600 border-blue-200',
  'kurumsal':   'bg-purple-50 text-purple-600 border-purple-200',
  'medya':      'bg-pink-50 text-pink-600 border-pink-200',
  'duyurular':  'bg-orange-50 text-orange-600 border-orange-200',
  'iletisim':   'bg-emerald-50 text-emerald-600 border-emerald-200',
  'diger':      'bg-gray-50 text-gray-500 border-gray-200',
}

const allCategories: Array<PageDef['category'] | 'all'> = ['all', 'ana-sayfa', 'kurumsal', 'hizmetler', 'medya', 'duyurular', 'iletisim']

export default function PagesManager() {
  const [search, setSearch]     = useState('')
  const [activeCategory, setActiveCategory] = useState<PageDef['category'] | 'all'>('all')

  const catOrder: Record<string, number> = { 'ana-sayfa': 0, 'kurumsal': 1, 'hizmetler': 2, 'medya': 3, 'iletisim': 4, 'duyurular': 5, 'diger': 6 }
  const filtered = pageDefinitions
    .filter(p => {
      const matchSearch   = p.title.toLowerCase().includes(search.toLowerCase())
      const matchCategory = activeCategory === 'all' || p.category === activeCategory
      return matchSearch && matchCategory
    })
    .sort((a, b) => (catOrder[a.category] ?? 9) - (catOrder[b.category] ?? 9))

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Sayfa Yönetimi</h1>
        <p className="text-gray-400 text-sm">Bir sayfayı seçip içeriklerini düzenleyin</p>
      </motion.div>

      {/* Filters */}
      <motion.div {...fadeUp(0.05)} className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Sayfa ara..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all shadow-sm"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {allCategories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150',
                activeCategory === cat
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-gray-200'
              )}>
              {cat === 'all' ? 'Tümü' : pageCategoryLabels[cat]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Page grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Sayfa bulunamadı.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((page, i) => {
            const colors = categoryColors[page.category]
            return (
              <motion.div key={page.id} {...fadeUp(i * 0.03)}>
                <Link href={`/admin/editor/${page.id}`}
                  className="group block bg-white border border-gray-200 hover:border-amber-300 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-0.5 shadow-sm">

                  <div className="p-5">
                    {/* Top row: icon + badges */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shadow-sm', colors.icon)}>
                        <FileText className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', categoryBadge[page.category])}>
                          {pageCategoryLabels[page.category]}
                        </div>
                        <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[9px] text-green-600 font-semibold">Yayında</span>
                        </div>
                      </div>
                    </div>

                    {/* Title + path */}
                    <h3 className="text-gray-900 text-sm font-bold group-hover:text-amber-600 transition-colors mb-1 leading-snug">
                      {page.title}
                    </h3>
                    <p className="text-gray-400 text-[11px] font-mono truncate mb-4">{page.path}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Layers className="w-3 h-3" />
                        <span className="text-[11px] font-medium">{page.sections.length} bölüm</span>
                      </div>
                      <div className="w-px h-3 bg-gray-200" />
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <FileText className="w-3 h-3" />
                        <span className="text-[11px] font-medium">{page.sections.reduce((a, s) => a + s.fields.length, 0)} alan</span>
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400 group-hover:text-amber-500 flex items-center gap-1 transition-colors font-medium">
                        Düzenle <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(page.path, '_blank') }}
                        className="text-gray-300 hover:text-amber-500 transition-colors p-1 rounded-lg hover:bg-amber-50"
                        title="Sayfayı görüntüle">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
