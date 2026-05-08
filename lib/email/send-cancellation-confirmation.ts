import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { resend, FROM_EMAIL } from './client'
import { CancellationConfirmationEmail } from './templates/cancellation-confirmation'
import { getSiteConfig } from '@/lib/site-config'

interface OrderItem {
  name: string
  quantity: number
  unit_price: number
}

interface SendCancellationConfirmationParams {
  orderId: string
  orderNumber: string
  buyerEmail: string
  reason: string
  total: number
  items: OrderItem[]
}

export async function sendCancellationConfirmationEmail(params: SendCancellationConfirmationParams): Promise<void> {
  try {
    if (!resend) { console.warn('[sendCancellationConfirmationEmail] Resend no disponible'); return }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const todayDate = new Date().toISOString().slice(0, 10)

    const { data: alreadySent } = await supabaseAdmin
      .from('email_logs')
      .select('id')
      .eq('reference_id', params.orderId)
      .eq('email_type', 'cancellation_confirmation')
      .eq('sent_date', todayDate)
      .maybeSingle()
    if (alreadySent) return

    const config = await getSiteConfig()

    const html = await render(
      CancellationConfirmationEmail({
        fullName: params.buyerEmail,
        siteName: config.site_name,
        orderNumber: params.orderNumber,
        reason: params.reason,
        items: params.items,
        total: params.total,
      }),
    )

    const { error } = await resend.emails.send({
      from: `${config.site_name} <${FROM_EMAIL}>`,
      to: params.buyerEmail,
      subject: `Solicitud de cancelación recibida — Pedido ${params.orderNumber}`,
      html,
    })

    if (error) {
      console.error('[sendCancellationConfirmationEmail] Resend error:', { orderId: params.orderId, error })
    } else {
      await supabaseAdmin.from('email_logs').insert({
        reference_id: params.orderId,
        email_type: 'cancellation_confirmation',
        sent_date: todayDate,
      })
    }
  } catch (err) {
    console.error('[sendCancellationConfirmationEmail] Error inesperado:', { orderId: params.orderId, err })
  }
}
