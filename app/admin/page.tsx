import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getSiteConfig } from '@/lib/site-config'
import Link from 'next/link'
import OrderStatusBadge from '@/components/orders/order-status-badge'
import { OrderStatus } from '@/lib/types/store'

const PERIODOS = [
  { value: '1d',  label: 'Hoy' },
  { value: '7d',  label: 'Última semana' },
  { value: '15d', label: 'Últimos 15 días' },
  { value: '1m',  label: 'Este mes' },
]

const STATUS_ORDER: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'nueva',              label: 'Nuevas',             color: 'bg-blue-50 text-blue-700' },
  { value: 'en_preparacion',     label: 'En preparación',     color: 'bg-yellow-50 text-yellow-700' },
  { value: 'enviado',            label: 'Enviadas',           color: 'bg-purple-50 text-purple-700' },
  { value: 'listo_para_retirar', label: 'Listo p/ retirar',   color: 'bg-orange-50 text-orange-700' },
  { value: 'entregado',          label: 'Entregadas',         color: 'bg-green-50 text-green-700' },
  { value: 'cancelado',          label: 'Canceladas',         color: 'bg-red-50 text-red-600' },
]

interface Props { searchParams: Promise<{ periodo?: string }> }

export default async function AdminDashboardPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/cuenta/ordenes')

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { periodo = '7d' } = await searchParams
  const config = await getSiteConfig()
  const lowStockThreshold = parseInt(config.low_stock_threshold ?? '5') || 5

  // Calcular fecha inicio del período
  const now = new Date()
  let periodoStart: Date
  if (periodo === '1d') {
    periodoStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  } else if (periodo === '15d') {
    periodoStart = new Date(now); periodoStart.setDate(now.getDate() - 15)
  } else if (periodo === '1m') {
    periodoStart = new Date(now.getFullYear(), now.getMonth(), 1)
  } else {
    periodoStart = new Date(now); periodoStart.setDate(now.getDate() - 7)
  }
  const periodoISO = periodoStart.toISOString()

  // Período anterior (para comparar ventas)
  const diffMs = now.getTime() - periodoStart.getTime()
  const prevStart = new Date(periodoStart.getTime() - diffMs).toISOString()
  const prevEnd = periodoISO

  const [
    { count: totalUsers },
    { data: periodOrders },
    { data: prevOrders },
    { data: recentOrders },
    { data: lowStockVariants },
    { data: lowStockProducts },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),

    supabaseAdmin.from('orders')
      .select('id, status, total')
      .gte('created_at', periodoISO),

    supabaseAdmin.from('orders')
      .select('total')
      .in('status', ['nueva', 'en_preparacion', 'enviado', 'listo_para_retirar', 'entregado'])
      .gte('created_at', prevStart)
      .lt('created_at', prevEnd),

    supabaseAdmin.from('orders')
      .select('id, number, status, email, total, created_at')
      .order('created_at', { ascending: false })
      .limit(8),

    supabaseAdmin.from('product_variants')
      .select('id, name, stock, product_id, products(name)')
      .lte('stock', lowStockThreshold)
      .order('stock', { ascending: true })
      .limit(10),

    supabaseAdmin.from('products')
      .select('id, name, stock, product_variants(stock)')
      .eq('is_active', true)
      .order('stock', { ascending: true }),
  ])

  // Compute effective stock per product (variants override product.stock)
  function effectiveStock(p: any): number {
    const variants = p.product_variants ?? []
    if (variants.length > 0) return variants.reduce((s: number, v: any) => s + v.stock, 0)
    return p.stock ?? 0
  }
  const lowStockProductsFiltered = (lowStockProducts ?? [])
    .filter(p => effectiveStock(p) <= lowStockThreshold)
    .sort((a, b) => effectiveStock(a) - effectiveStock(b))
    .slice(0, 10)

  // Métricas del período
  const paidStatuses = ['nueva', 'en_preparacion', 'enviado', 'listo_para_retirar', 'entregado']
  const revenue = (periodOrders ?? [])
    .filter(o => paidStatuses.includes(o.status))
    .reduce((s, o) => s + Number(o.total), 0)

  const prevRevenue = (prevOrders ?? []).reduce((s, o) => s + Number(o.total), 0)
  const revDiff = prevRevenue > 0 ? Math.round((revenue - prevRevenue) / prevRevenue * 100) : null

  const totalOrders = (periodOrders ?? []).length
  const avgOrder = totalOrders > 0 ? Math.round(revenue / totalOrders) : 0

  // Conteo por estado
  const countByStatus = STATUS_ORDER.map(s => ({
    ...s,
    count: (periodOrders ?? []).filter(o => o.status === s.value).length,
  }))

  const fmt = (n: number) => `$${n.toLocaleString('es-AR')}`

  return (
    <main className="flex-1 px-8 py-10 space-y-8 overflow-auto">
      {/* Header con selector de período */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-heading text-2xl font-bold text-[#111]">Dashboard</h1>
        <form method="get" className="flex gap-2">
          {PERIODOS.map(p => (
            <button key={p.value} name="periodo" value={p.value} type="submit"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                periodo === p.value
                  ? 'bg-[#111] text-white border-[#111]'
                  : 'bg-white text-[#555] border-[#e5e5e5] hover:border-[#aaa]'
              }`}>
              {p.label}
            </button>
          ))}
        </form>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white border border-[#f0f0f0] p-6">
          <p className="text-xs font-semibold text-[#999] uppercase tracking-widest">Ventas del período</p>
          <p className="mt-3 font-heading text-3xl font-bold tracking-tight text-[#111]">{fmt(revenue)}</p>
          {revDiff !== null && (
            <p className={`mt-1 text-xs font-medium ${revDiff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {revDiff >= 0 ? '▲' : '▼'} {Math.abs(revDiff)}% vs período anterior
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-white border border-[#f0f0f0] p-6">
          <p className="text-xs font-semibold text-[#999] uppercase tracking-widest">Órdenes del período</p>
          <p className="mt-3 font-heading text-3xl font-bold tracking-tight text-[#111]">{totalOrders}</p>
          {avgOrder > 0 && <p className="mt-1 text-xs text-[#aaa]">Ticket promedio: {fmt(avgOrder)}</p>}
        </div>

        <div className="rounded-2xl bg-white border border-[#f0f0f0] p-6">
          <p className="text-xs font-semibold text-[#999] uppercase tracking-widest">Usuarios registrados</p>
          <p className="mt-3 font-heading text-3xl font-bold tracking-tight text-[#111]">{totalUsers ?? 0}</p>
          <p className="mt-1 text-xs text-[#aaa]">Total acumulado</p>
        </div>

        <div className="rounded-2xl bg-white border border-[#f0f0f0] p-6">
          <p className="text-xs font-semibold text-[#999] uppercase tracking-widest">Stock bajo (≤{lowStockThreshold})</p>
          <p className={`mt-3 font-heading text-3xl font-bold tracking-tight ${
            (lowStockVariants?.length ?? 0) + lowStockProductsFiltered.length > 0 ? 'text-orange-500' : 'text-[#111]'
          }`}>
            {(lowStockVariants?.length ?? 0) + lowStockProductsFiltered.length}
          </p>
          <p className="mt-1 text-xs text-[#aaa]">productos/variantes</p>
        </div>
      </div>

      {/* Órdenes por estado */}
      <div className="rounded-2xl bg-white border border-[#f0f0f0] p-6">
        <h2 className="font-semibold text-sm text-[#111] mb-4">Órdenes por estado · {PERIODOS.find(p => p.value === periodo)?.label}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {countByStatus.map(s => (
            <Link key={s.value} href={`/admin/ordenes?status=${s.value}&periodo=${periodo}`}
              className={`rounded-xl p-4 text-center hover:opacity-80 transition-opacity ${s.color}`}>
              <p className="text-2xl font-bold">{s.count}</p>
              <p className="text-xs font-medium mt-1">{s.label}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Últimas órdenes */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm text-[#111]">Últimas órdenes</h2>
            <Link href="/admin/ordenes" className="text-xs text-[#888] hover:text-[#111] transition-colors">Ver todas →</Link>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white border border-[#f0f0f0]">
            <table className="min-w-full divide-y divide-[#f5f5f4]">
              <thead>
                <tr>
                  {['Número', 'Total', 'Estado', 'Fecha'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-[#aaa]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f4]">
                {recentOrders?.map(o => (
                  <tr key={o.id} className="hover:bg-[#fafaf9] transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-medium">
                      <Link href={`/admin/ordenes/${o.id}`} className="hover:underline" style={{ color: 'var(--color-primary)' }}>
                        #{o.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#111]">{fmt(Number(o.total))}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={o.status as OrderStatus} />
                    </td>
                    <td className="px-4 py-3 text-xs text-[#aaa]">
                      {new Date(o.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
                {!recentOrders?.length && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-[#bbb]">No hay órdenes aún.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Productos con poco stock */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm text-[#111]">Productos con poco stock</h2>
            <Link href="/admin/productos" className="text-xs text-[#888] hover:text-[#111] transition-colors">Ver todos →</Link>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white border border-[#f0f0f0]">
            {(lowStockVariants?.length ?? 0) + lowStockProductsFiltered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#bbb]">
                Todo el stock está bien ✓
              </div>
            ) : (
              <table className="min-w-full divide-y divide-[#f5f5f4]">
                <thead>
                  <tr>
                    {['Producto', 'Variante', 'Stock'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-[#aaa]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f5f4]">
                  {lowStockVariants?.map(v => (
                    <tr key={v.id} className="hover:bg-[#fafaf9]">
                      <td className="px-4 py-3 text-sm text-[#333]">{(v.products as any)?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-[#666]">{v.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${v.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                          {v.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {lowStockProductsFiltered.map(p => (
                    <tr key={p.id} className="hover:bg-[#fafaf9]">
                      <td className="px-4 py-3 text-sm text-[#333]">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-[#aaa] italic">Sin variantes</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${effectiveStock(p) === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                          {effectiveStock(p)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
