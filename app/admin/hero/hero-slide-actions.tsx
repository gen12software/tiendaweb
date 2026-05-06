'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  id: string
  isActive: boolean
}

export default function HeroSlideActions({ id, isActive }: Props) {
  const router = useRouter()

  async function toggle() {
    const supabase = createClient()
    await supabase.from('hero_slides').update({ is_active: !isActive }).eq('id', id)
    router.refresh()
  }

  async function remove() {
    if (!confirm('¿Eliminar esta slide?')) return
    const supabase = createClient()
    await supabase.from('hero_slides').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="flex gap-3">
      <button onClick={toggle} className="text-xs font-medium text-[#888] hover:text-[#111] transition-colors">
        {isActive ? 'Desactivar' : 'Activar'}
      </button>
      <button onClick={remove} className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors">
        Eliminar
      </button>
    </div>
  )
}
