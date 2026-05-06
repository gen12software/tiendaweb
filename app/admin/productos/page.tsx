import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import ToggleProductButton from './toggle-product-button'

export const metadata: Metadata = { title: 'Admin — Productos' }

export default async function AdminProductosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, price, is_active, is_featured, created_at, categories(name)')
    .order('created_at', { ascending: false })

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

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Nombre', 'Categoría', 'Precio', 'Estado', 'Destacado', 'Acciones'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products?.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{(p.categories as any)?.name ?? '—'}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">${Number(p.price).toLocaleString('es-AR')}</td>
                  <td className="px-5 py-4"><ToggleProductButton id={p.id} isActive={p.is_active} /></td>
                  <td className="px-5 py-4 text-sm text-gray-500">{p.is_featured ? '⭐' : '—'}</td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/productos/${p.id}`} className="text-sm text-indigo-600 hover:underline">Editar</Link>
                  </td>
                </tr>
              ))}
              {!products?.length && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">No hay productos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
