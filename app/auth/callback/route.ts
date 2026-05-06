import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email/send-welcome'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const { user } = data
      // Disparar email de bienvenida solo en la primera confirmación.
      // email_confirmed_at se establece en este momento, por lo que aún no
      // estaba confirmado antes de este intercambio.
      const fullName = (user.user_metadata?.full_name as string | undefined) ?? ''
      sendWelcomeEmail(user.email!, fullName)

      return NextResponse.redirect(`${origin}/cuenta/ordenes`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link_invalid`)
}
