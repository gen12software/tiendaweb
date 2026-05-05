import Link from 'next/link'

interface Plan {
  id: string
  name: string
  price: number
  duration_days: number
  features: string[] | null
}

interface CtaProps {
  plans: Plan[]
}

export default function Cta({ plans }: CtaProps) {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Planes destacados
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Comenzá hoy con el plan que más te convenga.
          </p>
        </div>

        {plans.length > 0 ? (
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="w-full max-w-sm rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm ring-2 ring-indigo-500 flex flex-col"
              >
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${Number(plan.price).toLocaleString('es-AR')}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Acceso por {plan.duration_days} días
                </p>

                {plan.features && plan.features.length > 0 && (
                  <ul className="mt-5 flex-1 space-y-2">
                    {plan.features.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <svg
                          className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href="/planes"
                  className="mt-6 block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  Ver plan
                </Link>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-10 text-center">
          <Link
            href="/planes"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Ver todos los planes →
          </Link>
        </div>
      </div>
    </section>
  )
}
