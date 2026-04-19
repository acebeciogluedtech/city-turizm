import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST — submit quote request
export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, company, message, source } = await req.json()
    if (!name || !email) {
      return NextResponse.json({ error: 'Lütfen zorunlu alanları doldurun.' }, { status: 400 })
    }

    const row = {
      name,
      email: email.toLowerCase().trim(),
      phone: phone || '',
      company: company || '',
      message: message || '',
      source: source || 'genel',
      is_read: false,
    }

    const { error } = await supabase.from('quotes').insert(row)

    if (error) {
      // Table doesn't exist — try to save to contact_messages as fallback
      if (error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
        console.warn('[Quotes] Table not found, saving to contact_messages as fallback')
        const msgText = `[Teklif - ${source}] ${row.company ? `Firma: ${row.company}. ` : ''}${row.message}`
        
        // Try with all columns first
        let result = await supabase.from('contact_messages').insert({
          name: row.name, email: row.email, phone: row.phone,
          message: msgText, source: `quote-${source}`, is_read: false,
        })
        
        // If is_read column fails, try without it
        if (result.error?.message?.includes('is_read') || result.error?.message?.includes('schema cache')) {
          result = await supabase.from('contact_messages').insert({
            name: row.name, email: row.email, phone: row.phone,
            message: msgText, source: `quote-${source}`,
          })
        }
        
        // If source column also fails, try minimal
        if (result.error?.message?.includes('source') || result.error?.message?.includes('schema cache')) {
          result = await supabase.from('contact_messages').insert({
            name: row.name, email: row.email, message: msgText,
          })
        }
        
        if (result.error) {
          console.error('[Quotes] Fallback insert error:', result.error)
          return NextResponse.json({ error: result.error.message }, { status: 500 })
        }
        return NextResponse.json({ success: true, fallback: true })
      }
      console.error('[Quotes] Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Bir hata oluştu'
    console.error('[Quotes] Exception:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// GET — list quotes (admin)
export async function GET() {
  // Try quotes table first
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false })

  if (!error) {
    return NextResponse.json({ quotes: data })
  }

  // Fallback: read from contact_messages where message starts with '[Teklif -'
  if (error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('contact_messages')
      .select('*')
      .like('message', '[Teklif -%')
      .order('created_at', { ascending: false })
    
    if (fallbackError) {
      return NextResponse.json({ quotes: [] })
    }
    
    // Parse source from message text: "[Teklif - source] ..."
    const quotes = (fallbackData || []).map(m => {
      const match = (m.message || '').match(/^\[Teklif - ([^\]]+)\]/)
      const src = match ? match[1] : 'genel'
      const cleanMsg = (m.message || '').replace(/^\[Teklif - [^\]]+\]\s*/, '')
      return {
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone || '',
        company: '',
        message: cleanMsg,
        source: src,
        is_read: m.is_read ?? false,
        created_at: m.created_at,
      }
    })
    
    return NextResponse.json({ quotes })
  }

  return NextResponse.json({ quotes: [], error: error.message })
}

// PATCH — mark as read/unread (single or all)
export async function PATCH(req: NextRequest) {
  const body = await req.json()

  // Mark all unread as read
  if (body.markAllRead) {
    // Try quotes table
    const { error } = await supabase
      .from('quotes')
      .update({ is_read: true })
      .or('is_read.eq.false,is_read.is.null')
    if (error?.message?.includes('schema cache') || error?.message?.includes('does not exist')) {
      // Fallback to contact_messages
      await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .like('message', '[Teklif -%')
    }
    return NextResponse.json({ success: true })
  }

  const { id, is_read } = body
  
  // Try quotes table
  const { error } = await supabase
    .from('quotes')
    .update({ is_read })
    .eq('id', id)

  if (error?.message?.includes('schema cache') || error?.message?.includes('does not exist')) {
    const { error: fallbackError } = await supabase
      .from('contact_messages')
      .update({ is_read })
      .eq('id', id)
    
    if (fallbackError) {
      console.warn('[Quotes] PATCH fallback failed:', fallbackError.message)
      return NextResponse.json({ success: true, note: 'is_read not supported in fallback mode' })
    }
    return NextResponse.json({ success: true })
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE — delete quote
export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  
  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', id)

  if (error?.message?.includes('schema cache') || error?.message?.includes('does not exist')) {
    const { error: fallbackError } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id)
    
    if (fallbackError) return NextResponse.json({ error: fallbackError.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
