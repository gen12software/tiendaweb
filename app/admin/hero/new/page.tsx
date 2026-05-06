import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HeroSlideForm from '../hero-slide-form'

export const metadata: Metadata = { title: 'Admin — Nueva slide' }

export default async function NewHeroSlidePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/cuenta/ordenes')

  const { count } = await supabase.from('hero_slides').select('id', { count: 'exact', head: true })
  if ((count ?? 0) >= 4) redirect('/admin/hero')

  return <HeroSlideForm />
}
