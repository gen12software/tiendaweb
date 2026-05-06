import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import OrderStatusBadge from '@/components/orders/order-status-badge'
import { OrderStatus } from '@/lib/types/store'

export const metadata: Metadata = { title: 'Admin — Órdenes' }

interface Props {
  searchParams: Promise<{ q?: string; status?: string; desde?: string; hasta?: string; periodo?: string; page?: string }>
}

const PAGE_SIZE = 20

export default async function AdminOrdenesPage({ searchParams }: Props) {
  const params = await searchParams
  const { q, status, desde, hasta, periodo } = params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const page = parseInt(params.page ?? '1', 10)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('orders')
    .select('id, number, status, email, total, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (q) query = query.or(`email.ilike.%${q}%,number.ilike.%${q}%`)
  if (status) query = query.eq('status', status)

  // Filtro por periodo o fechas manuales. Por defecto: última semana
  if (desde) {
    query = query.gte('created_at', `${desde}T00:00:00`)
  } else if (hasta) {
    // nada — solo aplica el hasta
  } else {
    const dias = periodo === '1d' ? 1 : periodo === '15d' ? 15 : periodo === '1m' ? 30 : 7
    const fechaDesde = new Date()
    fechaDesde.setDate(fechaDesde.getDate() - dias)
    query = query.gte('created_at', fechaDesde.toISOString())
  }
  if (hasta) query = query.lte('created_at', `${hasta}T23:59:59`)

  query = query.range(from, to)
  const { data: orders, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const STATUSES: { value: string; label: string }[] = [
    { value: 'nueva',              label: 'Nueva' },
    { value: 'en_preparacion',     label: 'En preparación' },
    { value: 'enviado',            label: 'Enviado' },
    { value: 'listo_para_retirar', label: 'Listo para retirar' },
    { value: 'entregado',          label: 'Entregado' },
    { value: 'cancelado',          label: 'Cancelado' },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Órdenes</h1>

        <form className="flex gap-3 flex-wrap items-end">
          <input name="q" defaultValue={q} placeholder="Buscar por email o número..."
            className="border rounded-lg px-3 py-2 text-sm bg-white w-56" />
          <select name="status" defaultValue={status}
            className="border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Todos los estados</option>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select name="periodo" defaultValue={periodo ?? '7d'}
            className="border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="1d">Hoy</option>
            <option value="7d">Última semana</option>
            <option value="15d">Últimos 15 días</option>
            <option value="1m">Último mes</option>
            <option value="">Todas las fechas</option>
          </select>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-gray-500">Desde</label>
              <input type="date" name="desde" defaultValue={desde}
                className="border rounded-lg px-3 py-2 text-sm bg-white" />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-gray-500">Hasta</label>
              <input type="date" name="hasta" defaultValue={hasta}
                className="border rounded-lg px-3 py-2 text-sm bg-white" />
            </div>
          </div>
          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white h-[38px]">Filtrar</button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Número', 'Email', 'Total', 'Estado', 'Fecha', 'Ver'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders?.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-mono font-medium text-gray-900">#{o.number}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{o.email}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">${Number(o.total).toLocaleString('es-AR')}</td>
                  <td className="px-5 py-4"><OrderStatusBadge status={o.status as OrderStatus} /></td>
                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(o.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/ordenes/${o.id}`} className="text-sm text-indigo-600 hover:underline">Ver</Link>
                  </td>
                </tr>
              ))}
              {!orders?.length && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">No hay órdenes.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex gap-2 justify-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <a key={p} href={`/admin/ordenes?${new URLSearchParams({ ...params, page: String(p) })}`}
                className={`w-9 h-9 flex items-center justify-center rounded-md text-sm border ${p === page ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-100'}`}>
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
