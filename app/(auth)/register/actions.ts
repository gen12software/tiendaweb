'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function registerAction(_prevState: { error: string }, formData: FormData) {
  const full_name = formData.get('full_name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered') || error.code === 'user_already_exists') {
      return { error: 'Este email ya está registrado' }
    }
    return { error: 'Ocurrió un error al crear la cuenta. Intentá de nuevo.' }
  }

  redirect(`/register/check-email?email=${encodeURIComponent(email)}`)
}
