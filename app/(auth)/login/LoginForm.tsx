'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'
import Link from 'next/link'

const ERROR_MESSAGES: Record<string, string> = {
  link_invalid: 'El link de confirmación es inválido o expiró. Intentá iniciar sesión.',
}

const SUCCESS_MESSAGES: Record<string, string> = {
  'password-updated': 'Tu contraseña fue actualizada. Ya podés iniciar sesión.',
}

export default function LoginForm({
  redirectTo,
  urlError,
  urlMessage,
}: {
  redirectTo?: string
  urlError?: string
  urlMessage?: string
}) {
  const [state, action, pending] = useActionState(loginAction, { error: '' })

  const errorMessage = state.error || (urlError ? ERROR_MESSAGES[urlError] ?? urlError : '')
  const successMessage = urlMessage ? SUCCESS_MESSAGES[urlMessage] ?? '' : ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-gray-600">
            ¿No tenés cuenta?{' '}
            <Link href="/register" className="text-indigo-600 hover:underline font-medium">
              Registrate
            </Link>
          </p>
        </div>

        <form action={action} className="space-y-4">
          {redirectTo && (
            <input type="hidden" name="redirectTo" value={redirectTo} />
          )}

          {successMessage && (
            <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              placeholder="juan@ejemplo.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-indigo-600 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              placeholder="Tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
