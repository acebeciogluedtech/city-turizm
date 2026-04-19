import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET – list all applications
export async function GET() {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ applications: data })
}

// POST – submit application
export async function POST(req: Request) {
  const body = await req.json()
  const { form_type, name, email, phone, data } = body

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('applications')
    .insert({ form_type, name, email, phone: phone || '', data: data || {} })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// PATCH – mark as read / toggle read (single or all)
export async function PATCH(req: Request) {
  const body = await req.json()

  // Mark all unread as read
  if (body.markAllRead) {
    const { error } = await supabase
      .from('applications')
      .update({ is_read: true })
      .or('is_read.eq.false,is_read.is.null')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  const { id, is_read } = body
  const { error } = await supabase
    .from('applications')
    .update({ is_read })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE – delete application
export async function DELETE(req: Request) {
  const { id } = await req.json()
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
