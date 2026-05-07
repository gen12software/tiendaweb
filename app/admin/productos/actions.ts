'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? supabase : null
}

export async function toggleProductAction(id: string, isActive: boolean) {
  const supabase = await assertAdmin()
  if (!supabase) return
  await supabase.from('products').update({ is_active: isActive }).eq('id', id)
  revalidatePath('/admin/productos')
}
