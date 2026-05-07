'use server'

import { Resend } from 'resend'
import { getSiteConfig } from '@/lib/site-config'
import { FROM_EMAIL } from '@/lib/email/client'

interface ContactState {
  error?: string
  success?: boolean
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function contactAction(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = (formData.get('name') as string | null)?.trim() ?? ''
  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const message = (formData.get('message') as string | null)?.trim() ?? ''

  if (!name) return { error: 'El nombre es requerido' }
  if (name.length > 100) return { error: 'El nombre no puede superar 100 caracteres' }
  if (!validateEmail(email)) return { error: 'Ingresá un email válido' }
  if (email.length > 254) return { error: 'Email inválido' }
  if (!message) return { error: 'El mensaje es requerido' }
  if (message.length > 5000) return { error: 'El mensaje no puede superar 5000 caracteres' }

  const config = await getSiteConfig()

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('RESEND_API_KEY no configurada')
    return { error: 'Error de configuración del servidor. Intentá más tarde.' }
  }

  const resend = new Resend(apiKey)

  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeMessage = escapeHtml(message)

  const { error } = await resend.emails.send({
    from: `Formulario de contacto <${FROM_EMAIL}>`,
    to: config.contact_email,
    replyTo: email,
    subject: `Nuevo mensaje de contacto de ${safeName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Nuevo mensaje de contacto</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 80px;"><strong>Nombre:</strong></td>
            <td style="padding: 8px 0; color: #111827;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><strong>Email:</strong></td>
            <td style="padding: 8px 0; color: #111827;">${safeEmail}</td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
        <h3 style="color: #374151; margin-bottom: 8px;">Mensaje:</h3>
        <p style="color: #111827; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          Mensaje enviado desde el formulario de contacto de ${escapeHtml(config.site_name)}.
          Podés responder directamente a este email para contactar a ${safeName}.
        </p>
      </div>
    `,
  })

  if (error) {
    console.error('Resend error:', error)
    return { error: 'No se pudo enviar el mensaje. Intentá más tarde.' }
  }

  return { success: true }
}
