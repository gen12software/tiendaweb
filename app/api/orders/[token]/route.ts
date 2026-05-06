import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const email = req.nextUrl.searchParams.get('email')

  if (!token || !email) {
    return NextResponse.json({ error: 'Parámetros requeridos' }, { status: 400 })
  }

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select(`
      id, number, status, email, subtotal, shipping_total, total,
      shipping_address, tracking_number, created_at, updated_at,
      shipping_methods(id, name, price, estimated_days),
      order_items(id, quantity, unit_price, total_price, snapshot)
    `)
    .eq('public_token', token)
    .eq('email', email)
    .single()

  if (!order) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
  }

  return NextResponse.json({ order })
}
