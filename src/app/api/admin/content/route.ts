import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidateTag } from 'next/cache'

// GET /api/admin/content?pageId=xxx — Load all content for a page
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageId = searchParams.get('pageId')

  try {
    let query = supabaseAdmin.from('page_content').select('*')
    if (pageId) query = query.eq('page_id', pageId)

    const { data, error } = await query

    if (error) {
      // Table might not exist yet
      if (error.code === '42P01') {
        return NextResponse.json({ data: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/admin/content — Save/upsert content fields
export async function POST(request: Request) {
  try {
    const { fields } = await request.json()
    // fields: Array<{ page_id, section_id, field_id, tr, en }>

    if (!fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: 'Invalid fields data' }, { status: 400 })
    }

    const records = fields.map((f: any) => ({
      page_id: f.page_id,
      section_id: f.section_id,
      field_id: f.field_id,
      tr: f.tr ?? '',
      en: f.en ?? '',
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabaseAdmin
      .from('page_content')
      .upsert(records, {
        onConflict: 'page_id,section_id,field_id',
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Purge ISR cache so updated content shows on next page request
    try { (revalidateTag as (tag: string) => void)('page-content') } catch {}

    return NextResponse.json({ success: true, count: records.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
