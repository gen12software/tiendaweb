import Link from 'next/link'

export default function Paywall() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-6">
      <div className="text-6xl">🔒</div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Contenido exclusivo para suscriptores</h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Necesitás un plan activo para acceder al contenido. Elegí el plan que más te convenga.
        </p>
      </div>
      <Link
        href="/planes"
        className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        Ver planes disponibles
      </Link>
    </div>
  )
}
