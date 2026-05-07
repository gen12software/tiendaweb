'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function isSafeRedirect(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//')
}

export async function loginAction(_prevState: { error: string }, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const rawRedirect = (formData.get('redirectTo') as string) || '/cuenta/ordenes'
  const redirectTo = isSafeRedirect(rawRedirect) ? rawRedirect : '/cuenta/ordenes'

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email o contraseña incorrectos' }
  }

  const user = data.user
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      redirect('/admin')
    }
  }

  redirect(redirectTo)
}
