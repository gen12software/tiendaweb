import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { CartItem } from '@/lib/types/store'

export async function POST(req: NextRequest) {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  try {
    const body = await req.json()
    const { contact, shipping, items, subtotal, shipping_total, total, user_id } = body as {
      contact: { full_name: string; email: string; phone: string }
      shipping: {
        street: string; city: string; state: string
        postal_code: string; country: string; shipping_method_id?: string
      }
      items: CartItem[]
      subtotal: number
      shipping_total: number
      total: number
      user_id: string | null
    }

    if (!items?.length) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 })
    }

    const resolvedUserId = user_id ?? null

    const shippingAddress = {
      full_name: contact.full_name,
      email: contact.email,
      phone: contact.phone,
      street: shipping.street,
      city: shipping.city,
      state: shipping.state,
      postal_code: shipping.postal_code,
      country: shipping.country,
    }

    // Crear orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        status: 'payment_pending',
        email: contact.email,
        user_id: resolvedUserId,
        subtotal,
        shipping_total,
        total,
        shipping_address: shippingAddress,
        shipping_method_id: shipping.shipping_method_id || null,
      })
      .select('id, number, public_token')
      .single()

    if (orderError || !order) {
      console.error('Order error:', orderError)
      return NextResponse.json({ error: 'Error al crear la orden' }, { status: 500 })
    }

    // Crear order_items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      snapshot: {
        name: item.name,
        variant_name: item.variantName,
        image: item.image,
      },
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) {
      console.error('Order items error:', itemsError)
    }

    return NextResponse.json({ order_id: order.id, order_number: order.number, public_token: order.public_token })
  } catch (err) {
    console.error('Orders API error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
