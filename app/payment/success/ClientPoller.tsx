'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface PaymentStatus {
  active: boolean
  plan_name: string | null
  expires_at: string | null
}

const MAX_ATTEMPTS = 10
const INTERVAL_MS = 3000

export default function ClientPoller() {
  const [attempts, setAttempts] = useState(0)
  const [status, setStatus] = useState<PaymentStatus | null>(null)

  useEffect(() => {
    if (attempts >= MAX_ATTEMPTS || status?.active) return

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/check-payment-status')
        if (res.ok) {
          const data: PaymentStatus = await res.json()
          setStatus(data)
        }
      } catch {
        // silenciar errores de red, seguir reintentando
      }
      setAttempts((a) => a + 1)
    }, INTERVAL_MS)

    return () => clearTimeout(timer)
  }, [attempts, status?.active])

  if (status?.active) {
    return <SuccessView planName={status.plan_name} expiresAt={status.expires_at} />
  }

  if (attempts >= MAX_ATTEMPTS) {
    return (
      <div className="text-center space-y-4">
        <div className="text-5xl">⏳</div>
        <h1 className="text-2xl font-bold text-gray-900">Estamos procesando tu pago</h1>
        <p className="text-gray-600 text-sm max-w-sm mx-auto">
          Te avisaremos por email cuando tu plan esté activo. Si tenés dudas, contactá a soporte.
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Ir al dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <svg className="h-10 w-10 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
      <p className="text-gray-600 text-sm">Confirmando tu pago…</p>
    </div>
  )
}

function SuccessView({
  planName,
  expiresAt,
}: {
  planName: string | null
  expiresAt: string | null
}) {
  const expiresFormatted = expiresAt
    ? new Date(expiresAt).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div className="text-center space-y-4">
      <div className="text-6xl">🎉</div>
      <h1 className="text-3xl font-bold text-gray-900">¡Pago confirmado!</h1>
      {planName && (
        <p className="text-lg text-gray-700">
          Tu plan <span className="font-semibold text-indigo-600">{planName}</span> está activo.
        </p>
      )}
      {expiresFormatted && (
        <p className="text-sm text-gray-500">Válido hasta el {expiresFormatted}</p>
      )}
      <Link
        href="/dashboard"
        className="inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        Ir al dashboard
      </Link>
    </div>
  )
}
