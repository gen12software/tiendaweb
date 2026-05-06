import { NextResponse, type NextRequest } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'
import { sendPaymentConfirmationEmail } from '@/lib/email/send-payment-confirmation'
import { sendOrderConfirmationEmail } from '@/lib/email/send-order-confirmation'

export async function POST(request: NextRequest) {
  const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
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
    const userId = metadata.user_id as string | undefined
    const planId = metadata.plan_id as string | undefined

    // ── Flujo tienda ──
    if (flow === 'store') {
      if (status !== 'approved') return NextResponse.json({ ok: true })

      const contact = metadata.contact as any
      const shipping = metadata.shipping as any
      const items = metadata.items as any[]
      const subtotal = Number(metadata.subtotal)
      const shippingTotal = Number(metadata.shipping_total)
      const total = Number(metadata.total)
      const orderUserId = metadata.user_id ?? null

      if (!contact || !items?.length) {
        console.error('Webhook tienda: metadata incompleta', { paymentId })
        return NextResponse.json({ ok: true })
      }

      const shippingAddress = {
        full_name: contact.full_name,
        email: contact.email,
        phone: contact.phone,
        street: shipping.street,
        city: shipping.city,
        state: shipping.state,
        postal_code: shipping.postal_code,
        country: shipping.country,
      }

      // Crear la orden
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          status: 'nueva',
          email: contact.email,
          user_id: orderUserId,
          subtotal,
          shipping_total: shippingTotal,
          total,
          shipping_address: shippingAddress,
          shipping_method_id: shipping.shipping_method_id || null,
        })
        .select('id, number, public_token')
        .single()

      if (orderError || !order) {
        console.error('Webhook: error creando orden', orderError)
        return NextResponse.json({ ok: true })
      }

      // Crear order_items y descontar stock
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId ?? null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        snapshot: { name: item.name, variant_name: item.variantName, image: item.image },
      }))

      await supabaseAdmin.from('order_items').insert(orderItems)

      for (const item of items) {
        if (item.variantId) {
          await supabaseAdmin.rpc('decrement_variant_stock', {
            p_variant_id: item.variantId,
            p_quantity: item.quantity,
          })
        }
      }

      // Registrar pago
      await supabaseAdmin.from('payments').insert({
        order_id: order.id,
        user_id: orderUserId,
        amount: total,
        status: 'approved',
        mp_payment_id: String(paymentId),
        mp_preference_id: preferenceId ?? null,
      })

      // Email de confirmación
      const addrStr = [shipping.street, shipping.city, shipping.state, shipping.postal_code]
        .filter(Boolean).join(', ')
      const emailItems = items.map((item: any) => ({
        name: item.variantName ? `${item.name} - ${item.variantName}` : item.name,
        quantity: item.quantity,
        unit_price: Number(item.price),
      }))
      try {
        await sendOrderConfirmationEmail({
          email: contact.email,
          fullName: contact.full_name,
          orderNumber: order.number,
          orderId: order.id,
          publicToken: order.public_token,
          items: emailItems,
          total,
          shippingTotal,
          shippingAddress: addrStr,
        })
      } catch (emailErr) {
        console.error('Email error:', emailErr)
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
