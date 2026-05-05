import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AssignPlanForm from './AssignPlanForm'

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (adminProfile?.role !== 'admin') redirect('/dashboard')

  const { id } = await params

  const [{ data: profile }, { data: plans }, { data: payments }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, plan_id, plan_expires_at, created_at, plans(name)')
      .eq('id', id)
      .single(),
    supabase
      .from('plans')
      .select('id, name, duration_days, price')
      .eq('is_active', true)
      .order('price', { ascending: true }),
    supabase
      .from('payments')
      .select('id, amount, status, created_at, plans(name)')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  if (!profile) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const planName = (profile.plans as any)?.name ?? null
  const expires = profile.plan_expires_at ? new Date(profile.plan_expires_at) : null
  const isActive = expires !== null && expires > new Date()

  const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
    approved: { label: 'Aprobado',  classes: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rechazado', classes: 'bg-red-100 text-red-700' },
    pending:  { label: 'Pendiente', classes: 'bg-yellow-100 text-yellow-700' },
    manual:   { label: 'Manual',    classes: 'bg-indigo-100 text-indigo-700' },
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/usuarios" className="text-sm text-gray-500 hover:text-gray-700">
            ← Usuarios
          </Link>
        </div>

        {/* Datos del usuario */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {profile.full_name || <span className="text-gray-400 italic">Sin nombre</span>}
          </h1>

          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">ID</dt>
              <dd className="font-mono text-xs text-gray-700 mt-0.5 truncate">{profile.id}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Registro</dt>
              <dd className="text-gray-700 mt-0.5">
                {new Date(profile.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Plan actual</dt>
              <dd className="mt-0.5">
                {planName ? (
                  <span className={`font-medium ${isActive ? 'text-green-700' : 'text-red-600'}`}>{planName}</span>
                ) : (
                  <span className="text-gray-400">Sin plan</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Vencimiento</dt>
              <dd className={`mt-0.5 ${isActive ? 'text-green-700' : 'text-red-600'}`}>
                {expires
                  ? expires.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
                  : <span className="text-gray-400">—</span>}
              </dd>
            </div>
          </dl>
        </section>

        {/* Asignar plan */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Asignar plan manualmente</h2>
          <AssignPlanForm userId={profile.id} plans={plans ?? []} />
        </section>

        {/* Historial de pagos */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Últimos pagos</h2>
          {!payments || payments.length === 0 ? (
            <p className="text-sm text-gray-400">Sin pagos registrados.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wide">
                  <th className="py-2 text-left">Plan</th>
                  <th className="py-2 text-left">Fecha</th>
                  <th className="py-2 text-right">Monto</th>
                  <th className="py-2 text-left pl-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const pPlanName = (p.plans as any)?.name ?? '—'
                  const s = STATUS_STYLES[p.status] ?? { label: p.status, classes: 'bg-gray-100 text-gray-600' }
                  return (
                    <tr key={p.id}>
                      <td className="py-3 text-gray-900 font-medium">{pPlanName}</td>
                      <td className="py-3 text-gray-500">
                        {new Date(p.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 text-right text-gray-900">
                        {Number(p.amount).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-3 pl-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.classes}`}>
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  )
}
