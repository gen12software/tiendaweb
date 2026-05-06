import { createClient } from '@/lib/supabase/server'
import { getSiteConfig } from '@/lib/site-config'
import Link from 'next/link'
import Image from 'next/image'
import ProductCard from '@/components/products/product-card'

export default async function HomePage() {
  const supabase = await createClient()
  const config = await getSiteConfig()

  const [
    { data: featuredProducts },
    { data: categories },
  ] = await Promise.all([
    supabase
      .from('products')
      .select('*, product_images(id, url, sort_order), product_variants(id, name, options, price_modifier, stock, sku)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('sort_order')
      .limit(8),
    supabase
      .from('categories')
      .select('id, name, slug, image_url')
      .eq('is_active', true)
      .order('sort_order')
      .limit(6),
  ])

  const showFeatured = config.home_show_featured !== 'false'
  const showCategories = config.home_show_categories !== 'false'
  const showCTA = config.home_show_cta !== 'false'

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundColor: 'var(--theme-surface, #f9fafb)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
                {config.hero_title}
              </h1>
              {config.hero_description && (
                <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                  {config.hero_description}
                </p>
              )}
              <Link
                href={config.hero_cta_url}
                className="inline-block px-8 py-3 rounded-xl text-white font-semibold text-base shadow-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {config.hero_cta_text}
              </Link>
            </div>

            {config.hero_image_url && (
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src={config.hero_image_url}
                  alt={config.hero_title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categorías */}
      {showCategories && categories && categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-2xl font-bold mb-6">Categorías</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="group flex flex-col items-center gap-2 p-3 rounded-xl border hover:border-primary hover:bg-muted/40 transition-all text-center"
              >
                {cat.image_url ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted">
                    <Image src={cat.image_url} alt={cat.name} fill className="object-cover" sizes="64px" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl">🏷️</div>
                )}
                <span className="text-sm font-medium group-hover:text-primary transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Productos destacados */}
      {showFeatured && featuredProducts && featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Productos destacados</h2>
            <Link href="/productos" className="text-sm font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p as any} currencySymbol={config.currency_symbol} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      {showCTA && (config.home_cta_title || config.home_cta_subtitle) && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="rounded-2xl p-10 text-center text-white space-y-4" style={{ backgroundColor: 'var(--color-primary)' }}>
            {config.home_cta_title && <h2 className="text-3xl font-bold">{config.home_cta_title}</h2>}
            {config.home_cta_subtitle && <p className="text-lg opacity-90 max-w-xl mx-auto">{config.home_cta_subtitle}</p>}
            <Link href={config.home_cta_link}
              className="inline-block mt-2 px-8 py-3 bg-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              style={{ color: 'var(--color-primary)' }}>
              Ver productos
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
