'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Search } from 'lucide-react'

interface Props {
  categories: { id: string; name: string }[]
  threshold?: number
}

export default function ProductSearch({ categories, threshold = 5 }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  function update(key: string, value: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      router.replace(`/admin/productos?${params.toString()}`)
    })
  }

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="search"
          defaultValue={searchParams.get('q') ?? ''}
          onChange={e => update('q', e.target.value)}
          placeholder="Buscar productos…"
          className="w-56 rounded-lg border border-gray-300 pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <select
        defaultValue={searchParams.get('cat') ?? ''}
        onChange={e => update('cat', e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none text-gray-700"
      >
        <option value="">Todas las categorías</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <select
        defaultValue={searchParams.get('estado') ?? ''}
        onChange={e => update('estado', e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none text-gray-700"
      >
        <option value="">Todos los estados</option>
        <option value="activo">Activo</option>
        <option value="inactivo">Inactivo</option>
      </select>

      <select
        defaultValue={searchParams.get('orden') ?? ''}
        onChange={e => update('orden', e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none text-gray-700"
      >
        <option value="">Más recientes</option>
        <option value="precio_asc">Precio: menor a mayor</option>
        <option value="precio_desc">Precio: mayor a menor</option>
      </select>

      <button
        type="button"
        onClick={() => update('stock', searchParams.get('stock') === 'bajo' ? '' : 'bajo')}
        className={`rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
          searchParams.get('stock') === 'bajo'
            ? 'bg-orange-500 text-white border-orange-500'
            : 'border-gray-300 text-gray-700 hover:border-orange-400 hover:text-orange-600'
        }`}
      >
        ⚠️ Stock bajo (≤{threshold})
      </button>
    </div>
  )
}
