import { render } from '@react-email/components'
import { SupabaseClient } from '@supabase/supabase-js'
import { resend, FROM_EMAIL } from './client'
import { ExpirationReminderEmail } from './templates/expiration-reminder'
import { getSiteConfig } from '@/lib/site-config'

interface UserToRemind {
  id: string
  full_name: string | null
  plan_expires_at: string
  email: string
  plan_name: string
}

/**
 * Busca usuarios cuyo plan vence en `daysAhead` días (ventana de ±12 h centrada en
 * medianoche del día target) y les envía un email de aviso, evitando duplicados
 * mediante la tabla email_logs.
 */
export async function sendExpirationReminders(
  supabaseAdmin: SupabaseClient,
  daysAhead: 1 | 7,
): Promise<{ sent: number; skipped: number; failed: number }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const config = await getSiteConfig()

  // Ventana: desde medianoche del día target hasta el final de ese día (UTC)
  const target = new Date()
  target.setUTCDate(target.getUTCDate() + daysAhead)
  const windowStart = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate(), 0, 0, 0))
  const windowEnd   = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate(), 23, 59, 59))

  const emailType = daysAhead === 7 ? 'expiration_7d' : 'expiration_1d'
  const todayDate = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'

  // Usuarios con plan que vence en la ventana objetivo
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, plan_expires_at, plans(name)')
    .not('plan_id', 'is', null)
    .gte('plan_expires_at', windowStart.toISOString())
    .lte('plan_expires_at', windowEnd.toISOString())

  if (profilesError) {
    console.error('[sendExpirationReminders] Error al consultar profiles:', profilesError)
    return { sent: 0, skipped: 0, failed: 0 }
  }

  if (!profiles || profiles.length === 0) {
    return { sent: 0, skipped: 0, failed: 0 }
  }

  // Emails ya enviados hoy para este tipo (usa sent_date, columna date plain)
  const userIds = profiles.map((p) => p.id)
  const { data: alreadySent } = await supabaseAdmin
    .from('email_logs')
    .select('user_id')
    .eq('email_type', emailType)
    .eq('sent_date', todayDate)
    .in('user_id', userIds)

  const alreadySentIds = new Set((alreadySent ?? []).map((r) => r.user_id))

  let sent = 0
  const skipped = alreadySentIds.size
  let failed = 0

  for (const profile of profiles) {
    if (alreadySentIds.has(profile.id)) continue

    // Obtener email real desde auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.id)
    if (authError || !authData?.user?.email) {
      console.error(`[sendExpirationReminders] No se pudo obtener email para user ${profile.id}`)
      failed++
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const planName: string = (profile.plans as any)?.name ?? 'tu plan'
    const expiresAt = new Date(profile.plan_expires_at)
    const fullName = profile.full_name || authData.user.email

    try {
      const html = await render(
        ExpirationReminderEmail({
          fullName,
          siteName: config.site_name,
          planName,
          expiresAt,
          daysLeft: daysAhead,
          planesUrl: `${appUrl}/planes`,
        }),
      )

      const subject = daysAhead === 1
        ? `⚠️ Tu plan vence mañana — renovalo hoy`
        : `Tu plan vence en 7 días — renovalo antes de perder el acceso`

      if (!resend) { console.warn('[sendExpirationReminders] Resend no disponible'); break }
      const { error: sendError } = await resend.emails.send({
        from: `${config.site_name} <${FROM_EMAIL}>`,
        to: authData.user.email,
        subject,
        html,
      })

      if (sendError) {
        console.error(`[sendExpirationReminders] Resend error para ${authData.user.email}:`, sendError)
        failed++
        continue
      }

      // Registrar en email_logs para evitar reenvíos
      await supabaseAdmin.from('email_logs').insert({
        user_id: profile.id,
        email_type: emailType,
        sent_date: todayDate,
      })

      sent++
    } catch (err) {
      console.error(`[sendExpirationReminders] Error inesperado para user ${profile.id}:`, err)
      failed++
    }
  }

  return { sent, skipped, failed }
}
