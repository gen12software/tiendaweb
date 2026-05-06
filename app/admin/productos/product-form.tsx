'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MultiImageUploader } from '@/components/ui/image-uploader'
import { Trash2, Plus } from 'lucide-react'

interface ProductImage { id: string; url: string; sort_order: number }

interface ProductVariant {
  id?: string
  name: string
  stock: number
  sku: string
  price_modifier: number
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  compare_at_price: number | null
  category_id: string | null
  is_featured: boolean
  is_active: boolean
  sort_order: number
  product_images: ProductImage[]
  product_variants: ProductVariant[]
}

interface Props {
  product?: Product
  categories: { id: string; name: string }[]
}

const emptyVariant = (): ProductVariant => ({ name: '', stock: 0, sku: '', price_modifier: 0 })

export default function ProductForm({ product, categories }: Props) {
  const router = useRouter()
  const isEdit = !!product

  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compare_at_price?.toString() ?? '')
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '')
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false)
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [sortOrder, setSortOrder] = useState(product?.sort_order?.toString() ?? '0')
  const [stock, setStock] = useState((product as any)?.stock?.toString() ?? '0')
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.product_images?.sort((a, b) => a.sort_order - b.sort_order).map(i => i.url) ?? []
  )
  const [variants, setVariants] = useState<ProductVariant[]>(
    product?.product_variants?.length ? product.product_variants : []
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function addVariant() {
    setVariants(v => [...v, emptyVariant()])
  }

  function removeVariant(i: number) {
    setVariants(v => v.filter((_, idx) => idx !== i))
  }

  function updateVariant(i: number, field: keyof ProductVariant, value: string | number) {
    setVariants(v => v.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  const discountPct = price && compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price)
    ? Math.round((1 - parseFloat(price) / parseFloat(compareAtPrice)) * 100)
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !price) { setError('Nombre y precio son requeridos'); return }
    if (variants.some(v => !v.name.trim())) { setError('Todas las variantes deben tener nombre'); return }
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const payload = {
        name: name.trim(),
        slug,
        price: parseFloat(price),
        compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
        description: description.trim() || null,
        category_id: categoryId || null,
        is_featured: isFeatured,
        is_active: isActive,
        sort_order: parseInt(sortOrder) || 0,
        stock: parseInt(stock) || 0,
      }

      let productId = product?.id
      if (isEdit) {
        const { error: err } = await supabase.from('products').update(payload).eq('id', productId!)
        if (err) throw err
      } else {
        const { data, error: err } = await supabase.from('products').insert(payload).select('id').single()
        if (err) throw err
        productId = data.id
      }

      // Sync images
      await supabase.from('product_images').delete().eq('product_id', productId!)
      if (imageUrls.length > 0) {
        const rows = imageUrls.map((url, i) => ({ product_id: productId!, url, sort_order: i }))
        const { error: imgErr } = await supabase.from('product_images').insert(rows)
        if (imgErr) throw imgErr
      }

      // Sync variants
      await supabase.from('product_variants').delete().eq('product_id', productId!)
      if (variants.length > 0) {
        const rows = variants.map(v => ({
          product_id: productId!,
          name: v.name.trim(),
          stock: Number(v.stock) || 0,
          sku: v.sku.trim() || null,
          price_modifier: Number(v.price_modifier) || 0,
          options: {},
        }))
        const { error: varErr } = await supabase.from('product_variants').insert(rows)
        if (varErr) throw varErr
      }

      router.push('/admin/productos')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Imágenes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes del producto</label>
        <MultiImageUploader
          folder="productos"
          defaultUrls={imageUrls}
          maxFiles={10}
          onChange={setImageUrls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input value={name} onChange={e => setName(e.target.value)} required
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
      </div>

      {/* Precios */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
          <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio tachado
            {discountPct && (
              <span className="ml-2 text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                -{discountPct}%
              </span>
            )}
          </label>
          <input type="number" step="0.01" value={compareAtPrice} onChange={e => setCompareAtPrice(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none">
            <option value="">Sin categoría</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
          <input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stock
          {variants.length > 0 && <span className="ml-2 text-xs text-gray-400">(ignorado cuando hay variantes — cada variante tiene su propio stock)</span>}
        </label>
        <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)}
          disabled={variants.length > 0}
          className="w-40 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-40 disabled:bg-gray-50" />
      </div>

      {/* Variantes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Variantes</label>
            <p className="text-xs text-gray-400">Ej: Talle S, Color Rojo, 1kg. Si no hay variantes el producto tiene stock ilimitado.</p>
          </div>
          <button type="button" onClick={addVariant}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            <Plus className="w-4 h-4" /> Agregar variante
          </button>
        </div>

        {variants.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_80px_120px_100px_40px] gap-0 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-200">
              <span>Nombre</span>
              <span>Stock</span>
              <span>SKU</span>
              <span>+ Precio</span>
              <span></span>
            </div>
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_120px_100px_40px] gap-0 px-3 py-2 border-b border-gray-100 last:border-0 items-center">
                <input
                  value={v.name}
                  onChange={e => updateVariant(i, 'name', e.target.value)}
                  placeholder="Ej: Talle M"
                  className="rounded border border-gray-200 px-2 py-1 text-sm focus:border-indigo-400 focus:outline-none mr-2"
                />
                <input
                  type="number" min="0"
                  value={v.stock}
                  onChange={e => updateVariant(i, 'stock', parseInt(e.target.value) || 0)}
                  className="rounded border border-gray-200 px-2 py-1 text-sm focus:border-indigo-400 focus:outline-none mr-2 w-full"
                />
                <input
                  value={v.sku}
                  onChange={e => updateVariant(i, 'sku', e.target.value)}
                  placeholder="SKU-001"
                  className="rounded border border-gray-200 px-2 py-1 text-sm focus:border-indigo-400 focus:outline-none mr-2 w-full"
                />
                <input
                  type="number" step="0.01"
                  value={v.price_modifier}
                  onChange={e => updateVariant(i, 'price_modifier', parseFloat(e.target.value) || 0)}
                  className="rounded border border-gray-200 px-2 py-1 text-sm focus:border-indigo-400 focus:outline-none mr-2 w-full"
                />
                <button type="button" onClick={() => removeVariant(i)}
                  className="text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600" />
          Destacado en el home
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600" />
          Activo
        </label>
      </div>

      <button type="submit" disabled={saving}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors">
        {saving ? 'Guardando…' : 'Guardar producto'}
      </button>
    </form>
  )
}
