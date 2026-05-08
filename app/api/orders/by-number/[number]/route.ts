import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { number } = await params
  const email = req.nextUrl.searchParams.get('email')

  if (!number || !email) {
    return NextResponse.json({ error: 'Parámetros requeridos' }, { status: 400 })
  }

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select(`
      id, number, status, email, subtotal, shipping_total, total,
      shipping_address, tracking_number, billing_data, payment_method,
      public_token, cancellation_reason, cancellation_requested_at,
      created_at, updated_at,
      shipping_methods(id, name, price, estimated_days),
      order_items(id, quantity, unit_price, total_price, snapshot)
    `)
    .eq('number', number.replace(/^#/, '').toUpperCase())
    .eq('email', email)
    .single()

  if (!order) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
  }

  return NextResponse.json({ order })
}
