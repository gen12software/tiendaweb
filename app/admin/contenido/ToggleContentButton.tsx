'use client'

import { useTransition } from 'react'
import { toggleContentAction } from './actions'

export default function ToggleContentButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(async () => { await toggleContentAction(id, isActive) })}
      disabled={pending}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
        isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
      }`}
    >
      {pending ? '…' : isActive ? 'Activo' : 'Inactivo'}
    </button>
  )
}
