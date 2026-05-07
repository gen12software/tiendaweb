import { render } from '@react-email/components'
import { SupabaseClient } from '@supabase/supabase-js'
import { resend, FROM_EMAIL } from './client'
import { WeeklySummaryEmail } from './templates/weekly-summary'
import { getSiteConfig } from '@/lib/site-config'

export async function sendWeeklySummary(supabaseAdmin: SupabaseClient): Promise<{ sent: boolean; error?: string }> {
  if (!resend) return { sent: false, error: 'Resend no disponible' }

  try {
    const config = await getSiteConfig()
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')

    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const weekLabel = `${weekAgo.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })} – ${now.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}`

    // Órdenes de la semana (excluye canceladas y pago_pendiente)
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('id, total, status')
      .gte('created_at', weekAgo.toISOString())
      .not('status', 'in', '("cancelado","pago_pendiente")')

    const totalOrders = orders?.length ?? 0
    const totalRevenue = (orders ?? []).reduce((sum, o) => sum + Number(o.total), 0)

    // Top 5 productos por cantidad vendida
    const orderIds = (orders ?? []).map((o) => o.id)
    let topProducts: Array<{ name: string; variantName?: string; totalQuantity: number; totalRevenue: number }> = []

    if (orderIds.length > 0) {
      const { data: items } = await supabaseAdmin
        .from('order_items')
        .select('quantity, unit_price, total_price, snapshot')
        .in('order_id', orderIds)

      if (items) {
        const productMap = new Map<string, { name: string; variantName?: string; totalQuantity: number; totalRevenue: number }>()
        for (const item of items) {
          const snapshot = item.snapshot as { name: string; variant_name?: string }
          const key = `${snapshot.name}||${snapshot.variant_name ?? ''}`
          const existing = productMap.get(key)
          if (existing) {
            existing.totalQuantity += item.quantity
            existing.totalRevenue += Number(item.total_price)
          } else {
            productMap.set(key, {
              name: snapshot.name,
              variantName: snapshot.variant_name,
              totalQuantity: item.quantity,
              totalRevenue: Number(item.total_price),
            })
          }
        }
        topProducts = Array.from(productMap.values())
          .sort((a, b) => b.totalQuantity - a.totalQuantity)
          .slice(0, 5)
      }
    }

    // Órdenes sin actualizar hace más de 48 horas
    const fortyEightHoursAgo = new Date(now)
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48)

    const { data: staleRaw } = await supabaseAdmin
      .from('orders')
      .select('number, status, updated_at')
      .in('status', ['nueva', 'en_preparacion'])
      .lte('updated_at', fortyEightHoursAgo.toISOString())

    const staleOrders = (staleRaw ?? []).map((o) => ({
      number: o.number,
      status: o.status,
      hoursOld: Math.floor((now.getTime() - new Date(o.updated_at).getTime()) / 3600000),
    }))

    const html = await render(
      WeeklySummaryEmail({
        siteName: config.site_name,
        weekLabel,
        totalOrders,
        totalRevenue,
        topProducts,
        staleOrders,
        adminUrl: appUrl,
      }),
    )

    const { error } = await resend.emails.send({
      from: `${config.site_name} <${FROM_EMAIL}>`,
      to: config.contact_email,
      subject: `Resumen semanal — ${totalOrders} órdenes — ${config.site_name}`,
      html,
    })

    if (error) {
      console.error('[sendWeeklySummary] Resend error:', error)
      return { sent: false, error: error.message }
    }

    return { sent: true }
  } catch (err) {
    console.error('[sendWeeklySummary] Error inesperado:', err)
    return { sent: false, error: String(err) }
  }
}
