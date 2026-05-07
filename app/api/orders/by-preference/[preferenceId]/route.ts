import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ preferenceId: string }> }
) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { preferenceId } = await params
  const email = req.nextUrl.searchParams.get('email')?.toLowerCase().trim()

  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payments')
    .select('order_id, mp_preference_id')
    .eq('mp_preference_id', preferenceId)
    .single()

  if (!payment?.order_id) {
    console.error('[by-preference] payment not found', { preferenceId, paymentError })
    return NextResponse.json({ order: null }, { status: 404 })
  }

  let query = supabaseAdmin
    .from('orders')
    .select('id, number, status, email, subtotal, shipping_total, total, public_token, shipping_address, order_items(id, quantity, unit_price, total_price, snapshot)')
    .eq('id', payment.order_id)

  if (email) query = query.eq('email', email)

  const { data: order } = await query.single()

  return NextResponse.json({ order: order ?? null })
}
