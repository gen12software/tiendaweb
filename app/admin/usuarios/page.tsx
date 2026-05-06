import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import SearchInput from './SearchInput'

const PAGE_SIZE = 20

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; desde?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/cuenta/ordenes')

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const q = params.q ?? ''
  const desde = params.desde ?? '7d'
  const from = (page - 1) * PAGE_SIZE

  // Necesitamos admin client para acceder a auth.users
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Traemos profiles con paginación
  let profilesQuery = supabase
    .from('profiles')
    .select('id, full_name, role, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (q) profilesQuery = profilesQuery.ilike('full_name', `%${q}%`)

  if (desde !== 'all') {
    const dias = desde === '1d' ? 1 : desde === '15d' ? 15 : desde === '1m' ? 30 : 7
    const fechaDesde = new Date()
    fechaDesde.setDate(fechaDesde.getDate() - dias)
    profilesQuery = profilesQuery.gte('created_at', fechaDesde.toISOString())
  }

  profilesQuery = profilesQuery.range(from, from + PAGE_SIZE - 1)
  const { data: profiles, count } = await profilesQuery

  // Traemos emails de auth.users para los IDs obtenidos
  const ids = profiles?.map(p => p.id) ?? []
  const emailMap: Record<string, string> = {}
  if (ids.length > 0) {
    const { data: authUsers } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
    authUsers?.users.forEach(u => { emailMap[u.id] = u.email ?? '' })
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams({ page: String(page), ...(q ? { q } : {}), desde, ...overrides })
    return `?${p.toString()}`
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>

        <div className="flex flex-wrap items-end gap-3">
          <Suspense>
            <SearchInput defaultValue={q} />
          </Suspense>

          <select
            defaultValue={desde}
            onChange={undefined}
            name="desde"
            form="filtros"
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="1d">Hoy</option>
            <option value="7d">Última semana</option>
            <option value="15d">Últimos 15 días</option>
            <option value="1m">Último mes</option>
            <option value="all">Todos</option>
          </select>

          <form id="filtros" method="get" className="contents">
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">Filtrar</button>
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Nombre', 'Email', 'Rol', 'Registro'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profiles?.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">
                    {u.full_name || <span className="text-gray-400 italic">Sin nombre</span>}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{emailMap[u.id] || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role === 'admin' ? 'Admin' : 'Usuario'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {new Date(u.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {!profiles?.length && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">No se encontraron usuarios.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Página {page} de {totalPages} · {count} usuarios</span>
            <div className="flex gap-2">
              {page > 1 && <a href={buildUrl({ page: String(page - 1) })} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50">← Anterior</a>}
              {page < totalPages && <a href={buildUrl({ page: String(page + 1) })} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50">Siguiente →</a>}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
