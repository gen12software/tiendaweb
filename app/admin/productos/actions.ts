'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleProductAction(id: string, isActive: boolean) {
  const supabase = await createClient()
  await supabase.from('products').update({ is_active: isActive }).eq('id', id)
  revalidatePath('/admin/productos')
}

