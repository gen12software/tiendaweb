import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

interface Params { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await request.formData().catch(() => null)
  const file = formData?.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })
  if (file.type !== 'application/pdf') return NextResponse.json({ error: 'Solo se aceptan archivos PDF' }, { status: 400 })

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: order } = await supabaseAdmin.from('orders').select('id, email').eq('id', id).single()
  if (!order) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })

  const storagePath = `${id}/factura.pdf`
  const arrayBuffer = await file.arrayBuffer()

  const { error: uploadError } = await supabaseAdmin.storage
    .from('invoices')
    .upload(storagePath, arrayBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadError) {
    console.error('[invoice] upload error:', uploadError)
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 })
  }

  const { data: signedData, error: signError } = await supabaseAdmin.storage
    .from('invoices')
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365)

  if (signError || !signedData?.signedUrl) {
    console.error('[invoice] sign error:', signError)
    return NextResponse.json({ error: 'Error al generar URL' }, { status: 500 })
  }

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ invoice_url: signedData.signedUrl })
    .eq('id', id)

  if (updateError) {
    console.error('[invoice] update error:', updateError)
    return NextResponse.json({ error: 'Error al actualizar la orden' }, { status: 500 })
  }

  return NextResponse.json({ invoice_url: signedData.signedUrl })
}
