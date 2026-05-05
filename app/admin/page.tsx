import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const nowIso = now.toISOString()

  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: monthPayments },
    { data: recentPayments },
  ] = await Promise.all([
    // Total de usuarios registrados
    supabase.from('profiles').select('*', { count: 'exact', head: true }),

    // Usuarios con plan activo ahora
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('plan_id', 'is', null)
      .gt('plan_expires_at', nowIso),

    // Pagos aprobados del mes actual (para sumar ingresos)
    supabase
      .from('payments')
      .select('amount')
      .eq('status', 'approved')
      .gte('created_at', monthStart),

    // Últimos 10 pagos aprobados con datos de usuario y plan
    supabase
      .from('payments')
      .select('id, amount, created_at, mp_payment_id, profiles(full_name), plans(name)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const monthRevenue = (monthPayments ?? []).reduce(
    (sum, p) => sum + Number(p.amount),
    0,
  )

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(n)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const currentMonthLabel = now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Resumen general de la plataforma</p>
        </div>

        {/* Métricas */}
        <div className="grid gap-5 sm:grid-cols-3">
          <MetricCard
            label="Total de usuarios"
            value={String(totalUsers ?? 0)}
            icon={
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            }
            iconBg="bg-indigo-50"
          />
          <MetricCard
            label="Suscriptores activos"
            value={String(activeSubscribers ?? 0)}
            icon={
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            }
            iconBg="bg-green-50"
          />
          <MetricCard
            label={`Ingresos en ${currentMonthLabel}`}
            value={formatCurrency(monthRevenue)}
            icon={
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
              </svg>
            }
            iconBg="bg-amber-50"
          />
        </div>

        {/* Tabla de últimos pagos */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimos pagos aprobados</h2>

          {!recentPayments || recentPayments.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-400">
              Aún no hay pagos aprobados.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Usuario', 'Plan', 'Monto', 'Fecha', 'ID transacción'].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentPayments.map((payment) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const profileData = payment.profiles as any
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const planData = payment.plans as any
                      const userName: string = profileData?.full_name || '—'
                      const planName: string = planData?.name || '—'

                      return (
                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {userName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {planName}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {formatCurrency(Number(payment.amount))}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {formatDate(payment.created_at)}
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-gray-400 whitespace-nowrap">
                            {payment.mp_payment_id ?? '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function MetricCard({
  label,
  value,
  icon,
  iconBg,
}: {
  label: string
  value: string
  icon: React.ReactNode
  iconBg: string
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
    </div>
  )
}
