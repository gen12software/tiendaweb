'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function toggleProductAction(id: string, isActive: boolean) {
  const supabase = await createClient()
  await supabase.from('products').update({ is_active: isActive }).eq('id', id)
  revalidatePath('/admin/productos')
}

export async function saveProductAction(
  _prevState: { error: string; success: string },
  formData: FormData
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado', success: '' }

  const id = formData.get('id') as string | null
  const name = (formData.get('name') as string).trim()
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const price = parseFloat(formData.get('price') as string)
  const compare_at_price = formData.get('compare_at_price') ? parseFloat(formData.get('compare_at_price') as string) : null
  const description = (formData.get('description') as string).trim() || null
  const category_id = (formData.get('category_id') as string) || null
  const is_featured = formData.get('is_featured') === 'true'
  const is_active = formData.get('is_active') === 'true'

  if (!name || isNaN(price)) return { error: 'Nombre y precio son requeridos', success: '' }

  const payload = { name, slug, price, compare_at_price, description, category_id, is_featured, is_active }

  if (id) {
    const { error } = await supabase.from('products').update(payload).eq('id', id)
    if (error) return { error: error.message, success: '' }
  } else {
    const { error } = await supabase.from('products').insert(payload)
    if (error) return { error: error.message, success: '' }
  }

  revalidatePath('/admin/productos')
  revalidatePath('/productos')
  return { error: '', success: 'Producto guardado correctamente' }
}
