'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  productId: string
}

export default function WishlistButton({ productId }: Props) {
  const [inWishlist, setInWishlist] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single()
      setInWishlist(!!data)
    }
    load()
  }, [productId])

  async function toggle() {
    if (!userId) {
      toast.info('Iniciá sesión para guardar favoritos')
      return
    }
    const supabase = createClient()
    if (inWishlist) {
      await supabase.from('wishlist').delete().eq('user_id', userId).eq('product_id', productId)
      setInWishlist(false)
      toast.success('Eliminado de favoritos')
    } else {
      await supabase.from('wishlist').insert({ user_id: userId, product_id: productId })
      setInWishlist(true)
      toast.success('Guardado en favoritos')
    }
  }

  return (
    <Button variant="outline" size="lg" onClick={toggle} aria-label="Wishlist">
      <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
    </Button>
  )
}
