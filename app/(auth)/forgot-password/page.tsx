'use client'

import { useActionState } from 'react'
import { forgotPasswordAction } from './actions'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(forgotPasswordAction, { sent: false })

  if (state.sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-5xl">✉️</div>
          <h1 className="text-2xl font-bold text-gray-900">Revisá tu email</h1>
          <p className="text-gray-600 text-sm">
            Si el email existe en nuestro sistema, te llegará un correo con instrucciones para
            restablecer tu contraseña.
          </p>
          <Link href="/login" className="text-sm text-indigo-600 hover:underline font-medium">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Recuperar contraseña</h1>
          <p className="mt-2 text-sm text-gray-600">
            Ingresá tu email y te enviamos un link para restablecer tu contraseña.
          </p>
        </div>

        <form action={action} className="space-y-4">
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

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? 'Enviando…' : 'Enviar instrucciones'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          <Link href="/login" className="text-indigo-600 hover:underline font-medium">
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
