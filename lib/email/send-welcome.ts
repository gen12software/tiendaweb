import { render } from '@react-email/components'
import { resend, FROM_EMAIL } from './client'
import { WelcomeEmail } from './templates/welcome'
import { getSiteConfig } from '@/lib/site-config'

export async function sendWelcomeEmail(email: string, fullName: string): Promise<void> {
  try {
    const config = await getSiteConfig()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const html = await render(
      WelcomeEmail({
        fullName: fullName || email,
        siteName: config.site_name,
        dashboardUrl: `${appUrl}/cuenta/ordenes`,
      }),
    )

    if (!resend) { console.warn('[sendWelcomeEmail] Resend no disponible'); return }
    const { error } = await resend.emails.send({
      from: `${config.site_name} <${FROM_EMAIL}>`,
      to: email,
      subject: `¡Bienvenido/a a ${config.site_name}!`,
      html,
    })

    if (error) {
      console.error('[sendWelcomeEmail] Resend error:', error)
    }
  } catch (err) {
    console.error('[sendWelcomeEmail] Error inesperado:', err)
  }
}
