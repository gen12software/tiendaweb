import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import HeroSlideActions from './hero-slide-actions'

export const metadata: Metadata = { title: 'Admin — Hero' }

export default async function AdminHeroPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: slides } = await supabase
    .from('hero_slides')
    .select('*')
    .order('sort_order')

  return (
    <main className="flex-1 px-8 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-[#111]">Hero / Carrusel</h1>
            <p className="text-sm text-[#888] mt-1">Las slides se muestran en orden. Máximo 4 slides.</p>
          </div>
          {(slides?.length ?? 0) < 4 ? (
            <Link
              href="/admin/hero/new"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              + Nueva slide
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-xl text-sm font-semibold text-white opacity-40 cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-primary)' }}
              title="Límite de 4 slides alcanzado">
              + Nueva slide
            </span>
          )}
        </div>

        {!slides?.length ? (
          <div className="rounded-2xl bg-white border border-[#f0f0f0] p-12 text-center">
            <p className="text-[#999] text-sm">No hay slides todavía.</p>
            <Link href="/admin/hero/new" className="text-sm underline mt-2 inline-block" style={{ color: 'var(--color-primary)' }}>
              Crear la primera
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {slides.map((slide) => (
              <div key={slide.id} className="rounded-2xl bg-white border border-[#f0f0f0] overflow-hidden">
                <div className="relative aspect-video bg-[#f5f5f4]">
                  {slide.image_url && (
                    <Image src={slide.image_url} alt={slide.title || 'Slide'} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  )}
                  {!slide.is_active && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="text-xs font-semibold text-[#888] bg-white px-3 py-1 rounded-full border">Inactiva</span>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <p className="font-semibold text-sm text-[#111] line-clamp-1">{slide.title || '(sin título)'}</p>
                  {slide.subtitle && <p className="text-xs text-[#888] line-clamp-1">{slide.subtitle}</p>}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-[#bbb]">Orden: {slide.sort_order}</span>
                    <div className="flex gap-3">
                      <Link href={`/admin/hero/${slide.id}`} className="text-xs font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
                        Editar
                      </Link>
                      <HeroSlideActions id={slide.id} isActive={slide.is_active} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </main>
  )
}
