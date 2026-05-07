import { render } from '@react-email/components'
import { SupabaseClient } from '@supabase/supabase-js'
import { resend, FROM_EMAIL } from './client'
import { LowStockAlertEmail } from './templates/low-stock-alert'
import { getSiteConfig } from '@/lib/site-config'

export interface LowStockItem {
  variantId: string
  productName: string
  variantName?: string
  sku?: string
  stock: number
}

export async function sendLowStockAlert(
  supabaseAdmin: SupabaseClient,
  items: LowStockItem[],
  threshold: number,
): Promise<void> {
  if (!items.length) return
  if (!resend) { console.warn('[sendLowStockAlert] Resend no disponible'); return }

  try {
    const todayDate = new Date().toISOString().slice(0, 10)

    // Filtrar los que ya recibieron aviso hoy
    const variantIds = items.map((i) => i.variantId)
    const { data: alreadySent } = await supabaseAdmin
      .from('email_logs')
      .select('reference_id')
      .eq('email_type', 'low_stock_alert')
      .eq('sent_date', todayDate)
      .in('reference_id', variantIds)

    const alreadySentIds = new Set((alreadySent ?? []).map((r) => r.reference_id))
    const toAlert = items.filter((i) => !alreadySentIds.has(i.variantId))
    if (!toAlert.length) return

    const config = await getSiteConfig()
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')

    const html = await render(
      LowStockAlertEmail({
        siteName: config.site_name,
        items: toAlert,
        threshold,
        adminUrl: appUrl,
      }),
    )

    const { error } = await resend.emails.send({
      from: `${config.site_name} <${FROM_EMAIL}>`,
      to: config.contact_email,
      subject: `⚠️ ${toAlert.length} producto${toAlert.length !== 1 ? 's' : ''} con stock bajo — ${config.site_name}`,
      html,
    })

    if (error) {
      console.error('[sendLowStockAlert] Resend error:', error)
      return
    }

    // Registrar un log por variante para deduplicación diaria
    await supabaseAdmin.from('email_logs').insert(
      toAlert.map((i) => ({
        reference_id: i.variantId,
        email_type: 'low_stock_alert',
        sent_date: todayDate,
      })),
    )
  } catch (err) {
    console.error('[sendLowStockAlert] Error inesperado:', err)
  }
}
