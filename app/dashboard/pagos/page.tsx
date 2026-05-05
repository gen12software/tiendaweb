import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const PAGE_SIZE = 10

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  approved: { label: 'Aprobado',  classes: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rechazado', classes: 'bg-red-100 text-red-700' },
  pending:  { label: 'Pendiente', classes: 'bg-yellow-100 text-yellow-700' },
  manual:   { label: 'Manual',    classes: 'bg-gray-100 text-gray-600' },
}

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: payments, count } = await supabase
    .from('payments')
    .select('id, amount, status, created_at, plans(name)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Mis pagos</h1>

        {!payments || payments.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center">
            <p className="text-gray-400 text-sm">Aún no realizaste ningún pago.</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Monto</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const planName = (payment.plans as any)?.name ?? '—'
                    const status = STATUS_STYLES[payment.status] ?? { label: payment.status, classes: 'bg-gray-100 text-gray-600' }
                    const date = new Date(payment.created_at).toLocaleDateString('es-AR', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })
                    const amount = Number(payment.amount).toLocaleString('es-AR', {
                      style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
                    })

                    return (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{planName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{date}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{amount}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.classes}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Página {page} de {totalPages}</span>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link
                      href={`?page=${page - 1}`}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      ← Anterior
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link
                      href={`?page=${page + 1}`}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Siguiente →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
