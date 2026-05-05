import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ContentForm from '../ContentForm'
import { updateContentAction } from '../actions'

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { id } = await params
  const { data: item } = await supabase
    .from('content')
    .select('id, title, description, video_url, category, duration_minutes, sort_order, is_active')
    .eq('id', id)
    .single()

  if (!item) notFound()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Editar contenido</h1>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <ContentForm item={item} action={updateContentAction} submitLabel="Guardar cambios" />
        </div>
      </div>
    </main>
  )
}
