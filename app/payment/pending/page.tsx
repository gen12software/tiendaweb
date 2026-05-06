import Link from 'next/link'

export default function PaymentPendingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">⏳</div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Tu pago está siendo procesado</h1>
          <p className="text-gray-600 text-sm">
            Algunos métodos de pago pueden demorar hasta 24 horas en acreditarse. Te avisaremos
            por email cuando tu plan esté activo.
          </p>
          <p className="text-gray-500 text-sm">
            Si ya pasaron más de 24 horas y tu plan no se activó, contactá a soporte.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/cuenta/ordenes"
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Ir al dashboard
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
