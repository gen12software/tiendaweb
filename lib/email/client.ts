import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.error('[email] RESEND_API_KEY no configurada — los emails NO se enviarán')
} else if (process.env.RESEND_API_KEY.startsWith('re_test_')) {
  console.warn('[email] RESEND_API_KEY es una test key — solo se enviarán emails a la dirección verificada de la cuenta Resend')
}

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'noreply@resend.dev'
