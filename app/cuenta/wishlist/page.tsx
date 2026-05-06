import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import ProductCard from '@/components/products/product-card'
import { getSiteConfig } from '@/lib/site-config'

export const metadata: Metadata = { title: 'Mi wishlist' }

export default async function WishlistPage() {
  const supabase = await createClient()
  const config = await getSiteConfig()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: items } = await supabase
    .from('wishlist')
    .select('product_id, products(*, product_images(id, url, sort_order), product_variants(id, name, options, price_modifier, stock, sku))')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const products = items?.map((i) => i.products).filter(Boolean) ?? []

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Mi wishlist</h1>
      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tenés productos guardados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((p) => <ProductCard key={(p as any).id} product={p as any} currencySymbol={config.currency_symbol} />)}
        </div>
      )}
    </div>
  )
}
