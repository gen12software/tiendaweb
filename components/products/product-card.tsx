import Link from 'next/link'
import Image from 'next/image'
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
  const hasVariants = (product.product_variants?.length ?? 0) > 0
  const totalStock = hasVariants
    ? (product.product_variants?.reduce((s, v) => s + v.stock, 0) ?? 0)
    : (product.stock ?? 0)
  const outOfStock = totalStock === 0

  return (
    <div className="group relative flex flex-col">
      {/* Imagen */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-50" style={{ aspectRatio: '3/4' }}>
        <Link href={`/productos/${product.slug}`} className="block absolute inset-0">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <Image
              src="/placeholder-product.svg"
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {hasDiscount && (
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg text-white shadow-sm"
              style={{ backgroundColor: 'var(--color-accent, #f59e0b)' }}
            >
              -{discountPct}%
            </span>
          )}
          {outOfStock && (
            <span className="bg-black/70 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm">
              Sin stock
            </span>
          )}
        </div>

        {/* Acción hover */}
        <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 p-3 flex gap-2">
          {!outOfStock && (
            <AddToCartButton product={product} disabled={outOfStock} />
          )}
          <Link
            href={`/productos/${product.slug}`}
            className="flex-1 flex items-center justify-center text-xs font-semibold py-2.5 rounded-xl bg-white/95 text-gray-900 hover:bg-white transition-colors shadow-sm"
          >
            Ver detalle
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="pt-3 pb-1 px-0.5">
        <Link href={`/productos/${product.slug}`}>
          <p className="text-sm font-medium text-gray-800 hover:text-gray-500 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </p>
        </Link>
        <div className="flex items-baseline gap-2 mt-1.5">
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {currencySymbol}{product.compare_at_price!.toLocaleString('es-AR')}
            </span>
          )}
          <span className="font-heading font-bold text-base" style={{ color: hasDiscount ? 'var(--color-primary)' : undefined }}>
            {currencySymbol}{product.price.toLocaleString('es-AR')}
          </span>
        </div>
      </div>
    </div>
  )
}
