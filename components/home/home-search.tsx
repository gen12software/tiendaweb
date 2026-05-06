'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  primaryColor?: string
}

export default function HomeSearch({ primaryColor = '#4f46e5' }: Props) {
  const router = useRouter()
  const [q, setQ] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (q.trim()) router.push(`/productos?q=${encodeURIComponent(q.trim())}`)
    else router.push('/productos')
  }

  return (
    <div
      className="relative rounded-3xl px-6 py-14 sm:py-16 text-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)' }}
    >
      <div
        className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{ background: primaryColor }}
      />
      <div
        className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-5 pointer-events-none"
        style={{ background: primaryColor }}
      />

      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
            ¿Qué estás buscando?
          </h2>
          <p className="text-white/50 text-sm">
            Encontrá todo lo que necesitás en nuestra tienda
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 bg-white rounded-2xl px-5 py-3 shadow-lg focus-within:ring-2 focus-within:ring-white/30 transition-all">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar productos..."
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400 text-gray-900"
            />
            <button
              type="submit"
              className="shrink-0 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Buscar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
