import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_id, plan_expires_at, plans(name)')
    .eq('id', user.id)
    .single()

  const expiresAt = profile?.plan_expires_at ?? null
  const active = expiresAt !== null && new Date(expiresAt) > new Date()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const planName = (profile?.plans as any)?.name ?? null

  return NextResponse.json({
    active,
    plan_name: planName,
    expires_at: expiresAt,
  })
}
