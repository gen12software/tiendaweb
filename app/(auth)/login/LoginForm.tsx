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
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)' }}
      >
        {/* Decorative circles */}
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

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-bold leading-tight">
              Bienvenido de vuelta
            </h2>
            <p className="mt-3 text-white/60 text-lg leading-relaxed">
              Iniciá sesión para acceder a tus pedidos, seguimiento y beneficios exclusivos.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { icon: '🛒', text: 'Seguí el estado de tus pedidos en tiempo real' },
              { icon: '❤️', text: 'Guardá tus productos favoritos' },
              { icon: '⚡', text: 'Checkout más rápido con tus datos guardados' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/70 text-sm">
                <span className="text-base">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/30 text-xs">
          © {new Date().getFullYear()} Todos los derechos reservados.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile back link */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Volver a la tienda
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              ¿No tenés cuenta?{' '}
              <Link href="/register" className="font-medium hover:underline" style={{ color: 'var(--color-primary, #4f46e5)' }}>
                Registrate gratis
              </Link>
            </p>
          </div>

          <form action={action} className="space-y-5">
            {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

            {successMessage && (
              <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                <span className="mt-0.5">!</span>
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[--color-primary] focus:bg-white focus:ring-2 focus:ring-[--color-primary]/20 focus:outline-none"
                style={{ '--color-primary': 'var(--color-primary, #4f46e5)' } as React.CSSProperties}
                placeholder="tu@email.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-gray-800 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[--color-primary] focus:bg-white focus:ring-2 focus:ring-[--color-primary]/20 focus:outline-none"
                placeholder="Tu contraseña"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'var(--color-primary, #4f46e5)' }}
            >
              {pending ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
