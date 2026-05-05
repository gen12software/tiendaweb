'use server'

import { createClient } from '@/lib/supabase/server'

export async function forgotPasswordAction(_prevState: { sent: boolean }, formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })

  // Siempre retorna éxito para no revelar si el email existe
  return { sent: true }
}
