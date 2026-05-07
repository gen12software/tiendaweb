import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
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
    // Deduplicación: no reenviar si el webhook reintenta
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const todayDate = new Date().toISOString().slice(0, 10)
    const { data: alreadySent } = await supabaseAdmin
      .from('email_logs')
      .select('id')
      .eq('reference_id', mpPaymentId)
      .eq('email_type', 'payment_confirmation')
      .eq('sent_date', todayDate)
      .maybeSingle()
    if (alreadySent) return

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
        dashboardUrl: `${appUrl}/cuenta/ordenes`,
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
    } else {
      await supabaseAdmin.from('email_logs').insert({
        reference_id: mpPaymentId,
        email_type: 'payment_confirmation',
        sent_date: todayDate,
      })
    }
  } catch (err) {
    console.error('[sendPaymentConfirmationEmail] Error inesperado:', err)
  }
}
