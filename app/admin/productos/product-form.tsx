'use client'

import { useActionState } from 'react'
import { saveProductAction } from './actions'
import { Product } from '@/lib/types/store'

interface Props {
  product?: Product
  categories: { id: string; name: string }[]
}

export default function ProductForm({ product, categories }: Props) {
  const [state, action, pending] = useActionState(saveProductAction, { error: '', success: '' })

  return (
    <form action={action} className="space-y-5">
      {state.success && <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{state.success}</div>}
      {state.error && <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.error}</div>}

      {product && <input type="hidden" name="id" value={product.id} />}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input name="name" type="text" required defaultValue={product?.name}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea name="description" rows={4} defaultValue={product?.description ?? ''}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
          <input name="price" type="number" step="0.01" required defaultValue={product?.price}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio tachado</label>
          <input name="compare_at_price" type="number" step="0.01" defaultValue={product?.compare_at_price ?? ''}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <select name="category_id" defaultValue={product?.category_id ?? ''}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none">
          <option value="">Sin categoría</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_featured" value="true" defaultChecked={product?.is_featured}
            className="rounded border-gray-300 text-indigo-600" />
          Destacado en el home
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" value="true" defaultChecked={!product || product.is_active}
            className="rounded border-gray-300 text-indigo-600" />
          Activo
        </label>
      </div>

      <button type="submit" disabled={pending}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors">
        {pending ? 'Guardando…' : 'Guardar producto'}
      </button>
    </form>
  )
}
