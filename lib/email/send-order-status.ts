import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { resend, FROM_EMAIL } from './client'
import { OrderStatusEmail } from './templates/order-status'
import { getSiteConfig } from '@/lib/site-config'

type StatusKey = 'en_preparacion' | 'enviado' | 'listo_para_retirar' | 'entregado'

interface SendOrderStatusParams {
  orderId: string
  orderNumber: string
  buyerEmail: string
  buyerName: string
  status: StatusKey
  trackingNumber?: string
}

const SUBJECT: Record<StatusKey, string> = {
  en_preparacion: 'Tu pedido está siendo preparado',
  enviado: 'Tu pedido fue despachado',
  listo_para_retirar: 'Tu pedido está listo para retirar',
  entregado: 'Tu pedido fue entregado',
}

export async function sendOrderStatusEmail(params: SendOrderStatusParams): Promise<void> {
  try {
    if (!resend) { console.warn('[sendOrderStatusEmail] Resend no disponible'); return }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const emailType = `order_status_${params.status}`
    const todayDate = new Date().toISOString().slice(0, 10)

    const { data: alreadySent } = await supabaseAdmin
      .from('email_logs')
      .select('id')
      .eq('reference_id', params.orderId)
      .eq('email_type', emailType)
      .eq('sent_date', todayDate)
      .maybeSingle()
    if (alreadySent) return

    const config = await getSiteConfig()
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
    const orderUrl = `${appUrl}/mi-orden?order=${params.orderNumber}&email=${encodeURIComponent(params.buyerEmail)}`

    const html = await render(
      OrderStatusEmail({
        fullName: params.buyerName || params.buyerEmail,
        siteName: config.site_name,
        orderNumber: params.orderNumber,
        status: params.status,
        trackingNumber: params.trackingNumber,
        orderUrl,
      }),
    )

    const { error } = await resend.emails.send({
      from: `${config.site_name} <${FROM_EMAIL}>`,
      to: params.buyerEmail,
      subject: `${SUBJECT[params.status]} — Pedido ${params.orderNumber}`,
      html,
    })

    if (error) {
      console.error('[sendOrderStatusEmail] Resend error:', { orderId: params.orderId, status: params.status, error })
    } else {
      await supabaseAdmin.from('email_logs').insert({
        reference_id: params.orderId,
        email_type: emailType,
        sent_date: todayDate,
      })
    }
  } catch (err) {
    console.error('[sendOrderStatusEmail] Error inesperado:', { orderId: params.orderId, err })
  }
}
