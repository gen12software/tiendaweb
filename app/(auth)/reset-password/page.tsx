'use client'

import { useActionState } from 'react'
import { resetPasswordAction } from './actions'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(resetPasswordAction, { error: '' })

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)' }}
      >
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'var(--color-primary, #4f46e5)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-5"
          style={{ background: 'var(--color-primary, #4f46e5)' }} />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Volver a la tienda
          </Link>
        </div>

        <div className="relative z-10 space-y-4">
          <h2 className="text-4xl font-bold leading-tight">
            Nueva contraseña
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            Elegí una contraseña segura para proteger tu cuenta. Usá al menos 8 caracteres.
          </p>
        </div>

        <p className="relative z-10 text-white/30 text-xs">
          © {new Date().getFullYear()} Todos los derechos reservados.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Elegí una nueva contraseña</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Debe tener al menos 8 caracteres.
            </p>
          </div>

          <form action={action} className="space-y-5">
            {state.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                <span className="mt-0.5">!</span>
                {state.error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Nueva contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[--color-primary] focus:bg-white focus:ring-2 focus:ring-[--color-primary]/20 focus:outline-none"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[--color-primary] focus:bg-white focus:ring-2 focus:ring-[--color-primary]/20 focus:outline-none"
                placeholder="Repetí tu contraseña"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'var(--color-primary, #4f46e5)' }}
            >
              {pending ? 'Actualizando…' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
