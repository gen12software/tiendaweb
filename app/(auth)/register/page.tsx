'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { registerAction } from './actions'
import Link from 'next/link'

const initialState = { error: '' }

function validate(full_name: string, email: string, password: string, confirm: string, terms: boolean) {
  if (!full_name.trim()) return 'El nombre es requerido'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Ingresá un email válido'
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
  if (password !== confirm) return 'Las contraseñas no coinciden'
  if (!terms) return 'Debés aceptar los Términos y Condiciones para continuar'
  return null
}

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, initialState)
  const [clientError, setClientError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget
    const full_name = (form.elements.namedItem('full_name') as HTMLInputElement).value
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const confirm = (form.elements.namedItem('confirm_password') as HTMLInputElement).value
    const terms = (form.elements.namedItem('terms') as HTMLInputElement).checked

    const err = validate(full_name, email, password, confirm, terms)
    if (err) {
      e.preventDefault()
      setClientError(err)
    } else {
      setClientError(null)
    }
  }

  const errorMessage = clientError ?? state?.error

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

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-bold leading-tight">
              Creá tu cuenta gratis
            </h2>
            <p className="mt-3 text-white/60 text-lg leading-relaxed">
              Registrate y disfrutá de una experiencia de compra personalizada con todos tus beneficios.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { icon: '📦', text: 'Historial completo de tus compras' },
              { icon: '🔔', text: 'Notificaciones de estado de tus pedidos' },
              { icon: '🎁', text: 'Acceso a promociones exclusivas' },
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
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Volver a la tienda
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              ¿Ya tenés cuenta?{' '}
              <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--color-primary, #4f46e5)' }}>
                Iniciá sesión
              </Link>
            </p>
          </div>

          <form action={action} onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                <span className="mt-0.5">!</span>
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Nombre completo
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                autoComplete="name"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[--color-primary] focus:bg-white focus:ring-2 focus:ring-[--color-primary]/20 focus:outline-none"
                placeholder="Juan Pérez"
              />
            </div>

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

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
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

            <div className="flex items-start gap-3 pt-1">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-[--color-primary]"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 leading-5">
                Acepto los{' '}
                <Link href="/terminos" target="_blank" className="font-medium hover:underline" style={{ color: 'var(--color-primary, #4f46e5)' }}>
                  Términos y Condiciones
                </Link>{' '}
                y la{' '}
                <Link href="/privacidad" target="_blank" className="font-medium hover:underline" style={{ color: 'var(--color-primary, #4f46e5)' }}>
                  Política de Privacidad
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'var(--color-primary, #4f46e5)' }}
            >
              {pending ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
