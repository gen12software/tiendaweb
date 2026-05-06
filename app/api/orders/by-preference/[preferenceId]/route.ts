import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ preferenceId: string }> }
) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { preferenceId } = await params

  const { data: payment } = await supabaseAdmin
    .from('payments')
    .select('order_id')
    .eq('mp_preference_id', preferenceId)
    .single()

  if (!payment?.order_id) {
    return NextResponse.json({ order: null }, { status: 404 })
  }

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, number, status, email, total, public_token')
    .eq('id', payment.order_id)
    .single()

  return NextResponse.json({ order: order ?? null })
}
