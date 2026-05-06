'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { OrderStatus } from '@/lib/types/store'

export async function updateOrderAction(
  id: string,
  data: { status: OrderStatus; tracking_number: string; admin_notes: string }
) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: currentOrder } = await supabaseAdmin
    .from('orders')
    .select('status')
    .eq('id', id)
    .single()

  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      status: data.status,
      tracking_number: data.tracking_number || null,
      admin_notes: data.admin_notes || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  // Restaurar stock si se cancela una orden que estaba pagada
  const wasPaid = currentOrder && ['en_preparacion', 'enviado', 'entregado'].includes(currentOrder.status)
  if (data.status === 'cancelado' && wasPaid) {
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', id)

    if (items) {
      for (const item of items) {
        if (item.variant_id) {
          const { data: variant } = await supabaseAdmin
            .from('product_variants')
            .select('stock')
            .eq('id', item.variant_id)
            .single()

          if (variant) {
            await supabaseAdmin
              .from('product_variants')
              .update({ stock: variant.stock + item.quantity })
              .eq('id', item.variant_id)
          }
        }
      }
    }
  }

  revalidatePath(`/admin/ordenes/${id}`)
  revalidatePath('/admin/ordenes')
  return { error: '' }
}
