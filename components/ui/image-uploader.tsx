'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const MAX_SIZE_MB = 5
const BUCKET = 'product-images'

interface Props {
  folder: string
  name: string
  defaultValue?: string | null
  label?: string
}

export function ImageUploader({ folder, name, defaultValue, label = 'Imagen' }: Props) {
  const [url, setUrl] = useState(defaultValue ?? '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`El archivo no puede superar ${MAX_SIZE_MB}MB`)
      return
    }
    setUploading(true)
    setError('')
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${folder}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
      setUrl(publicUrl)
    } catch (err: any) {
      setError('Error al subir imagen: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={url} />
      {url && (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#f5f5f4]">
          <Image src={url} alt="Preview" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
      )}
      <label className={`flex flex-col items-center justify-center gap-1.5 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed border-[#e5e5e5]' : 'border-[#e5e5e5] hover:border-[#aaa]'}`}>
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
        <span className="text-sm text-[#555]">
          {uploading ? 'Subiendo...' : url ? `Cambiar ${label.toLowerCase()}` : `Subir ${label.toLowerCase()} (JPG, PNG, WebP — máx ${MAX_SIZE_MB}MB)`}
        </span>
      </label>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface MultiProps {
  folder: string
  defaultUrls?: string[]
  maxFiles?: number
  onChange: (urls: string[]) => void
}

export function MultiImageUploader({ folder, defaultUrls = [], maxFiles = 10, onChange }: MultiProps) {
  const [urls, setUrls] = useState<string[]>(defaultUrls)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  function update(next: string[]) {
    setUrls(next)
    onChange(next)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`El archivo no puede superar ${MAX_SIZE_MB}MB`)
      return
    }
    if (urls.length >= maxFiles) {
      setError(`Máximo ${maxFiles} imágenes`)
      return
    }
    setUploading(true)
    setError('')
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${folder}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
      update([...urls, publicUrl])
    } catch (err: any) {
      setError('Error al subir imagen: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function remove(index: number) {
    update(urls.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {urls.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-[#f5f5f4] group">
              <Image src={url} alt={`Imagen ${i + 1}`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {urls.length < maxFiles && (
        <label className={`flex flex-col items-center justify-center gap-1.5 border-2 border-dashed rounded-xl p-5 cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed border-[#e5e5e5]' : 'border-[#e5e5e5] hover:border-[#aaa]'}`}>
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
          <span className="text-sm text-[#555]">
            {uploading ? 'Subiendo...' : `Agregar imagen (${urls.length}/${maxFiles})`}
          </span>
        </label>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
