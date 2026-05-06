import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getSiteConfig } from '@/lib/site-config'
import { Metadata } from 'next'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import ProductDetail from '@/components/products/product-detail'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('name, description').eq('slug', slug).single()
  if (!data) return { title: 'Producto no encontrado' }
  return { title: data.name, description: data.description ?? undefined }
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const config = await getSiteConfig()

  const { data: product } = await supabase
    .from('products')
    .select('*, product_images(id, url, sort_order), product_variants(id, name, options, price_modifier, stock, sku), categories(id, name, slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  const images = (product.product_images ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order)
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6 flex gap-2">
        <a href="/productos" className="hover:text-foreground transition-colors">Productos</a>
        {product.categories && (
          <>
            <span>/</span>
            <a href={`/productos?categoria=${(product.categories as any).slug}`} className="hover:text-foreground transition-colors">
              {(product.categories as any).name}
            </a>
          </>
        )}
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Galería */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
            {images[0] ? (
              <Image
                src={images[0].url}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Sin imagen
              </div>
            )}
            {hasDiscount && (
              <Badge className="absolute top-3 left-3 text-white" style={{ backgroundColor: 'var(--color-accent)' }}>
                -{discountPct}%
              </Badge>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1).map((img: any) => (
                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image src={img.url} alt={product.name} fill className="object-cover" sizes="120px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Datos del producto — sticky en desktop */}
        <div className="lg:sticky lg:top-24 lg:self-start space-y-5">
          {product.categories && (
            <a
              href={`/productos?categoria=${(product.categories as any).slug}`}
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
            >
              {(product.categories as any).name}
            </a>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{product.name}</h1>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{config.currency_symbol}{product.price.toLocaleString('es-AR')}</span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                {config.currency_symbol}{product.compare_at_price!.toLocaleString('es-AR')}
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          <ProductDetail product={product as any} currencySymbol={config.currency_symbol} />
        </div>
      </div>
    </div>
  )
}
