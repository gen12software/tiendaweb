'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'

interface ContentItem {
  id?: string
  title?: string
  description?: string | null
  video_url?: string | null
  category?: string | null
  duration_minutes?: number | null
  sort_order?: number
  is_active?: boolean
}

type ActionFn = (prevState: { error: string }, formData: FormData) => Promise<{ error: string }>

export default function ContentForm({ item, action, submitLabel }: { item?: ContentItem; action: ActionFn; submitLabel: string }) {
  const [state, formAction, pending] = useActionState(action, { error: '' })
  const [previewUrl, setPreviewUrl] = useState(item?.video_url ?? '')

  return (
    <form action={formAction} className="space-y-5">
      {item?.id && <input type="hidden" name="id" value={item.id} />}

      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input
            id="title" name="title" type="text" required
            defaultValue={item?.title ?? ''}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            id="description" name="description" rows={3}
            defaultValue={item?.description ?? ''}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-1">
            URL del video <span className="text-gray-400 font-normal">(embed de YouTube, Vimeo, etc.)</span>
          </label>
          <input
            id="video_url" name="video_url" type="url"
            defaultValue={item?.video_url ?? ''}
            onChange={(e) => setPreviewUrl(e.target.value)}
            placeholder="https://www.youtube.com/embed/..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {previewUrl && (
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-gray-500 mb-1">Preview</p>
            <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
              <iframe src={previewUrl} className="w-full h-full" allowFullScreen />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <input
            id="category" name="category" type="text"
            defaultValue={item?.category ?? ''}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-1">Duración (minutos)</label>
          <input
            id="duration_minutes" name="duration_minutes" type="number" min="1"
            defaultValue={item?.duration_minutes ?? ''}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-1">
            Orden <span className="text-gray-400 font-normal">(menor = primero)</span>
          </label>
          <input
            id="sort_order" name="sort_order" type="number" min="0"
            defaultValue={item?.sort_order ?? 0}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" name="is_active" defaultChecked={item?.is_active ?? true}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm font-medium text-gray-700">Visible para usuarios</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit" disabled={pending}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Guardando…' : submitLabel}
        </button>
        <Link href="/admin/contenido" className="text-sm text-gray-500 hover:text-gray-700">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
