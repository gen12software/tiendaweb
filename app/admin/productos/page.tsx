import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { getSiteConfig } from '@/lib/site-config'
import ToggleProductButton from './toggle-product-button'
import ProductSearch from './product-search'

export const metadata: Metadata = { title: 'Admin — Productos' }

interface Props { searchParams: Promise<{ q?: string; cat?: string; estado?: string; orden?: string; stock?: string }> }

export default async function AdminProductosPage({ searchParams }: Props) {
  const { q, cat, estado, orden, stock } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const [{ data: categories }, config] = await Promise.all([
    supabase.from('categories').select('id, name').eq('is_active', true).order('name'),
    getSiteConfig(),
  ])

  const threshold = parseInt(config.low_stock_threshold ?? '5') || 5

  let query = supabase
    .from('products')
    .select('id, name, slug, price, stock, is_active, is_featured, created_at, categories(id, name), product_variants(stock)')

  if (q?.trim()) query = query.ilike('name', `%${q.trim()}%`)
  if (cat) query = query.eq('category_id', cat)
  if (estado === 'activo') query = query.eq('is_active', true)
  if (estado === 'inactivo') query = query.eq('is_active', false)

  if (orden === 'precio_asc') query = query.order('price', { ascending: true })
  else if (orden === 'precio_desc') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data: products } = await query

  // Helper: stock efectivo del producto
  function effectiveStock(p: any): number {
    const variants = p.product_variants ?? []
    if (variants.length > 0) return variants.reduce((s: number, v: any) => s + v.stock, 0)
    return p.stock ?? 0
  }

  // Filtro por stock bajo (client-side tras fetch)
  const filtered = stock === 'bajo'
    ? (products ?? []).filter(p => effectiveStock(p) <= threshold)
    : (products ?? [])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <Link href="/admin/productos/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
            + Nuevo producto
          </Link>
        </div>

        <Suspense>
          <ProductSearch categories={categories ?? []} threshold={threshold} />
        </Suspense>

        {stock === 'bajo' && (
          <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2.5">
            <span>⚠️</span>
            <span>Mostrando productos con stock ≤ {threshold}. <Link href="/admin/productos" className="underline">Ver todos</Link></span>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Nombre', 'Categoría', 'Precio', 'Stock', 'Estado', 'Destacado', 'Acciones'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => {
                const eff = effectiveStock(p)
                const isLow = eff <= threshold
                const isOut = eff === 0
                return (
                  <tr key={p.id} className={`transition-colors ${
                    isOut ? 'bg-red-50 hover:bg-red-100' :
                    isLow ? 'bg-orange-50 hover:bg-orange-100' :
                    'hover:bg-gray-50'
                  }`}>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {p.name}
                      {isOut && <span className="ml-2 text-xs font-semibold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">Sin stock</span>}
                      {isLow && !isOut && <span className="ml-2 text-xs font-semibold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">Stock bajo</span>}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{(p.categories as any)?.name ?? '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">${Number(p.price).toLocaleString('es-AR')}</td>
                    <td className="px-5 py-4 text-sm font-semibold">
                      <span className={isOut ? 'text-red-600' : isLow ? 'text-orange-500' : 'text-gray-700'}>
                        {eff}
                      </span>
                    </td>
                    <td className="px-5 py-4"><ToggleProductButton id={p.id} isActive={p.is_active} /></td>
                    <td className="px-5 py-4 text-sm text-gray-500">{p.is_featured ? '⭐' : '—'}</td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/productos/${p.id}`} className="text-sm text-indigo-600 hover:underline">Editar</Link>
                    </td>
                  </tr>
                )
              })}
              {!filtered.length && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                  Sin resultados para los filtros aplicados.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
