import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Paywall from '@/components/dashboard/paywall'
import ContentGrid from '@/components/dashboard/content-grid'

export default async function ContenidoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_id, plan_expires_at')
    .eq('id', user.id)
    .single()

  const expiresAt = profile?.plan_expires_at ?? null
  const hasActivePlan =
    profile?.plan_id !== null &&
    expiresAt !== null &&
    new Date(expiresAt) > new Date()

  if (!hasActivePlan) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Contenido</h1>
          <Paywall />
        </div>
      </main>
    )
  }

  const { data: items } = await supabase
    .from('content')
    .select('id, title, description, category, duration_minutes, video_url')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Contenido</h1>
        {!items || items.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay contenido disponible por el momento.</p>
        ) : (
          <ContentGrid items={items} />
        )}
      </div>
    </main>
  )
}
