import { render } from '@react-email/components'
import { resend, FROM_EMAIL } from './client'
import { OrderConfirmationEmail } from './templates/order-confirmation'
import { getSiteConfig } from '@/lib/site-config'

interface OrderItem {
  name: string
  quantity: number
  unit_price: number
}

interface SendOrderConfirmationParams {
  email: string
  fullName: string
  orderNumber: string
  orderId: string
  publicToken: string
  items: OrderItem[]
  total: number
  shippingTotal: number
  shippingAddress: string
}

export async function sendOrderConfirmationEmail(params: SendOrderConfirmationParams): Promise<void> {
  try {
    if (!resend) { console.warn('[sendOrderConfirmationEmail] Resend no disponible'); return }

    const config = await getSiteConfig()
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
    const orderUrl = `${appUrl}/mi-orden?token=${params.publicToken}&email=${encodeURIComponent(params.email)}`

    const html = await render(
      OrderConfirmationEmail({
        fullName: params.fullName || params.email,
        siteName: config.site_name,
        orderNumber: params.orderNumber,
        items: params.items,
        total: params.total,
        shippingTotal: params.shippingTotal,
        shippingAddress: params.shippingAddress,
        orderUrl,
        appUrl,
      }),
    )

    const { error } = await resend.emails.send({
      from: `${config.site_name} <${FROM_EMAIL}>`,
      to: params.email,
      subject: `Pedido ${params.orderNumber} confirmado — ${config.site_name}`,
      html,
    })

    if (error) console.error('[sendOrderConfirmationEmail] Resend error:', error)
  } catch (err) {
    console.error('[sendOrderConfirmationEmail] Error inesperado:', err)
  }
}
