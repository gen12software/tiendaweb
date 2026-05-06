'use client'

import { useActionState } from 'react'
import { forgotPasswordAction } from './actions'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(forgotPasswordAction, { sent: false })

  if (state.sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: 'color-mix(in srgb, var(--color-primary, #4f46e5) 10%, transparent)' }}>
            ✉️
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Revisá tu email</h1>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Si el email existe en nuestro sistema, te llegará un correo con instrucciones para restablecer tu contraseña.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            style={{ color: 'var(--color-primary, #4f46e5)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

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
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            No te preocupes, te enviamos un correo con instrucciones para restablecerla en minutos.
          </p>
        </div>

        <p className="relative z-10 text-white/30 text-xs">
          © {new Date().getFullYear()} Todos los derechos reservados.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Volver al inicio de sesión
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Recuperar contraseña</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Ingresá tu email y te enviamos un link para restablecer tu contraseña.
            </p>
          </div>

          <form action={action} className="space-y-5">
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
                placeholder="tu@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'var(--color-primary, #4f46e5)' }}
            >
              {pending ? 'Enviando…' : 'Enviar instrucciones'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 font-medium hover:underline"
              style={{ color: 'var(--color-primary, #4f46e5)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
