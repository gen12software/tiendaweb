'use client'

import { useTransition } from 'react'
import { toggleCategoryAction } from './actions'

export default function ToggleCategoryButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => toggleCategoryAction(id, !isActive))}
      className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
        isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {isActive ? 'Activa' : 'Inactiva'}
    </button>
  )
}
