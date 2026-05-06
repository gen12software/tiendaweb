import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

  const [
    { count: totalUsers },
    { data: monthOrders },
    { data: prevMonthOrders },
    { count: pendingOrders },
    { data: recentOrders },
    { count: outOfStockVariants },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),

    supabaseAdmin.from('orders').select('total').eq('status', 'paid').gte('created_at', monthStart),
    supabaseAdmin.from('orders').select('total').eq('status', 'paid')
      .gte('created_at', prevMonthStart).lt('created_at', monthStart),

    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true })
      .in('status', ['payment_pending', 'paid', 'processing']),

    supabaseAdmin.from('orders')
      .select('id, number, status, email, total, created_at')
      .order('created_at', { ascending: false })
      .limit(5),

    supabaseAdmin.from('product_variants').select('*', { count: 'exact', head: true }).eq('stock', 0),
  ])

  const monthRevenue = (monthOrders ?? []).reduce((s, o) => s + Number(o.total), 0)
  const prevRevenue = (prevMonthOrders ?? []).reduce((s, o) => s + Number(o.total), 0)
  const revDiff = prevRevenue > 0 ? ((monthRevenue - prevRevenue) / prevRevenue * 100).toFixed(0) : null

  const fmt = (n: number) => `$${n.toLocaleString('es-AR')}`

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/productos" className="text-indigo-600 hover:underline">Productos</Link>
            <Link href="/admin/categorias" className="text-indigo-600 hover:underline">Categorías</Link>
            <Link href="/admin/ordenes" className="text-indigo-600 hover:underline">Órdenes</Link>
            <Link href="/admin/configuracion" className="text-indigo-600 hover:underline">Configuración</Link>
          </nav>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Ventas del mes" value={fmt(monthRevenue)}
            sub={revDiff ? `${revDiff > '0' ? '+' : ''}${revDiff}% vs mes anterior` : undefined} />
          <MetricCard label="Órdenes pendientes" value={String(pendingOrders ?? 0)} />
          <MetricCard label="Usuarios registrados" value={String(totalUsers ?? 0)} />
          <MetricCard label="Variantes sin stock" value={String(outOfStockVariants ?? 0)} />
        </div>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimas órdenes</h2>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Número', 'Email', 'Total', 'Estado', 'Fecha'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders?.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-mono">
                      <Link href={`/admin/ordenes/${o.id}`} className="text-indigo-600 hover:underline">#{o.number}</Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{o.email}</td>
                    <td className="px-5 py-3 text-sm font-medium">{fmt(Number(o.total))}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">{o.status}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {new Date(o.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
                {!recentOrders?.length && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">No hay órdenes aún.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
