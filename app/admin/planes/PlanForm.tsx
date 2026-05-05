'use client'

import { useActionState } from 'react'
import Link from 'next/link'

interface Plan {
  id?: string
  name?: string
  description?: string | null
  price?: number
  duration_days?: number
  features?: string[] | null
  is_active?: boolean
  is_featured?: boolean
}

type ActionFn = (prevState: { error: string }, formData: FormData) => Promise<{ error: string }>

export default function PlanForm({ plan, action, submitLabel }: { plan?: Plan; action: ActionFn; submitLabel: string }) {
  const [state, formAction, pending] = useActionState(action, { error: '' })

  return (
    <form action={formAction} className="space-y-5">
      {plan?.id && <input type="hidden" name="id" value={plan.id} />}

      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            id="name" name="name" type="text" required
            defaultValue={plan?.name ?? ''}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            id="description" name="description" rows={2}
            defaultValue={plan?.description ?? ''}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Precio (ARS) *</label>
          <input
            id="price" name="price" type="number" required min="0" step="0.01"
            defaultValue={plan?.price ?? ''}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="duration_days" className="block text-sm font-medium text-gray-700 mb-1">Duración (días) *</label>
          <input
            id="duration_days" name="duration_days" type="number" required min="1"
            defaultValue={plan?.duration_days ?? ''}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-1">
            Beneficios <span className="text-gray-400 font-normal">(uno por línea)</span>
          </label>
          <textarea
            id="features" name="features" rows={5}
            defaultValue={(plan?.features ?? []).join('\n')}
            placeholder={"Acceso ilimitado\nSoporte prioritario\nDescargas"}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" name="is_active" defaultChecked={plan?.is_active ?? true}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">Activo</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" name="is_featured" defaultChecked={plan?.is_featured ?? false}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">Destacado ("Más popular")</span>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit" disabled={pending}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Guardando…' : submitLabel}
        </button>
        <Link href="/admin/planes" className="text-sm text-gray-500 hover:text-gray-700">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
