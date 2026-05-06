'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Search } from 'lucide-react'

export default function CategorySearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  function update(key: string, value: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      router.replace(`/admin/categorias?${params.toString()}`)
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
          placeholder="Buscar categorías…"
          className="w-56 rounded-lg border border-gray-300 pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <select
        defaultValue={searchParams.get('estado') ?? ''}
        onChange={e => update('estado', e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none text-gray-700"
      >
        <option value="">Todos los estados</option>
        <option value="activa">Activa</option>
        <option value="inactiva">Inactiva</option>
      </select>
    </div>
  )
}
