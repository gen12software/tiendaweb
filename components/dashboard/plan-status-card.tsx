import Link from 'next/link'

interface PlanStatusCardProps {
  planName: string | null
  expiresAt: string | null
}

export default function PlanStatusCard({ planName, expiresAt }: PlanStatusCardProps) {
  const now = new Date()
  const expires = expiresAt ? new Date(expiresAt) : null
  const isActive = expires !== null && expires > now
  const daysLeft = expires ? Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
  const expiresSoon = isActive && daysLeft <= 7

  const expiresFormatted = expires
    ? expires.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  if (!planName || !isActive) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
            🔒
          </div>
          <div>
            <p className="font-semibold text-gray-900">Sin plan activo</p>
            <p className="text-sm text-gray-500">No tenés un plan activo</p>
          </div>
        </div>
        {expires && !isActive && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            Tu plan venció el {expiresFormatted}. El acceso al contenido está bloqueado.
          </div>
        )}
        <Link
          href="/planes"
          className="inline-block rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Ver planes disponibles
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-xl">
          ✅
        </div>
        <div>
          <p className="font-semibold text-gray-900">{planName}</p>
          <p className="text-sm text-gray-500">Vence el {expiresFormatted}</p>
        </div>
      </div>

      {expiresSoon && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-300 px-4 py-3 text-sm text-yellow-800">
          Tu plan vence en {daysLeft} {daysLeft === 1 ? 'día' : 'días'}.{' '}
          <Link href="/planes" className="font-semibold underline hover:no-underline">
            Renovalo aquí.
          </Link>
        </div>
      )}
    </div>
  )
}
