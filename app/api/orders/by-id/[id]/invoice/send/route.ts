import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendInvoiceEmail } from '@/lib/email/send-invoice'

interface Params { params: Promise<{ id: string }> }

export async function POST(_request: NextRequest, { params }: Params) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, number, email, invoice_url, shipping_address')
    .eq('id', id)
    .single()

  if (!order) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
  if (!order.invoice_url) return NextResponse.json({ error: 'No hay factura cargada para esta orden' }, { status: 400 })

  const shippingAddress = order.shipping_address as { full_name?: string } | null
  const fullName = shippingAddress?.full_name ?? ''

  const storagePath = `${id}/factura.pdf`
  const { data: signedData } = await supabaseAdmin.storage
    .from('invoices')
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365)

  const invoiceUrl = signedData?.signedUrl ?? order.invoice_url

  try {
    await sendInvoiceEmail({
      orderId: order.id,
      orderNumber: order.number,
      email: order.email,
      fullName,
      invoiceUrl,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Error al enviar el email' }, { status: 500 })
  }

  if (signedData?.signedUrl) {
    await supabaseAdmin.from('orders').update({ invoice_url: signedData.signedUrl }).eq('id', id)
  }

  return NextResponse.json({ ok: true })
}
