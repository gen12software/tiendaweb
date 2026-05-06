import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('[email] RESEND_API_KEY no configurada — los emails no se enviarán')
}

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'noreply@resend.dev'
