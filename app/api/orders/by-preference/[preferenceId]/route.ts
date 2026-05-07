import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ORDER_SELECT = 'id, number, status, email, subtotal, shipping_total, total, public_token, shipping_address, order_items(id, quantity, unit_price, total_price, snapshot)'

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
  const paymentId = req.nextUrl.searchParams.get('payment_id')

  // Try by preference_id first
  let query = supabaseAdmin
    .from('orders')
    .select(ORDER_SELECT)
    .eq('mp_preference_id', preferenceId)

  if (email) query = query.eq('email', email)

  const { data: order, error } = await query.single()

  if (order) return NextResponse.json({ order })

  // Fallback: search by payment_id (handles case where mp_preference_id is null)
  if (paymentId) {
    let fallbackQuery = supabaseAdmin
      .from('orders')
      .select(ORDER_SELECT)
      .eq('mp_payment_id', paymentId)

    if (email) fallbackQuery = fallbackQuery.eq('email', email)

    const { data: orderByPayment, error: fallbackError } = await fallbackQuery.single()

    if (orderByPayment) return NextResponse.json({ order: orderByPayment })

    console.error('[by-preference] order not found by preference or payment', { preferenceId, paymentId, error, fallbackError })
    return NextResponse.json({ order: null }, { status: 404 })
  }

  console.error('[by-preference] order not found', { preferenceId, error })
  return NextResponse.json({ order: null }, { status: 404 })
}
