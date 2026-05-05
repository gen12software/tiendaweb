import { NextResponse, type NextRequest } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

// Cliente admin con service role — omite RLS
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

    // Consulta el estado real del pago a la API de MP
    const mpPayment = await new Payment(mp).get({ id: paymentId })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mpPaymentRaw = mpPayment as any
    const status = mpPaymentRaw.status as string | undefined
    const preferenceId = mpPaymentRaw.preference_id as string | undefined
    const userId = mpPaymentRaw.metadata?.user_id as string | undefined
    const planId = mpPaymentRaw.metadata?.plan_id as string | undefined

    if (!preferenceId && !userId) {
      console.error('Webhook MP: no se pudo identificar el pago', { paymentId, body })
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    if (status === 'approved') {
      // Buscar el registro de payments por preference_id o por user+plan
      const query = supabaseAdmin
        .from('payments')
        .update({ status: 'approved', mp_payment_id: String(paymentId) })

      if (preferenceId) {
        await query.eq('mp_preference_id', preferenceId)
      } else {
        await query.eq('user_id', userId).eq('plan_id', planId).eq('status', 'pending')
      }

      // Obtener duration_days del plan para calcular expiración
      if (userId && planId) {
        const { data: plan } = await supabaseAdmin
          .from('plans')
          .select('duration_days')
          .eq('id', planId)
          .single()

        if (plan) {
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + plan.duration_days)

          await supabaseAdmin
            .from('profiles')
            .update({ plan_id: planId, plan_expires_at: expiresAt.toISOString() })
            .eq('id', userId)
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
    // Loguear pero siempre responder 200 para que MP no reintente indefinidamente
    console.error('Webhook MP error:', err)
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
