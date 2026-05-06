'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/components/cart/cart-context'
import { Product, ProductVariant } from '@/lib/types/store'
import { toast } from 'sonner'
import WishlistButton from './wishlist-button'

interface Props {
  product: Product
  currencySymbol: string
}

export default function ProductDetail({ product, currencySymbol }: Props) {
  const variants = product.product_variants ?? []
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.length === 1 ? variants[0] : null
  )
  const { addItem } = useCart()

  const price = product.price + (selectedVariant?.price_modifier ?? 0)
  const stock = selectedVariant ? selectedVariant.stock : (variants.length === 0 ? 99 : 0)
  const outOfStock = variants.length > 0 && !selectedVariant
    ? false
    : stock === 0
  const lowStock = stock > 0 && stock <= 5

  function handleAddToCart() {
    const image = product.product_images?.[0]?.url ?? null
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      name: product.name,
      variantName: selectedVariant?.name ?? null,
      price,
      image,
      quantity: 1,
      stock,
    })
    toast.success('Producto agregado al carrito')
  }

  return (
    <div className="space-y-4">
      {/* Selector de variantes */}
      {variants.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {selectedVariant ? `Variante: ${selectedVariant.name}` : 'Seleccioná una variante'}
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v.id === selectedVariant?.id ? null : v)}
                disabled={v.stock === 0}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                  selectedVariant?.id === v.id
                    ? 'border-transparent text-white'
                    : v.stock === 0
                    ? 'opacity-40 cursor-not-allowed border-border'
                    : 'border-border hover:border-foreground'
                }`}
                style={selectedVariant?.id === v.id ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : {}}
              >
                {v.name}
                {v.stock === 0 && ' (sin stock)'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Indicadores de stock */}
      {selectedVariant && lowStock && (
        <Badge variant="outline" className="text-orange-600 border-orange-200">
          ¡Solo quedan {stock}!
        </Badge>
      )}
      {selectedVariant && outOfStock && (
        <Badge variant="outline" className="text-destructive border-destructive/30">
          Sin stock
        </Badge>
      )}

      {/* Precio con variante */}
      {selectedVariant && selectedVariant.price_modifier !== 0 && (
        <p className="text-2xl font-bold">
          {currencySymbol}{price.toLocaleString('es-AR')}
        </p>
      )}

      {/* Botones */}
      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={outOfStock || (variants.length > 0 && !selectedVariant)}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
        </Button>
        <WishlistButton productId={product.id} />
      </div>
    </div>
  )
}
