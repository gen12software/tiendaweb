import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteConfig } from '@/lib/site-config'
import CheckoutFlow from '@/components/checkout/checkout-flow'
import { getEnabledPaymentMethods } from '@/lib/payment-methods'

export const metadata: Metadata = { title: 'Checkout' }

export default async function CheckoutPage() {
  const supabase = await createClient()
  const config = await getSiteConfig()
  const { data: { user } } = await supabase.auth.getUser()

  const [shippingResult, paymentMethodsConfig] = await Promise.all([
    supabase.from('shipping_methods').select('*').eq('is_active', true).order('price'),
    getEnabledPaymentMethods(),
  ])

  let savedAddress = null
  if (user) {
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .single()
    savedAddress = data
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Finalizar compra</h1>
      <CheckoutFlow
        user={user ? { id: user.id, email: user.email ?? '' } : null}
        shippingMethods={shippingResult.data ?? []}
        savedAddress={savedAddress?.address ?? null}
        freeShippingThreshold={config.free_shipping_threshold ? parseFloat(config.free_shipping_threshold) : null}
        currencySymbol={config.currency_symbol}
        paymentMethods={paymentMethodsConfig.methods}
      />
    </div>
  )
}
