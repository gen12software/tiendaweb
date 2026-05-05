'use client'

import { useState } from 'react'
import ContentCard from './content-card'

interface ContentItem {
  id: string
  title: string
  description: string | null
  category: string | null
  duration_minutes: number | null
  video_url: string | null
}

interface ContentGridProps {
  items: ContentItem[]
}

export default function ContentGrid({ items }: ContentGridProps) {
  const categories = Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[]
  const hasMultipleCategories = categories.length > 1

  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)

  const filtered = activeCategory ? items.filter((i) => i.category === activeCategory) : items

  return (
    <div className="space-y-6">
      {hasMultipleCategories && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === null
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:border-indigo-400'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-indigo-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <ContentCard key={item.id} item={item} onSelect={setSelectedItem} />
        ))}
      </div>

      {/* Modal de video */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{selectedItem.title}</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedItem.video_url ? (
              <div className="aspect-video">
                <iframe
                  src={selectedItem.video_url}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                Video no disponible
              </div>
            )}

            {selectedItem.description && (
              <div className="px-5 py-4">
                <p className="text-sm text-gray-600">{selectedItem.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
