'use client'

import { useTransition } from 'react'
import { togglePlanAction } from './actions'

export default function ToggleButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      await togglePlanAction(id, isActive)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
        isActive
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {pending ? '…' : isActive ? 'Activo' : 'Inactivo'}
    </button>
  )
}
