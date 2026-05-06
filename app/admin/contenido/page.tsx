import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ToggleContentButton from './ToggleContentButton'

export default async function AdminContenidoPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/cuenta/ordenes')

  const { data: items } = await supabase
    .from('content')
    .select('id, title, category, duration_minutes, sort_order, is_active')
    .order('sort_order', { ascending: true })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Contenido</h1>
          <Link
            href="/admin/contenido/new"
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            + Nuevo contenido
          </Link>
        </div>

        {!items || items.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center text-gray-400 text-sm">
            No hay contenido creado aún.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Duración</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Orden</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-gray-50 ${!item.is_active ? 'opacity-50' : ''}`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.category ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-right">
                      {item.duration_minutes ? `${item.duration_minutes} min` : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-right">{item.sort_order}</td>
                    <td className="px-6 py-4 text-center">
                      <ToggleContentButton id={item.id} isActive={item.is_active} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/contenido/${item.id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
