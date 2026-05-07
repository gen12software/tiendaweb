'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { OrderStatus } from '@/lib/types/store'
import { sendOrderStatusEmail } from '@/lib/email/send-order-status'
import { sendOrderCancelledEmail } from '@/lib/email/send-order-cancelled'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function updateOrderAction(
  id: string,
  data: { status: OrderStatus; tracking_number: string; admin_notes: string }
) {
  const adminUser = await assertAdmin()
  if (!adminUser) return { error: 'No autorizado' }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: currentOrder } = await supabaseAdmin
    .from('orders')
    .select('status, number, email, total, shipping_address')
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

  // Restaurar stock si se cancela una orden que estaba en estado pagado
  const paidStatuses = ['pago_pendiente', 'nueva', 'en_preparacion', 'enviado', 'entregado']
  const wasPaid = currentOrder && paidStatuses.includes(currentOrder.status)
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

  // Emails de cambio de estado
  if (currentOrder) {
    const buyerEmail = currentOrder.email
    const orderNumber = currentOrder.number
    const shippingAddress = currentOrder.shipping_address as { full_name?: string } | null
    const buyerName = shippingAddress?.full_name ?? ''

    const statusEmails = ['en_preparacion', 'enviado', 'listo_para_retirar', 'entregado'] as const
    if ((statusEmails as readonly string[]).includes(data.status)) {
      sendOrderStatusEmail({
        orderId: id,
        orderNumber,
        buyerEmail,
        buyerName,
        status: data.status as typeof statusEmails[number],
        trackingNumber: data.tracking_number || undefined,
      }).catch((err) => console.error('[email] order status email failed', { id, status: data.status, err }))
    }

    if (data.status === 'cancelado') {
      const { data: items } = await supabaseAdmin
        .from('order_items')
        .select('quantity, unit_price, snapshot')
        .eq('order_id', id)

      const { data: payment } = await supabaseAdmin
        .from('payments')
        .select('status')
        .eq('order_id', id)
        .eq('status', 'approved')
        .maybeSingle()

      const emailItems = (items ?? []).map((item) => {
        const snapshot = item.snapshot as { name: string; variant_name?: string }
        return {
          name: snapshot.variant_name ? `${snapshot.name} - ${snapshot.variant_name}` : snapshot.name,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
        }
      })

      sendOrderCancelledEmail({
        orderId: id,
        orderNumber,
        buyerEmail,
        buyerName,
        items: emailItems,
        total: Number(currentOrder.total),
        wasPaid: !!payment,
      }).catch((err) => console.error('[email] order cancelled email failed', { id, err }))
    }
  }

  revalidatePath(`/admin/ordenes/${id}`)
  revalidatePath('/admin/ordenes')
  return { error: '' }
}
