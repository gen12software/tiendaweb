import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import SearchInput from './SearchInput'

const PAGE_SIZE = 20

type FilterType = 'all' | 'active' | 'no-plan' | 'expired'

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all',     label: 'Todos' },
  { value: 'active',  label: 'Con plan activo' },
  { value: 'no-plan', label: 'Sin plan' },
  { value: 'expired', label: 'Plan vencido' },
]

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filter?: string; q?: string }>
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const filter = (params.filter ?? 'all') as FilterType
  const q = params.q ?? ''
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const now = new Date().toISOString()

  let query = supabase
    .from('profiles')
    .select('id, full_name, plan_id, plan_expires_at, created_at, plans(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (q) {
    query = query.ilike('full_name', `%${q}%`)
  }

  if (filter === 'active') {
    query = query.not('plan_id', 'is', null).gt('plan_expires_at', now)
  } else if (filter === 'no-plan') {
    query = query.is('plan_id', null)
  } else if (filter === 'expired') {
    query = query.not('plan_id', 'is', null).lte('plan_expires_at', now)
  }

  const { data: users, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams({ page: String(page), filter, ...(q ? { q } : {}), ...overrides })
    return `?${p.toString()}`
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>

        {/* Filtros y búsqueda */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Link
                key={f.value}
                href={buildUrl({ filter: f.value, page: '1' })}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-indigo-400'
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
          <Suspense>
            <SearchInput defaultValue={q} />
          </Suspense>
        </div>

        {!users || users.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center text-gray-400 text-sm">
            No se encontraron usuarios.
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vencimiento</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const planName = (u.plans as any)?.name ?? null
                    const expires = u.plan_expires_at ? new Date(u.plan_expires_at) : null
                    const isActive = expires !== null && expires > new Date()
                    const expiresFormatted = expires
                      ? expires.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
                      : null
                    const createdFormatted = new Date(u.created_at).toLocaleDateString('es-AR', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })

                    return (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/admin/usuarios/${u.id}`} className="block">
                            <p className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                              {u.full_name || <span className="text-gray-400 italic">Sin nombre</span>}
                            </p>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {planName ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {expiresFormatted ? (
                            <span className={isActive ? 'text-green-700' : 'text-red-600'}>
                              {expiresFormatted}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{createdFormatted}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Página {page} de {totalPages} · {count} usuarios</span>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link href={buildUrl({ page: String(page - 1) })}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors">
                      ← Anterior
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link href={buildUrl({ page: String(page + 1) })}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors">
                      Siguiente →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
