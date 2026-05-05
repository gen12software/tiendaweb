'use server'

import { createClient } from '@/lib/supabase/server'

export async function updateProfileAction(_prevState: { error: string; success: string }, formData: FormData) {
  const full_name = (formData.get('full_name') as string).trim()

  if (!full_name) return { error: 'El nombre no puede estar vacío', success: '' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado', success: '' }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name })
    .eq('id', user.id)

  if (error) return { error: 'No se pudo actualizar el perfil', success: '' }
  return { error: '', success: 'Perfil actualizado correctamente' }
}

export async function updatePasswordAction(_prevState: { error: string; success: string }, formData: FormData) {
  const password = formData.get('password') as string
  const confirm = formData.get('confirm_password') as string

  if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres', success: '' }
  if (password !== confirm) return { error: 'Las contraseñas no coinciden', success: '' }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: 'No se pudo actualizar la contraseña', success: '' }
  return { error: '', success: 'Contraseña actualizada correctamente' }
}
