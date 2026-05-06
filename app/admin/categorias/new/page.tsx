import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CategoryForm from '../category-form'

export default async function NewCategoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/cuenta/ordenes')

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 space-y-6">
        <Link href="/admin/categorias" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a categorías
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nueva categoría</h1>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <CategoryForm />
        </div>
      </div>
    </main>
  )
}
