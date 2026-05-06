import { createClient } from '@/lib/supabase/server'
import { getSiteConfig } from '@/lib/site-config'
import Link from 'next/link'
import Image from 'next/image'
import ProductCard from '@/components/products/product-card'
import HeroCarousel from '@/components/home/hero-carousel'
import HomeSearch from '@/components/home/home-search'

export default async function HomePage() {
  const supabase = await createClient()
  const config = await getSiteConfig()

  const [
    { data: featuredProducts },
    { data: categories },
    { data: heroSlides },
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
    supabase
      .from('hero_slides')
      .select('id, image_url, title, subtitle, cta_text, cta_url')
      .eq('is_active', true)
      .order('sort_order'),
  ])

  const showFeatured = config.home_show_featured !== 'false'
  const showCategories = config.home_show_categories !== 'false'
  const showCTA = config.home_show_cta !== 'false'

  return (
    <div>
      <HeroCarousel
        slides={heroSlides ?? []}
        fallbackTitle={config.hero_title}
        fallbackSubtitle={config.hero_description}
        fallbackCtaText={config.hero_cta_text}
        fallbackCtaUrl={config.hero_cta_url}
        primaryColor={config.primary_color}
      />

      {/* Búsqueda */}
      <section className="px-4 sm:px-6 lg:px-8 pt-10">
        <div className="mx-auto max-w-7xl">
          <HomeSearch primaryColor={config.primary_color} />
        </div>
      </section>

      {/* Categorías */}
      {showCategories && categories && categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-12">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold tracking-tight">Categorías</h2>
            <Link
              href="/productos"
              className="text-sm font-medium hover:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              Ver todo →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-muted"
              >
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                  />
                ) : (
                  <Image
                    src="/placeholder-category.svg"
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-3 inset-x-0 text-center text-white text-sm font-semibold px-2 leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Productos destacados */}
      {showFeatured && featuredProducts && featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 pb-20">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-heading text-2xl font-bold tracking-tight">Destacados</h2>
            <Link
              href="/productos"
              className="text-sm font-medium hover:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p as any} currencySymbol={config.currency_symbol} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      {showCTA && (config.home_cta_title || config.home_cta_subtitle) && (
        <section
          className="px-8 py-16 sm:py-20 text-center text-white space-y-5"
          style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)' }}
        >
          {config.home_cta_title && (
            <h2 className="font-heading text-4xl sm:text-5xl font-bold">{config.home_cta_title}</h2>
          )}
          {config.home_cta_subtitle && (
            <p className="text-lg opacity-80 max-w-xl mx-auto">{config.home_cta_subtitle}</p>
          )}
          <Link
            href={config.home_cta_link}
            className="inline-block mt-2 px-8 py-3.5 bg-white text-sm font-semibold rounded-full hover:bg-white/90 transition-colors"
            style={{ color: 'var(--color-primary)' }}
          >
            Ver productos
          </Link>
        </section>
      )}
    </div>
  )
}
