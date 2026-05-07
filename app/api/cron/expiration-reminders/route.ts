import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendExpirationReminders } from '@/lib/email/send-expiration-reminders'

export async function GET(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  // Verificar CRON_SECRET en el header Authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Correr ambas tandas en paralelo (7 días y 1 día)
    const [result7d, result1d] = await Promise.all([
      sendExpirationReminders(supabaseAdmin, 7),
      sendExpirationReminders(supabaseAdmin, 1),
    ])

    const summary = {
      expiration_7d: result7d,
      expiration_1d: result1d,
      total_sent: result7d.sent + result1d.sent,
      total_failed: result7d.failed + result1d.failed,
    }

    console.log('[cron/expiration-reminders] Completado:', summary)

    return NextResponse.json({ ok: true, ...summary })
  } catch (err) {
    console.error('[cron/expiration-reminders] Error crítico:', err)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}
