'use client'

import { useActionState } from 'react'
import { updateProfileAction, updatePasswordAction } from './actions'

interface ProfileFormProps {
  fullName: string
  email: string
  planName: string | null
  expiresAt: string | null
}

function Feedback({ state }: { state: { error: string; success: string } }) {
  if (state.success) return (
    <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
      {state.success}
    </div>
  )
  if (state.error) return (
    <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
      {state.error}
    </div>
  )
  return null
}

export default function ProfileForm({ fullName, email, planName, expiresAt }: ProfileFormProps) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfileAction, { error: '', success: '' })
  const [passwordState, passwordAction, passwordPending] = useActionState(updatePasswordAction, { error: '', success: '' })

  const expiresFormatted = expiresAt
    ? new Date(expiresAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="space-y-8">
      {/* Información del plan */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Plan activo</h2>
        {planName && expiresFormatted ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-base">✅</div>
            <div>
              <p className="text-sm font-medium text-gray-900">{planName}</p>
              <p className="text-xs text-gray-500">Vence el {expiresFormatted}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No tenés un plan activo.</p>
        )}
      </section>

      {/* Datos personales */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Datos personales</h2>

        <form action={profileAction} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              defaultValue={fullName}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-400">El email no se puede modificar.</p>
          </div>

          <Feedback state={profileState} />

          <button
            type="submit"
            disabled={profilePending}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {profilePending ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      </section>

      {/* Cambio de contraseña */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Cambiar contraseña</h2>

        <form action={passwordAction} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              placeholder="Repetí tu contraseña"
            />
          </div>

          <Feedback state={passwordState} />

          <button
            type="submit"
            disabled={passwordPending}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {passwordPending ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>
        </form>
      </section>
    </div>
  )
}
