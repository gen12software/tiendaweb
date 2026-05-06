import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Metadata } from 'next'
import ProductForm from '../product-form'

export const metadata: Metadata = { title: 'Admin — Editar producto' }

interface Props { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*, product_images(*), product_variants(*)').eq('id', id).single(),
    supabase.from('categories').select('id, name').eq('is_active', true).order('name'),
  ])

  if (!product) notFound()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar: {product.name}</h1>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <ProductForm product={product as any} categories={categories ?? []} />
        </div>
      </div>
    </main>
  )
}
