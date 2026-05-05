import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientPoller from './ClientPoller'

export default async function PaymentSuccessPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_expires_at, plans(name)')
    .eq('id', user.id)
    .single()

  const expiresAt = profile?.plan_expires_at ?? null
  const isActive = expiresAt !== null && new Date(expiresAt) > new Date()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const planName = (profile?.plans as any)?.name ?? null

  const expiresFormatted = expiresAt
    ? new Date(expiresAt).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        {isActive ? (
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900">¡Pago confirmado!</h1>
            {planName && (
              <p className="text-lg text-gray-700">
                Tu plan{' '}
                <span className="font-semibold text-indigo-600">{planName}</span> está activo.
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
        ) : (
          <ClientPoller />
        )}
      </div>
    </main>
  )
}
