'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Plan {
  id: string
  name: string
  price: number
  duration_days: number
  features: string[] | null
  is_featured: boolean
}

interface PlanCardProps {
  plan: Plan
  isActive: boolean
  expiresAt: string | null
  hasSession: boolean
}

export default function PlanCard({ plan, isActive, expiresAt, hasSession }: PlanCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBuy() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al procesar el pago')
      window.location.href = data.init_point
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setLoading(false)
    }
  }

  const expiresFormatted = expiresAt
    ? new Date(expiresAt).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
        plan.is_featured ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-200'
      }`}
    >
      {plan.is_featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
          Más popular
        </span>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-extrabold text-gray-900">
            ${Number(plan.price).toLocaleString('es-AR')}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Acceso por {plan.duration_days} días
        </p>
      </div>

      {plan.features && plan.features.length > 0 && (
        <ul className="mb-6 flex-1 space-y-2">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      {isActive ? (
        <button
          disabled
          className="w-full rounded-lg bg-green-100 px-4 py-2.5 text-sm font-semibold text-green-700 cursor-not-allowed"
        >
          Activo hasta {expiresFormatted}
        </button>
      ) : !hasSession ? (
        <Link
          href={`/login?redirectTo=/planes`}
          className="block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Comprar
        </Link>
      ) : (
        <button
          onClick={handleBuy}
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Procesando…' : 'Comprar'}
        </button>
      )}
    </div>
  )
}
