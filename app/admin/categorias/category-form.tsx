'use client'

import { useActionState } from 'react'
import { saveCategoryAction } from './actions'
import { ImageUploader } from '@/components/ui/image-uploader'

interface Category { id: string; name: string; image_url: string | null; sort_order: number }

export default function CategoryForm({ category }: { category?: Category }) {
  const [state, action, pending] = useActionState(saveCategoryAction, { error: '', success: '' })

  return (
    <form action={action} className="space-y-5">
      {state.success && <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{state.success}</div>}
      {state.error && <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.error}</div>}

      {category && <input type="hidden" name="id" value={category.id} />}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input name="name" type="text" required defaultValue={category?.name}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
        <ImageUploader name="image_url" folder="categorias" defaultValue={category?.image_url} label="imagen de categoría" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
        <input name="sort_order" type="number" defaultValue={category?.sort_order ?? 0}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
      </div>

      <button type="submit" disabled={pending}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors">
        {pending ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  )
}
