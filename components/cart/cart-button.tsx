'use client'

import { ShoppingCart } from 'lucide-react'
import { useCart } from './cart-context'

export default function CartButton() {
  const { count, openCart } = useCart()
  return (
    <button
      onClick={openCart}
      className="relative p-2 rounded-md hover:bg-muted transition-colors"
      aria-label="Abrir carrito"
    >
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 text-[10px] font-bold text-white rounded-full w-4 h-4 flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-primary)' }}>
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
