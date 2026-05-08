import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect, notFound } from 'next/navigation'
import { Metadata } from 'next'
import OrderDetail from '@/components/orders/order-detail'
import OrderAdminActions from './order-admin-actions'
import { OrderStatus } from '@/lib/types/store'

export const metadata: Metadata = { title: 'Admin — Detalle de orden' }

interface Props { params: Promise<{ id: string }> }

export default async function AdminOrdenDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/cuenta/ordenes')

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select(`
      id, number, status, email, subtotal, shipping_total, total, notes,
      admin_notes, tracking_number, shipping_address, billing_data, invoice_url, payment_method,
      cancellation_reason, cancellation_requested_at,
      created_at, updated_at,
      shipping_methods(id, name, price, estimated_days),
      order_items(id, quantity, unit_price, total_price, snapshot)
    `)
    .eq('id', id)
    .single()

  if (!order) notFound()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Orden #{order.number}</h1>
          <a href="/admin/ordenes" className="text-sm text-indigo-600 hover:underline">← Volver</a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrderDetail order={order as any} currencySymbol="$" />
          <OrderAdminActions order={order as any} />
        </div>

        {(order as any).cancellation_reason && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-2">
            <h2 className="text-sm font-semibold text-amber-800">Solicitud de arrepentimiento</h2>
            <p className="text-sm text-amber-700">
              <span className="font-medium">Fecha:</span>{' '}
              {new Date((order as any).cancellation_requested_at).toLocaleString('es-AR', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
            <p className="text-sm text-amber-700">
              <span className="font-medium">Motivo del cliente:</span>{' '}
              {(order as any).cancellation_reason}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
