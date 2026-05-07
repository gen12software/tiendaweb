'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { CartItem } from '@/lib/types/store'
import { sendOrderConfirmationEmail } from '@/lib/email/send-order-confirmation'
import { sendLowStockAlert, type LowStockItem } from '@/lib/email/send-low-stock-alert'

export interface ManualOrderInput {
  contact: { full_name: string; email: string; phone: string }
  shipping: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
    shipping_method_id?: string
  }
  billing_data: Record<string, unknown>
  items: CartItem[]
  user_id: string | null
  payment_method: 'transferencia' | 'efectivo'
}

export interface ManualOrderResult {
  success: boolean
  publicToken?: string
  orderNumber?: string
  orderId?: string
  error?: string
}

export async function createManualOrderAction(input: ManualOrderInput): Promise<ManualOrderResult> {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { contact, shipping, billing_data, items, user_id, payment_method } = input

  if (!items?.length) return { success: false, error: 'Carrito vacío' }

  // Verificar precios desde la DB — nunca confiar en los precios del cliente
  const productIds = items.map((i) => i.productId)
  const variantIds = items.filter((i) => i.variantId).map((i) => i.variantId!)

  const [{ data: productRows }, { data: variantRows }, { data: shippingMethod }] = await Promise.all([
    supabaseAdmin.from('products').select('id, price, name').in('id', productIds),
    variantIds.length
      ? supabaseAdmin.from('product_variants').select('id, price_modifier').in('id', variantIds)
      : Promise.resolve({ data: [] as { id: string; price_modifier: number }[] }),
    shipping.shipping_method_id
      ? supabaseAdmin.from('shipping_methods').select('price').eq('id', shipping.shipping_method_id).single()
      : Promise.resolve({ data: null }),
  ])

  const productMap = new Map((productRows ?? []).map((p) => [p.id, { price: p.price as number, name: p.name as string }]))
  const variantMap = new Map((variantRows ?? []).map((v) => [v.id, v.price_modifier as number]))

  let subtotal = 0
  const verifiedItems = items.map((item) => {
    const product = productMap.get(item.productId)
    const basePrice = product?.price ?? 0
    const modifier = item.variantId ? (variantMap.get(item.variantId) ?? 0) : 0
    const unitPrice = basePrice + modifier
    subtotal += unitPrice * item.quantity
    return { ...item, price: unitPrice, name: product?.name ?? item.name }
  })

  const shippingTotal = (shippingMethod as { price?: number } | null)?.price ?? 0
  const total = subtotal + shippingTotal

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

  // Crear la orden
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      status: 'pago_pendiente',
      payment_method,
      email: contact.email,
      user_id: user_id ?? null,
      subtotal,
      shipping_total: shippingTotal,
      total,
      shipping_address: shippingAddress,
      shipping_method_id: shipping.shipping_method_id || null,
      billing_data: billing_data ?? { same_as_shipping: true },
    })
    .select('id, number, public_token')
    .single()

  if (orderError || !order) {
    console.error('[createManualOrderAction] error creando orden', orderError)
    return { success: false, error: 'Error al crear el pedido. Intentá de nuevo.' }
  }

  // Crear order_items
  const orderItems = verifiedItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    variant_id: item.variantId ?? null,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity,
    snapshot: { name: item.name, variant_name: item.variantName, image: item.image },
  }))

  await supabaseAdmin.from('order_items').insert(orderItems)

  // Descontar stock
  const decrementedVariantIds: string[] = []
  for (const item of verifiedItems) {
    if (item.variantId) {
      const { error: stockError } = await supabaseAdmin.rpc('decrement_variant_stock', {
        p_variant_id: item.variantId,
        p_quantity: item.quantity,
      })
      if (stockError) {
        console.error('[createManualOrderAction] error descontando stock', { variantId: item.variantId, error: stockError })
      } else {
        decrementedVariantIds.push(item.variantId)
      }
    }
  }

  // Alerta de stock bajo
  if (decrementedVariantIds.length > 0) {
    const threshold = 5
    const { data: lowStockVariants } = await supabaseAdmin
      .from('product_variants')
      .select('id, sku, stock, products(name)')
      .in('id', decrementedVariantIds)
      .lte('stock', threshold)

    if (lowStockVariants && lowStockVariants.length > 0) {
      const alertItems: LowStockItem[] = lowStockVariants.map((v) => {
        const product = (Array.isArray(v.products) ? v.products[0] : v.products) as { name: string } | null
        return { variantId: v.id, productName: product?.name ?? 'Producto', sku: v.sku ?? undefined, stock: v.stock }
      })
      sendLowStockAlert(supabaseAdmin, alertItems, threshold).catch((err) =>
        console.error('[createManualOrderAction] low stock alert failed', err)
      )
    }
  }

  // Email de confirmación
  const addrStr = [shipping.street, shipping.city, shipping.state, shipping.postal_code]
    .filter(Boolean).join(', ')
  const emailItems = verifiedItems.map((item) => ({
    name: item.variantName ? `${item.name} - ${item.variantName}` : item.name,
    quantity: item.quantity,
    unit_price: item.price,
  }))

  sendOrderConfirmationEmail({
    email: contact.email,
    fullName: contact.full_name,
    orderNumber: order.number,
    orderId: order.id,
    publicToken: order.public_token,
    items: emailItems,
    total,
    shippingTotal,
    shippingAddress: addrStr,
  }).catch((err) => console.error('[createManualOrderAction] email error', err))

  return { success: true, publicToken: order.public_token, orderNumber: order.number, orderId: order.id }
}
