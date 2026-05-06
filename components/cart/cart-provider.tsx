'use client'

import CartProvider from './cart-context'
import CartDrawer from './cart-drawer'

export default function CartProviderWithDrawer({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  )
}
