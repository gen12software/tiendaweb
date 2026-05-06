import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import CategoryForm from '../category-form'

export const metadata: Metadata = { title: 'Admin — Editar categoría' }

interface Props { params: Promise<{ id: string }> }

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/cuenta/ordenes')

  const { data: category } = await supabase.from('categories').select('*').eq('id', id).single()
  if (!category) notFound()

  return (
    <main className="flex-1 px-8 py-10">
      <div className="max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/categorias" className="text-sm text-[#888] hover:text-[#111] transition-colors">← Volver</Link>
          <h1 className="font-heading text-2xl font-bold text-[#111]">Editar: {category.name}</h1>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <CategoryForm category={category} />
        </div>
      </div>
    </main>
  )
}
