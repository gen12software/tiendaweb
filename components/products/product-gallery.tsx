'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

interface GalleryImage { id: string; url: string; sort_order: number }

interface Props {
  images: GalleryImage[]
  productName: string
  discountPct: number
}

export default function ProductGallery({ images, productName, discountPct }: Props) {
  const [current, setCurrent] = useState(0)

  return (
    <div className="space-y-3">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
        {images[current] ? (
          <Image
            src={images[current].url}
            alt={productName}
            fill
            className="object-cover transition-opacity duration-200"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <Image
            src="/placeholder-product.svg"
            alt={productName}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        )}
        {discountPct > 0 && (
          <Badge className="absolute top-3 left-3 text-white" style={{ backgroundColor: 'var(--color-accent)' }}>
            -{discountPct}%
          </Badge>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrent(i)}
              className={`relative aspect-square rounded-lg overflow-hidden bg-muted border-2 transition-colors ${
                i === current ? 'border-foreground' : 'border-transparent hover:border-muted-foreground'
              }`}
            >
              <Image src={img.url} alt={`${productName} ${i + 1}`} fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
