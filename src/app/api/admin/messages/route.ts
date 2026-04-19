import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST — submit message
export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message, source } = await req.json()
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Lütfen tüm zorunlu alanları doldurun.' }, { status: 400 })
    }

    const { error } = await supabase
      .from('contact_messages')
      .insert({ name, email: email.toLowerCase().trim(), phone: phone || '', message, source: source || 'contact' })

    if (error) {
      console.error('[Messages] Insert error:', error)
      // Try without optional columns
      if (error.message?.includes('column') || error.message?.includes('schema cache')) {
        const { error: e2 } = await supabase
          .from('contact_messages')
          .insert({ name, email: email.toLowerCase().trim(), message })
        if (e2) {
          console.error('[Messages] Fallback insert error:', e2)
          return NextResponse.json({ error: e2.message }, { status: 500 })
        }
        return NextResponse.json({ success: true })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Bir hata oluştu'
    console.error('[Messages] Exception:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// GET — list messages (admin)
export async function GET() {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ messages: data })
}

// PATCH — mark as read (single or all)
export async function PATCH(req: NextRequest) {
  const body = await req.json()

  // Mark all unread as read
  if (body.markAllRead) {
    const { error } = await supabase
      .from('contact_messages')
      .update({ is_read: true })
      .or('is_read.eq.false,is_read.is.null')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // Mark single message
  const { id, is_read } = body
  const { error } = await supabase
    .from('contact_messages')
    .update({ is_read })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE — delete message
export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
