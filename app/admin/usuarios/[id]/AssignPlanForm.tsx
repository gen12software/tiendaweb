'use client'

import { useActionState } from 'react'
import { assignPlanManuallyAction } from '../actions'

interface Plan {
  id: string
  name: string
  duration_days: number
  price: number
}

export default function AssignPlanForm({ userId, plans }: { userId: string; plans: Plan[] }) {
  const [state, action, pending] = useActionState(assignPlanManuallyAction, { error: '', success: '' })

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="userId" value={userId} />

      {state.success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {state.success}
        </div>
      )}
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="planId" className="block text-sm font-medium text-gray-700 mb-1">
          Seleccioná un plan
        </label>
        <select
          id="planId"
          name="planId"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="">— Elegir plan —</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} · {plan.duration_days} días · ${Number(plan.price).toLocaleString('es-AR')}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? 'Activando…' : 'Activar plan manualmente'}
      </button>
    </form>
  )
}
