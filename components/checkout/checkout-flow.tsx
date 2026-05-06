'use client'

import { useState } from 'react'
import { useCart } from '@/components/cart/cart-context'
import { ShippingMethod } from '@/lib/types/store'
import ContactStep from './contact-step'
import ShippingStep from './shipping-step'
import PaymentStep from './payment-step'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export interface ContactData {
  full_name: string
  email: string
  phone: string
}

export interface ShippingData {
  street: string
  city: string
  state: string
  postal_code: string
  country: string
  shipping_method_id?: string
}

interface Props {
  user: { id: string; email: string } | null
  shippingMethods: ShippingMethod[]
  savedAddress: Record<string, string> | null
  freeShippingThreshold: number | null
  currencySymbol: string
}

const STEPS = ['Contacto', 'Envío', 'Pago']

export default function CheckoutFlow({ user, shippingMethods, savedAddress, freeShippingThreshold, currencySymbol }: Props) {
  const [step, setStep] = useState(0)
  const [contact, setContact] = useState<ContactData | null>(null)
  const [shipping, setShipping] = useState<ShippingData | null>(null)
  const [loading, setLoading] = useState(false)
  const { items, subtotal, clearCart } = useCart()
  const router = useRouter()

  const selectedMethod = shippingMethods.find((m) => m.id === shipping?.shipping_method_id)
  const shippingTotal = freeShippingThreshold && subtotal >= freeShippingThreshold ? 0 : (selectedMethod?.price ?? 0)
  const total = subtotal + shippingTotal

  async function handlePay() {
    if (!contact || !shipping) return
    setLoading(true)
    try {
      const mpRes = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact,
          shipping,
          items,
          subtotal,
          shipping_total: shippingTotal,
          total,
          user_id: user?.id ?? null,
        }),
      })
      const mpData = await mpRes.json()
      if (!mpRes.ok) throw new Error(mpData.error ?? 'Error al iniciar el pago')

      if (mpData.preference_id) {
        sessionStorage.setItem('mp_preference_id', mpData.preference_id)
      }
      clearCart()
      window.location.href = mpData.init_point
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="mb-4">Tu carrito está vacío.</p>
        <a href="/productos" className="underline">Ver productos</a>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border-2 transition-colors ${
                i < step ? 'bg-green-500 border-green-500 text-white'
                : i === step ? 'border-current text-foreground'
                : 'border-muted text-muted-foreground'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`ml-2 text-sm font-medium ${i === step ? '' : 'text-muted-foreground'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-green-500' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <ContactStep
            user={user}
            onNext={(data) => { setContact(data); setStep(1) }}
          />
        )}
        {step === 1 && (
          <ShippingStep
            savedAddress={savedAddress}
            shippingMethods={shippingMethods}
            subtotal={subtotal}
            freeShippingThreshold={freeShippingThreshold}
            currencySymbol={currencySymbol}
            onBack={() => setStep(0)}
            onNext={(data) => { setShipping(data); setStep(2) }}
          />
        )}
        {step === 2 && (
          <PaymentStep
            contact={contact!}
            shipping={shipping!}
            selectedMethod={selectedMethod ?? null}
            subtotal={subtotal}
            shippingTotal={shippingTotal}
            total={total}
            currencySymbol={currencySymbol}
            loading={loading}
            onBack={() => setStep(1)}
            onPay={handlePay}
          />
        )}
      </div>

      {/* Resumen lateral */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="border rounded-xl p-4 space-y-3 bg-card">
          <p className="font-semibold text-sm">Resumen</p>
          <div className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={`${item.productId}::${item.variantId}`} className="flex justify-between gap-2">
                <span className="text-muted-foreground truncate">
                  {item.name}{item.variantName ? ` · ${item.variantName}` : ''} ×{item.quantity}
                </span>
                <span className="shrink-0">{currencySymbol}{(item.price * item.quantity).toLocaleString('es-AR')}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{currencySymbol}{subtotal.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span>{shippingTotal === 0 ? 'Gratis' : `${currencySymbol}${shippingTotal.toLocaleString('es-AR')}`}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1 border-t">
              <span>Total</span>
              <span>{currencySymbol}{total.toLocaleString('es-AR')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
