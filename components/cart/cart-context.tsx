'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { CartItem } from '@/lib/types/store'

interface CartContextValue {
  items: CartItem[]
  count: number
  subtotal: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: CartItem) => void
  removeItem: (productId: string, variantId: string | null) => void
  updateQty: (productId: string, variantId: string | null, qty: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'tienda_cart'

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function itemKey(productId: string, variantId: string | null) {
  return `${productId}::${variantId ?? 'base'}`
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setItems(loadCart())
  }, [])

  useEffect(() => {
    saveCart(items)
  }, [items])

  const addItem = useCallback((incoming: CartItem) => {
    setItems((prev) => {
      const key = itemKey(incoming.productId, incoming.variantId)
      const existing = prev.find(
        (i) => itemKey(i.productId, i.variantId) === key
      )
      if (existing) {
        const newQty = Math.min(existing.quantity + incoming.quantity, incoming.stock)
        return prev.map((i) =>
          itemKey(i.productId, i.variantId) === key ? { ...i, quantity: newQty } : i
        )
      }
      return [...prev, incoming]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((productId: string, variantId: string | null) => {
    const key = itemKey(productId, variantId)
    setItems((prev) => prev.filter((i) => itemKey(i.productId, i.variantId) !== key))
  }, [])

  const updateQty = useCallback(
    (productId: string, variantId: string | null, qty: number) => {
      const key = itemKey(productId, variantId)
      if (qty <= 0) {
        setItems((prev) => prev.filter((i) => itemKey(i.productId, i.variantId) !== key))
      } else {
        setItems((prev) =>
          prev.map((i) =>
            itemKey(i.productId, i.variantId) === key
              ? { ...i, quantity: Math.min(qty, i.stock) }
              : i
          )
        )
      }
    },
    []
  )

  const clearCart = useCallback(() => setItems([]), [])

  const count = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        removeItem,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
