import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWeeklySummary } from '@/lib/email/send-weekly-summary'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  try {
    const result = await sendWeeklySummary(supabaseAdmin)
    if (!result.sent) {
      console.error('[cron/weekly-summary] Email no enviado:', result.error)
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
    }
    console.log('[cron/weekly-summary] Resumen semanal enviado')
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[cron/weekly-summary] Error crítico:', err)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}
