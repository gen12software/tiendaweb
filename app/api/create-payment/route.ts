import { NextResponse, type NextRequest } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const preference = await new Preference(mp).create({
    body: {
      items: [
        {
          id: plan.id,
          title: plan.name,
          unit_price: Number(plan.price),
          quantity: 1,
          currency_id: 'ARS',
        },
      ],
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
