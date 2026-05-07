import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { resend, FROM_EMAIL } from './client'
import { OrderCancelledEmail } from './templates/order-cancelled'
import { getSiteConfig } from '@/lib/site-config'

interface OrderItem {
  name: string
  quantity: number
  unit_price: number
}

interface SendOrderCancelledParams {
  orderId: string
  orderNumber: string
  buyerEmail: string
  buyerName: string
  items: OrderItem[]
  total: number
  wasPaid: boolean
}

export async function sendOrderCancelledEmail(params: SendOrderCancelledParams): Promise<void> {
  try {
    if (!resend) { console.warn('[sendOrderCancelledEmail] Resend no disponible'); return }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const todayDate = new Date().toISOString().slice(0, 10)

    const { data: alreadySent } = await supabaseAdmin
      .from('email_logs')
      .select('id')
      .eq('reference_id', params.orderId)
      .eq('email_type', 'order_cancelled')
      .eq('sent_date', todayDate)
      .maybeSingle()
    if (alreadySent) return

    const config = await getSiteConfig()

    const html = await render(
      OrderCancelledEmail({
        fullName: params.buyerName || params.buyerEmail,
        siteName: config.site_name,
        orderNumber: params.orderNumber,
        items: params.items,
        total: params.total,
        wasPaid: params.wasPaid,
      }),
    )

    const { error } = await resend.emails.send({
      from: `${config.site_name} <${FROM_EMAIL}>`,
      to: params.buyerEmail,
      subject: `Tu pedido ${params.orderNumber} fue cancelado`,
      html,
    })

    if (error) {
      console.error('[sendOrderCancelledEmail] Resend error:', { orderId: params.orderId, error })
    } else {
      await supabaseAdmin.from('email_logs').insert({
        reference_id: params.orderId,
        email_type: 'order_cancelled',
        sent_date: todayDate,
      })
    }
  } catch (err) {
    console.error('[sendOrderCancelledEmail] Error inesperado:', { orderId: params.orderId, err })
  }
}
