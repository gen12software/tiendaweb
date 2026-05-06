import { render } from '@react-email/components'
import { resend, FROM_EMAIL } from './client'
import { PaymentConfirmationEmail } from './templates/payment-confirmation'
import { getSiteConfig } from '@/lib/site-config'

export async function sendPaymentConfirmationEmail(
  email: string,
  fullName: string,
  planName: string,
  amount: number,
  expiresAt: Date,
  mpPaymentId: string,
): Promise<void> {
  try {
    const config = await getSiteConfig()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const html = await render(
      PaymentConfirmationEmail({
        fullName: fullName || email,
        siteName: config.site_name,
        planName,
        amount,
        startsAt: new Date(),
        expiresAt,
        mpPaymentId,
        dashboardUrl: `${appUrl}/dashboard`,
      }),
    )

    if (!resend) { console.warn('[sendPaymentConfirmationEmail] Resend no disponible'); return }
    const { error } = await resend.emails.send({
      from: `${config.site_name} <${FROM_EMAIL}>`,
      to: email,
      subject: `Comprobante de compra — ${planName}`,
      html,
    })

    if (error) {
      console.error('[sendPaymentConfirmationEmail] Resend error:', error)
    }
  } catch (err) {
    console.error('[sendPaymentConfirmationEmail] Error inesperado:', err)
  }
}
