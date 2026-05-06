import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import HeroSlideForm from '../hero-slide-form'

export const metadata: Metadata = { title: 'Admin — Editar slide' }

export default async function EditHeroSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/cuenta/ordenes')

  const { data: slide } = await supabase.from('hero_slides').select('*').eq('id', id).single()
  if (!slide) notFound()

  return <HeroSlideForm slide={slide} />
}
