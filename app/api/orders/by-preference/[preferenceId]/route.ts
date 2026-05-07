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

  if (!email) {
    return NextResponse.json({ order: null }, { status: 404 })
  }

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
    .eq('email', email)
    .single()

  return NextResponse.json({ order: order ?? null })
}
