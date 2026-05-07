import { NextResponse, type NextRequest } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'
import { sendPaymentConfirmationEmail } from '@/lib/email/send-payment-confirmation'
import { sendOrderConfirmationEmail } from '@/lib/email/send-order-confirmation'
import { sendLowStockAlert, type LowStockItem } from '@/lib/email/send-low-stock-alert'
import crypto from 'crypto'

function verifyMpSignature(request: NextRequest, rawBody: string): boolean {
  const secret = process.env.WEBHOOK_SECRET
  if (!secret) return false

  const xSignature = request.headers.get('x-signature')
  const xRequestId = request.headers.get('x-request-id')
  if (!xSignature || !xRequestId) return false

  // MP signature format: ts=<timestamp>,v1=<hash>
  const parts = Object.fromEntries(xSignature.split(',').map((p) => p.split('=')))
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  // data.id is the payment ID from the webhook body
  let dataId: string | undefined
  try {
    const parsed = JSON.parse(rawBody)
    dataId = String((parsed?.data as Record<string, unknown>)?.id ?? '')
  } catch {
    return false
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected))
}

export async function POST(request: NextRequest) {
  const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const rawBody = await request.text()
  if (process.env.WEBHOOK_SECRET && !verifyMpSignature(request, rawBody)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  try {
    if (!body || body.type !== 'payment') {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const paymentId = (body.data as Record<string, unknown>)?.id
    if (!paymentId) {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const mpPayment = await new Payment(mp).get({ id: String(paymentId) })
    const mpRaw = mpPayment as unknown as Record<string, unknown>
    const status = mpPayment.status
    const preferenceId = (mpRaw.preference_id as string | undefined) ?? undefined
    const metadata = (mpPayment.metadata ?? {}) as Record<string, unknown>
    const flow = metadata.flow as string | undefined
    const userId = metadata.user_id as string | undefined
    const planId = metadata.plan_id as string | undefined

    // ── Flujo tienda ──
    if (flow === 'store') {
      if (status !== 'approved') return NextResponse.json({ ok: true })

      // MP snake_casea las keys anidadas de metadata
      const contactRaw = metadata.contact as Record<string, unknown> | undefined
      const contact = contactRaw ? {
        full_name: (contactRaw.full_name) as string,
        email: (contactRaw.email) as string,
        phone: (contactRaw.phone) as string,
      } : undefined
      const shippingRaw = metadata.shipping as Record<string, unknown> | undefined
      const shipping = shippingRaw ? {
        street: (shippingRaw.street) as string,
        city: (shippingRaw.city) as string,
        state: (shippingRaw.state) as string,
        postal_code: (shippingRaw.postal_code) as string,
        country: (shippingRaw.country) as string,
        shipping_method_id: (shippingRaw.shipping_method_id) as string | undefined,
      } : undefined
      // MP convierte camelCase → snake_case en metadata al almacenar
      const rawItems = metadata.items as Array<Record<string, unknown>> | undefined
      const items = rawItems?.map((i) => ({
        productId: (i.product_id ?? i.productId) as string,
        variantId: (i.variant_id ?? i.variantId) as string | undefined,
        quantity: Number(i.quantity),
        name: (i.name) as string,
        variantName: (i.variant_name ?? i.variantName) as string | undefined,
        image: (i.image) as string | undefined,
      }))
      const shippingTotal = Number(metadata.shipping_total)
      const orderUserId = (metadata.user_id as string | undefined) ?? null
      const billingData = (metadata.billing_data as Record<string, unknown> | undefined) ?? { same_as_shipping: true }

      if (!contact || !items?.length || !shipping) {
        console.error('Webhook tienda: metadata incompleta', { paymentId, contact: !!contact, items: items?.length, shipping: !!shipping })
        return NextResponse.json({ ok: true })
      }

      // Recalcular precios desde la DB — ignorar los precios de metadata
      const variantIds = items.filter((i) => i.variantId).map((i) => i.variantId!)
      const productIds = items.map((i) => i.productId)

      const [{ data: variantRows }, { data: productRows }] = await Promise.all([
        supabaseAdmin.from('product_variants').select('id, price_modifier').in('id', variantIds),
        supabaseAdmin.from('products').select('id, price').in('id', productIds),
      ])

      const variantMap = new Map((variantRows ?? []).map((v) => [v.id, v.price_modifier as number]))
      const productMap = new Map((productRows ?? []).map((p) => [p.id, p.price as number]))

      let recalcSubtotal = 0
      const verifiedItems = items.map((item) => {
        const basePrice = productMap.get(item.productId) ?? 0
        const modifier = item.variantId ? (variantMap.get(item.variantId) ?? 0) : 0
        const unitPrice = basePrice + modifier
        recalcSubtotal += unitPrice * item.quantity
        return { ...item, price: unitPrice }
      })

      const verifiedTotal = recalcSubtotal + shippingTotal

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
          subtotal: recalcSubtotal,
          shipping_total: shippingTotal,
          total: verifiedTotal,
          shipping_address: shippingAddress,
          shipping_method_id: shipping.shipping_method_id || null,
          billing_data: billingData,
        })
        .select('id, number, public_token')
        .single()

      if (orderError || !order) {
        console.error('Webhook: error creando orden', orderError)
        return NextResponse.json({ ok: true })
      }

      // Crear order_items y descontar stock
      const orderItems = verifiedItems.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId ?? null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        snapshot: { name: item.name, variant_name: item.variantName, image: item.image },
      }))

      await supabaseAdmin.from('order_items').insert(orderItems)

      const decrementedVariantIds: string[] = []
      for (const item of verifiedItems) {
        if (item.variantId) {
          const { error: stockError } = await supabaseAdmin.rpc('decrement_variant_stock', {
            p_variant_id: item.variantId,
            p_quantity: item.quantity,
          })
          if (stockError) {
            console.error('Webhook: error descontando stock', { variantId: item.variantId, error: stockError })
          } else {
            decrementedVariantIds.push(item.variantId)
          }
        }
      }

      // Aviso de stock bajo si alguna variante quedó por debajo del umbral
      if (decrementedVariantIds.length > 0) {
        const threshold = 5 // default; se podría leer de site_config si se quiere dinámico
        const { data: lowStockVariants } = await supabaseAdmin
          .from('product_variants')
          .select('id, sku, stock, products(name)')
          .in('id', decrementedVariantIds)
          .lte('stock', threshold)

        if (lowStockVariants && lowStockVariants.length > 0) {
          const alertItems: LowStockItem[] = lowStockVariants.map((v) => {
            const product = (Array.isArray(v.products) ? v.products[0] : v.products) as { name: string } | null
            return {
              variantId: v.id,
              productName: product?.name ?? 'Producto',
              sku: v.sku ?? undefined,
              stock: v.stock,
            }
          })
          sendLowStockAlert(supabaseAdmin, alertItems, threshold).catch((err) =>
            console.error('[email] low stock alert failed', err),
          )
        }
      }

      // Registrar pago
      await supabaseAdmin.from('payments').insert({
        order_id: order.id,
        user_id: orderUserId,
        amount: verifiedTotal,
        status: 'approved',
        mp_payment_id: String(paymentId),
        mp_preference_id: preferenceId ?? null,
      })

      // Email de confirmación
      const addrStr = [shipping.street, shipping.city, shipping.state, shipping.postal_code]
        .filter(Boolean).join(', ')
      const emailItems = verifiedItems.map((item) => ({
        name: item.variantName ? `${item.name} - ${item.variantName}` : item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }))
      try {
        await sendOrderConfirmationEmail({
          email: contact.email,
          fullName: contact.full_name,
          orderNumber: order.number,
          orderId: order.id,
          publicToken: order.public_token,
          items: emailItems,
          total: verifiedTotal,
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
            try {
              await sendPaymentConfirmationEmail(
                authUser.user.email,
                profile?.full_name ?? '',
                plan.name,
                Number(plan.price),
                expiresAt,
                String(paymentId),
              )
            } catch (emailErr) {
              console.error('[email] confirmación suscripción falló', { userId, paymentId, email: authUser.user.email, err: emailErr })
            }
          } else {
            console.error('[email] no se pudo obtener email para confirmación de suscripción', { userId, paymentId })
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
