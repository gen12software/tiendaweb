'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/components/cart/cart-context'
import { Product } from '@/lib/types/store'
import { toast } from 'sonner'

interface Props {
  product: Product
  variantId?: string | null
  disabled?: boolean
}

export default function AddToCartButton({ product, variantId = null, disabled }: Props) {
  const { addItem } = useCart()
  const [loading, setLoading] = useState(false)

  const variant = variantId
    ? product.product_variants?.find((v) => v.id === variantId) ?? null
    : null

  const price = product.price + (variant?.price_modifier ?? 0)
  const stock = variant ? variant.stock : (product.product_variants?.reduce((s, v) => s + v.stock, 0) || 99)
  const image = product.product_images?.[0]?.url ?? null

  function handleAdd() {
    setLoading(true)
    addItem({
      productId: product.id,
      variantId,
      name: product.name,
      variantName: variant?.name ?? null,
      price,
      image,
      quantity: 1,
      stock,
    })
    toast.success(`${product.name} agregado al carrito`)
    setLoading(false)
  }

  return (
    <Button
      size="sm"
      className="w-full"
      onClick={handleAdd}
      disabled={disabled || loading}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      Agregar
    </Button>
  )
}
