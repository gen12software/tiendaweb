import Link from 'next/link'

export default function PaymentFailurePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">❌</div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Hubo un problema con tu pago</h1>
          <p className="text-gray-600 text-sm">
            No pudimos procesar tu pago. Podés intentarlo nuevamente o elegir otro método de pago.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/planes"
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Volver a los planes
          </Link>
          <a
            href="mailto:soporte@tienda.com"
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Contactar soporte
          </a>
        </div>
      </div>
    </main>
  )
}
