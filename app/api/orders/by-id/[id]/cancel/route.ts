import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { sendCancellationConfirmationEmail } from '@/lib/email/send-cancellation-confirmation'

const CANCELLATION_WINDOW_DAYS = 10

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Authorize: public token OR authenticated user who owns the order
  const publicToken = req.headers.get('x-order-token')
  let authorized = false

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, number, email, status, created_at, public_token, total, payment_method, order_items(quantity, unit_price, snapshot)')
    .eq('id', id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
  }

  if (publicToken && publicToken === order.public_token) {
    authorized = true
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: userOrder } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()
      if (userOrder) authorized = true
    }
  }

  if (!authorized) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Validate: not already cancelled
  if (order.status === 'arrepentimiento_solicitado' || order.status === 'cancelado') {
    return NextResponse.json({ error: 'La orden ya tiene una cancelación en proceso' }, { status: 409 })
  }

  // Validate: within 10-day window
  const orderDate = new Date(order.created_at)
  const now = new Date()
  const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays > CANCELLATION_WINDOW_DAYS) {
    return NextResponse.json(
      { error: `El plazo de arrepentimiento de ${CANCELLATION_WINDOW_DAYS} días corridos ha vencido` },
      { status: 422 }
    )
  }

  // Parse body
  const body = await req.json().catch(() => ({}))
  const reason: string = (body.reason ?? '').trim()
  if (reason.length < 10) {
    return NextResponse.json({ error: 'El motivo debe tener al menos 10 caracteres' }, { status: 422 })
  }

  // Update order
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'arrepentimiento_solicitado',
      cancellation_reason: reason,
      cancellation_requested_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) {
    console.error('[cancel] update error:', updateError)
    return NextResponse.json({ error: 'Error al procesar la cancelación' }, { status: 500 })
  }

  // Send confirmation email to buyer (fire-and-forget)
  const items = (order.order_items ?? []).map((item: any) => ({
    name: item.snapshot?.name ?? 'Producto',
    quantity: item.quantity,
    unit_price: item.unit_price,
  }))
  sendCancellationConfirmationEmail({
    orderId: order.id,
    orderNumber: order.number,
    buyerEmail: order.email,
    reason,
    total: order.total,
    items,
  }).catch((err) => console.error('[cancel] email error:', err))

  return NextResponse.json({ ok: true })
}
