import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/types/store'
import AddToCartButton from './add-to-cart-button'

interface Props {
  product: Product
  currencySymbol?: string
}

export default function ProductCard({ product, currencySymbol = '$' }: Props) {
  const image = product.product_images?.[0]?.url ?? null
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0
  const totalStock = product.product_variants?.reduce((s, v) => s + v.stock, 0) ?? 0
  const hasVariants = (product.product_variants?.length ?? 0) > 0
  const outOfStock = hasVariants && totalStock === 0

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/productos/${product.slug}`} className="block relative aspect-square overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            Sin imagen
          </div>
        )}
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 text-white" style={{ backgroundColor: 'var(--color-accent)' }}>
            -{discountPct}%
          </Badge>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">Sin stock</span>
          </div>
        )}
      </Link>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <Link href={`/productos/${product.slug}`}>
          <p className="text-sm font-medium leading-tight hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </p>
        </Link>
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="font-bold text-base">
            {currencySymbol}{product.price.toLocaleString('es-AR')}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {currencySymbol}{product.compare_at_price!.toLocaleString('es-AR')}
            </span>
          )}
        </div>
        <AddToCartButton product={product} disabled={outOfStock} />
      </div>
    </div>
  )
}
