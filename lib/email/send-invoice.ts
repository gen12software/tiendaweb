import { createClient as createAdminClient } from '@supabase/supabase-js'
import { resend, FROM_EMAIL } from './client'
import { getSiteConfig } from '@/lib/site-config'

interface SendInvoiceParams {
  orderId: string
  orderNumber: string
  email: string
  fullName: string
  invoiceUrl: string
}

export async function sendInvoiceEmail(params: SendInvoiceParams): Promise<void> {
  if (!resend) {
    console.warn('[sendInvoiceEmail] Resend no disponible')
    return
  }

  const config = await getSiteConfig()

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;color:#111;background:#f9fafb;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb">
    <h1 style="font-size:20px;margin:0 0 8px">${config.site_name}</h1>
    <p style="color:#6b7280;margin:0 0 24px;font-size:14px">Tu factura está lista</p>

    <p style="margin:0 0 8px">Hola ${params.fullName || params.email},</p>
    <p style="color:#374151;margin:0 0 24px">
      Te enviamos la factura correspondiente a tu pedido <strong>#${params.orderNumber}</strong>.
    </p>

    <a href="${params.invoiceUrl}"
       style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">
      Descargar factura (PDF)
    </a>

    <p style="color:#9ca3af;font-size:12px;margin:32px 0 0">
      Si el botón no funciona, copiá este link en tu navegador:<br>
      <span style="color:#6b7280;word-break:break-all">${params.invoiceUrl}</span>
    </p>
  </div>
</body>
</html>`

  const { error } = await resend.emails.send({
    from: `${config.site_name} <${FROM_EMAIL}>`,
    to: params.email,
    subject: `Factura de tu pedido #${params.orderNumber} — ${config.site_name}`,
    html,
  })

  if (error) {
    console.error('[sendInvoiceEmail] Resend error:', error)
    throw new Error('Error al enviar el email')
  }
}
