import { NextResponse, type NextRequest } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'
import { CartItem } from '@/lib/types/store'

export async function POST(request: NextRequest) {
  const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
  const supabase = await createClient()
  const body = await request.json().catch(() => null)
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')

  // ── Flujo tienda: contact + shipping + items ──
  if (body?.contact) {
    const { contact, shipping, items, subtotal, shipping_total, total, user_id } = body as {
      contact: { full_name: string; email: string; phone: string }
      shipping: { street: string; city: string; state: string; postal_code: string; country: string; shipping_method_id?: string }
      items: CartItem[]
      subtotal: number
      shipping_total: number
      total: number
      user_id: string | null
    }

    const mpItems = items.map((item) => ({
      id: item.productId,
      title: item.variantName ? `${item.name} - ${item.variantName}` : item.name,
      unit_price: Number(item.price),
      quantity: Number(item.quantity),
      currency_id: 'ARS',
    }))

    const preference = await new Preference(mp).create({
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
          items,
          subtotal,
          shipping_total,
          total,
          user_id: user_id ?? null,
        },
      },
    })

    return NextResponse.json({ init_point: preference.init_point, preference_id: preference.id })
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

  return NextResponse.json({ init_point: preference.init_point })
}
