'use client'

import { useCart } from './cart-context'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, updateQty, removeItem, count } = useCart()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Carrito ({count})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 text-muted-foreground px-6">
            <ShoppingBag className="w-14 h-14 opacity-15" />
            <div className="text-center">
              <p className="font-heading font-semibold text-foreground">Tu carrito está vacío</p>
              <p className="text-sm text-muted-foreground mt-1">Agregá productos para comenzar</p>
            </div>
            <Link
              href="/productos"
              onClick={closeCart}
              className="px-6 py-2.5 rounded-full text-sm font-semibold bg-foreground text-background hover:opacity-85 transition-opacity"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {items.map((item) => {
                const key = `${item.productId}::${item.variantId ?? 'base'}`
                return (
                  <div key={key} className="flex gap-4 py-4 px-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-snug line-clamp-2">{item.name}</p>
                      {item.variantName && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.variantName}</p>
                      )}
                      <p className="font-heading font-bold text-base mt-1">
                        ${(item.price * item.quantity).toLocaleString('es-AR')}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)}
                          className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm w-7 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)}
                          className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="ml-auto w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t px-4 pt-4 pb-4 space-y-3 bg-background">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-heading font-bold text-xl">${subtotal.toLocaleString('es-AR')}</span>
              </div>
              <p className="text-xs text-muted-foreground">Envío calculado al finalizar</p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex w-full items-center justify-center py-3.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-85"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Finalizar compra
              </Link>
              <button
                onClick={closeCart}
                className="w-full py-3 rounded-full text-sm font-medium border border-border hover:bg-muted transition-colors"
              >
                Seguir comprando
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
