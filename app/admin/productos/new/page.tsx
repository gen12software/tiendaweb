import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import ProductForm from '../product-form'

export const metadata: Metadata = { title: 'Admin — Nuevo producto' }

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: categories } = await supabase.from('categories').select('id, name').eq('is_active', true).order('name')

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo producto</h1>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <ProductForm categories={categories ?? []} />
        </div>
      </div>
    </main>
  )
}
