'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ImageUploader } from '@/components/ui/image-uploader'

interface Slide {
  id: string
  image_url: string
  title: string
  subtitle: string
  cta_text: string
  cta_url: string
  sort_order: number
  is_active: boolean
}

interface Props {
  slide?: Slide
}

export default function HeroSlideForm({ slide }: Props) {
  const router = useRouter()
  const isEdit = !!slide

  const [title, setTitle] = useState(slide?.title ?? '')
  const [subtitle, setSubtitle] = useState(slide?.subtitle ?? '')
  const [ctaText, setCtaText] = useState(slide?.cta_text ?? 'Ver productos')
  const [ctaUrl, setCtaUrl] = useState(slide?.cta_url ?? '/productos')
  const [sortOrder, setSortOrder] = useState(slide?.sort_order ?? 0)
  const [isActive, setIsActive] = useState(slide?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const currentImageUrl = (form.elements.namedItem('image_url') as HTMLInputElement)?.value
    if (!currentImageUrl) { setError('La imagen es obligatoria'); return }
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      const payload = { image_url: currentImageUrl, title, subtitle, cta_text: ctaText, cta_url: ctaUrl, sort_order: sortOrder, is_active: isActive }
      if (isEdit) {
        const { error } = await supabase.from('hero_slides').update(payload).eq('id', slide.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('hero_slides').insert(payload)
        if (error) throw error
      }
      router.push('/admin/hero')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="flex-1 px-8 py-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/admin/hero" className="text-sm text-[#888] hover:text-[#111] transition-colors">← Volver</Link>
            <h1 className="font-heading text-2xl font-bold text-[#111]">{isEdit ? 'Editar slide' : 'Nueva slide'}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Imagen */}
            <div className="rounded-2xl bg-white border border-[#f0f0f0] p-6 space-y-4">
              <h2 className="font-semibold text-sm text-[#111]">Imagen de fondo *</h2>
              <ImageUploader name="image_url" folder="hero" defaultValue={slide?.image_url} label="imagen de fondo" />
            </div>

            {/* Contenido */}
            <div className="rounded-2xl bg-white border border-[#f0f0f0] p-6 space-y-4">
              <h2 className="font-semibold text-sm text-[#111]">Contenido (opcional)</h2>
              <div>
                <label className="text-xs font-medium text-[#888] uppercase tracking-widest block mb-1.5">Título</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Todo lo que necesitás"
                  className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
              <div>
                <label className="text-xs font-medium text-[#888] uppercase tracking-widest block mb-1.5">Subtítulo</label>
                <input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Descripción breve"
                  className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#888] uppercase tracking-widest block mb-1.5">Texto del botón</label>
                  <input value={ctaText} onChange={e => setCtaText(e.target.value)} placeholder="Ver productos"
                    className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#888] uppercase tracking-widest block mb-1.5">Destino del botón</label>
                  <select value={ctaUrl} onChange={e => setCtaUrl(e.target.value)}
                    className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white">
                    <option value="/productos">Productos</option>
                    <option value="/quienes-somos">Quiénes somos</option>
                    <option value="/contacto">Contacto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Config */}
            <div className="rounded-2xl bg-white border border-[#f0f0f0] p-6 space-y-4">
              <h2 className="font-semibold text-sm text-[#111]">Configuración</h2>
              <div className="flex gap-6">
                <div>
                  <label className="text-xs font-medium text-[#888] uppercase tracking-widest block mb-1.5">Orden</label>
                  <input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} min={0}
                    className="w-24 border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 rounded" />
                    <span className="text-sm">Activa</span>
                  </label>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-85"
                style={{ backgroundColor: 'var(--color-primary)' }}>
                {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear slide'}
              </button>
              <Link href="/admin/hero" className="px-6 py-2.5 rounded-xl text-sm font-medium border border-[#e5e5e5] hover:bg-[#f5f5f4] transition-colors">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
    </main>
  )
}
