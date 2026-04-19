import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST — subscribe
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Geçerli bir e-posta giriniz.' }, { status: 400 })
    }

    // Simple insert, let DB handle defaults
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.toLowerCase().trim() })

    if (error) {
      // If duplicate, that's OK
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        return NextResponse.json({ success: true, message: 'Already subscribed' })
      }
      console.error('[Newsletter] Subscribe error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bir hata oluştu'
    console.error('[Newsletter] Exception:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET — list subscribers (admin only)
export async function GET() {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    // Try without ordering if column doesn't exist
    const { data: d2, error: e2 } = await supabase
      .from('newsletter_subscribers')
      .select('*')

    if (e2) {
      console.error('[Newsletter] List error:', e2)
      return NextResponse.json({ error: e2.message, subscribers: [] }, { status: 200 })
    }
    return NextResponse.json({ subscribers: d2 || [] })
  }

  return NextResponse.json({ subscribers: data || [] })
}

// DELETE — unsubscribe
export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const { error } = await supabase
    .from('newsletter_subscribers')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
