import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getSiteConfig } from '@/lib/site-config'

const ORDER_SELECT = 'id, number, status, email, payment_method, subtotal, shipping_total, total, public_token, shipping_address, order_items(id, quantity, unit_price, total_price, snapshot)'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { token } = await params

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(ORDER_SELECT)
    .eq('public_token', token)
    .single()

  if (error || !order) {
    return NextResponse.json({ order: null }, { status: 404 })
  }

  // Si es transferencia, incluir los datos bancarios para mostrar en la confirmación
  let transferData = null
  if (order.payment_method === 'transferencia') {
    const config = await getSiteConfig()
    transferData = {
      cbu: config.transfer_cbu,
      alias: config.transfer_alias,
      message: config.transfer_message,
    }
  }

  return NextResponse.json({ order, transferData })
}
