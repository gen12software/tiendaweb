import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import ToggleCategoryButton from './toggle-category-button'
import CategorySearch from './category-search'

export const metadata: Metadata = { title: 'Admin — Categorías' }

interface Props { searchParams: Promise<{ q?: string; estado?: string }> }

export default async function AdminCategoriasPage({ searchParams }: Props) {
  const { q, estado } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/cuenta/ordenes')

  let query = supabase.from('categories').select('*').order('sort_order')

  if (q?.trim()) query = query.ilike('name', `%${q.trim()}%`)
  if (estado === 'activa') query = query.eq('is_active', true)
  if (estado === 'inactiva') query = query.eq('is_active', false)

  const { data: categories } = await query

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <Link href="/admin/categorias/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
            + Nueva categoría
          </Link>
        </div>

        <Suspense>
          <CategorySearch />
        </Suspense>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Nombre', 'Slug', 'Orden', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories?.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">{c.name}</td>
                  <td className="px-5 py-4 text-xs font-mono text-gray-500">{c.slug}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{c.sort_order}</td>
                  <td className="px-5 py-4"><ToggleCategoryButton id={c.id} isActive={c.is_active} /></td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/categorias/${c.id}`} className="text-sm text-indigo-600 hover:underline">Editar</Link>
                  </td>
                </tr>
              ))}
              {!categories?.length && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
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
