'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const RESEND_COOLDOWN = 60

export default function CheckEmailClient({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ email?: string }>
}) {
  const searchParams = use(searchParamsPromise)
  const email = searchParams.email ?? ''

  const [secondsLeft, setSecondsLeft] = useState(0)
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  const handleResend = useCallback(async () => {
    if (!email || secondsLeft > 0) return
    setResendState('sending')

    const supabase = createClient()
    const { error } = await supabase.auth.resend({ type: 'signup', email })

    if (error) {
      setResendState('error')
    } else {
      setResendState('sent')
      setSecondsLeft(RESEND_COOLDOWN)
    }
  }, [email, secondsLeft])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">📬</div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Revisá tu email</h1>
          <p className="text-gray-600 text-sm">
            Te enviamos un email
            {email ? (
              <>
                {' '}a{' '}
                <span className="font-semibold text-gray-800">{email}</span>
              </>
            ) : null}{' '}
            para confirmar tu cuenta.
          </p>
          <p className="text-gray-500 text-sm">
            Si no lo recibís, revisá la carpeta de spam.
          </p>
        </div>

        {resendState === 'sent' && (
          <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            Email reenviado correctamente.
          </div>
        )}

        {resendState === 'error' && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            No pudimos reenviar el email. Intentá de nuevo en unos minutos.
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={!email || secondsLeft > 0 || resendState === 'sending'}
          className="w-full rounded-lg border border-indigo-600 px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {resendState === 'sending'
            ? 'Enviando…'
            : secondsLeft > 0
            ? `Reenviar email (${secondsLeft}s)`
            : 'Reenviar email'}
        </button>
      </div>
    </div>
  )
}
