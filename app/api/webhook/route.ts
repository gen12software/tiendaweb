import { NextResponse, type NextRequest } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'
import { sendPaymentConfirmationEmail } from '@/lib/email/send-payment-confirmation'

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)

    if (!body || body.type !== 'payment') {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const mpPayment = await new Payment(mp).get({ id: paymentId })
    const mpRaw = mpPayment as any
    const status = mpRaw.status as string | undefined
    const preferenceId = mpRaw.preference_id as string | undefined
    const metadata = mpRaw.metadata ?? {}
    const flow = metadata.flow as string | undefined
    const orderId = metadata.order_id as string | undefined
    const userId = metadata.user_id as string | undefined
    const planId = metadata.plan_id as string | undefined

    // ── Flujo tienda ──
    if (flow === 'store' || orderId) {
      if (!orderId) {
        console.error('Webhook tienda: order_id ausente en metadata', { paymentId })
        return NextResponse.json({ ok: true })
      }

      if (status === 'approved') {
        // Descontar stock con select for update via RPC o update directo
        // Obtener order items
        const { data: orderItems } = await supabaseAdmin
          .from('order_items')
          .select('variant_id, quantity')
          .eq('order_id', orderId)

        if (orderItems) {
          for (const item of orderItems) {
            if (item.variant_id) {
              await supabaseAdmin.rpc('decrement_variant_stock', {
                p_variant_id: item.variant_id,
                p_quantity: item.quantity,
              })
            }
          }
        }

        await supabaseAdmin
          .from('orders')
          .update({ status: 'nueva' })
          .eq('id', orderId)

        await supabaseAdmin
          .from('payments')
          .update({ status: 'approved', mp_payment_id: String(paymentId) })
          .eq('order_id', orderId)

        // Email de confirmación
        const { data: order } = await supabaseAdmin
          .from('orders')
          .select('email, number, total, shipping_address')
          .eq('id', orderId)
          .single()

        if (order) {
          const name = (order.shipping_address as any)?.full_name ?? ''
          try {
            await sendPaymentConfirmationEmail(
              order.email,
              name,
              `Orden #${order.number}`,
              Number(order.total),
              new Date(),
              String(paymentId),
            )
          } catch (emailErr) {
            console.error('Email error:', emailErr)
          }
        }
      } else if (status === 'rejected') {
        await supabaseAdmin
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId)

        await supabaseAdmin
          .from('payments')
          .update({ status: 'rejected', mp_payment_id: String(paymentId) })
          .eq('order_id', orderId)
      }

      return NextResponse.json({ ok: true })
    }

    // ── Flujo suscripciones (original) ──
    if (status === 'approved') {
      const query = supabaseAdmin
        .from('payments')
        .update({ status: 'approved', mp_payment_id: String(paymentId) })

      if (preferenceId) {
        await query.eq('mp_preference_id', preferenceId)
      } else {
        await query.eq('user_id', userId).eq('plan_id', planId).eq('status', 'pending')
      }

      if (userId && planId) {
        const { data: plan } = await supabaseAdmin
          .from('plans')
          .select('duration_days, name, price')
          .eq('id', planId)
          .single()

        if (plan) {
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + plan.duration_days)

          await supabaseAdmin
            .from('profiles')
            .update({ plan_id: planId, plan_expires_at: expiresAt.toISOString() })
            .eq('id', userId)

          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('full_name')
            .eq('id', userId)
            .single()

          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)

          if (authUser?.user?.email) {
            sendPaymentConfirmationEmail(
              authUser.user.email,
              profile?.full_name ?? '',
              plan.name,
              Number(plan.price),
              expiresAt,
              String(paymentId),
            )
          }
        }
      }
    } else if (status === 'rejected') {
      const query = supabaseAdmin
        .from('payments')
        .update({ status: 'rejected', mp_payment_id: String(paymentId) })

      if (preferenceId) {
        await query.eq('mp_preference_id', preferenceId)
      } else {
        await query.eq('user_id', userId).eq('plan_id', planId).eq('status', 'pending')
      }
    }
  } catch (err) {
    console.error('Webhook MP error:', err)
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
