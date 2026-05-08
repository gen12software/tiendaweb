import { NextResponse, type NextRequest } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { CartItem } from '@/lib/types/store'

export async function POST(request: NextRequest) {
  const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
  const supabase = await createClient()
  const body = await request.json().catch(() => null)
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')

  // ── Flujo tienda: contact + shipping + items ──
  if (body?.contact) {
    const { contact, shipping, billing_data, items, user_id } = body as {
      contact: { full_name: string; email: string; phone: string }
      shipping: { street: string; city: string; state: string; postal_code: string; country: string; shipping_method_id?: string }
      billing_data: Record<string, unknown>
      items: CartItem[]
      user_id: string | null
    }

    if (!items?.length) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 })
    }

    // Calcular precios desde la DB — nunca confiar en los precios del cliente
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const productIds = items.map((i) => i.productId)
    const variantIds = items.filter((i) => i.variantId).map((i) => i.variantId!)

    const [{ data: productRows }, { data: variantRows }, { data: shippingMethod }] = await Promise.all([
      supabaseAdmin.from('products').select('id, price, name').in('id', productIds),
      variantIds.length
        ? supabaseAdmin.from('product_variants').select('id, price_modifier').in('id', variantIds)
        : Promise.resolve({ data: [] }),
      shipping.shipping_method_id
        ? supabaseAdmin.from('shipping_methods').select('price').eq('id', shipping.shipping_method_id).single()
        : Promise.resolve({ data: null }),
    ])

    const productMap = new Map((productRows ?? []).map((p) => [p.id, { price: p.price as number, name: p.name as string }]))
    const variantMap = new Map((variantRows ?? []).map((v) => [v.id, v.price_modifier as number]))

    // Calcular totales server-side
    let subtotal = 0
    const verifiedItems = items.map((item) => {
      const product = productMap.get(item.productId)
      const basePrice = product?.price ?? 0
      const modifier = item.variantId ? (variantMap.get(item.variantId) ?? 0) : 0
      const unitPrice = basePrice + modifier
      subtotal += unitPrice * item.quantity
      return { ...item, price: unitPrice, name: product?.name ?? item.name }
    })

    const shippingTotal = shippingMethod?.price ?? 0
    const total = subtotal + shippingTotal

    const mpItems = verifiedItems.map((item) => ({
      id: item.productId,
      title: item.variantName ? `${item.name} - ${item.variantName}` : item.name,
      unit_price: Math.round(item.price * 100) / 100,
      quantity: Number(item.quantity),
      currency_id: 'ARS',
    }))

    if (mpItems.some((i) => i.unit_price <= 0)) {
      return NextResponse.json({ error: 'Precio inválido en uno o más productos' }, { status: 400 })
    }

    console.log('[create-payment] mpItems', JSON.stringify(mpItems))
    let preference
    try {
      preference = await new Preference(mp).create({
        body: {
        items: mpItems,
        payer: { email: contact.email },
        back_urls: {
          success: `${appUrl}/checkout/confirmacion`,
          failure: `${appUrl}/checkout/error`,
          pending: `${appUrl}/checkout/confirmacion`,
        },
        ...(appUrl.startsWith('https') ? { auto_return: 'approved' } : {}),
        notification_url: `${appUrl}/api/webhook`,
        metadata: {
          flow: 'store',
          contact,
          shipping,
          // Solo IDs y cantidades — precios se recalculan en el webhook desde la DB
          items: verifiedItems.map((i) => ({
            productId: i.productId,
            variantId: i.variantId ?? null,
            quantity: i.quantity,
            name: i.name,
            variantName: i.variantName ?? null,
            image: i.image ?? null,
          })),
          subtotal,
          shipping_total: shippingTotal,
          total,
          user_id: user_id ?? null,
          billing_data: billing_data ?? { same_as_shipping: true },
        },
      },
    })
    } catch (mpErr) {
      console.error('[create-payment] MP error', mpErr)
      return NextResponse.json({ error: 'Error al crear la preferencia de pago' }, { status: 500 })
    }

    const isSandbox = process.env.MP_ACCESS_TOKEN?.startsWith('TEST-')
    const redirectUrl = isSandbox
      ? (preference.sandbox_init_point ?? preference.init_point)
      : preference.init_point
    console.log('[create-payment] preference created', preference.id, isSandbox ? '(sandbox → sandbox_init_point)' : '(prod → init_point)', redirectUrl)
    return NextResponse.json({ init_point: redirectUrl, preference_id: preference.id })
  }

  // ── Flujo suscripciones: planId (original) ──
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const planId = body?.planId as string | undefined
  if (!planId) {
    return NextResponse.json({ error: 'plan_id requerido' }, { status: 400 })
  }

  const { data: plan } = await supabase
    .from('plans')
    .select('id, name, price, is_active')
    .eq('id', planId)
    .single()

  if (!plan || !plan.is_active) {
    return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
  }

  const preference = await new Preference(mp).create({
    body: {
      items: [{
        id: plan.id,
        title: plan.name,
        unit_price: Number(plan.price),
        quantity: 1,
        currency_id: 'ARS',
      }],
      back_urls: {
        success: `${appUrl}/payment/success`,
        failure: `${appUrl}/payment/failure`,
        pending: `${appUrl}/payment/pending`,
      },
      auto_return: 'approved',
      notification_url: `${appUrl}/api/webhook`,
      metadata: {
        user_id: user.id,
        plan_id: plan.id,
        flow: 'subscription',
      },
    },
  })

  const { error: insertError } = await supabase.from('payments').insert({
    user_id: user.id,
    plan_id: plan.id,
    amount: plan.price,
    status: 'pending',
    mp_preference_id: preference.id,
  })

  if (insertError) {
    console.error('Error insertando payment:', insertError)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }

  const isSandboxSub = process.env.MP_ACCESS_TOKEN?.startsWith('TEST-')
  const redirectUrlSub = isSandboxSub
    ? (preference.sandbox_init_point ?? preference.init_point)
    : preference.init_point
  return NextResponse.json({ init_point: redirectUrlSub })
}
