import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET – return all SEO settings as a flat key-value object
export async function GET() {
  const { data, error } = await supabase
    .from('seo_settings')
    .select('key, value')

  if (error) {
    // Table may not exist yet — return empty settings gracefully
    if (error.code === '42P01') return NextResponse.json({ settings: {} })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const settings: Record<string, string> = {}
  for (const row of data || []) {
    settings[row.key] = row.value ?? ''
  }
  return NextResponse.json({ settings })
}

// POST – upsert settings { settings: { key: value, ... } }
export async function POST(req: Request) {
  const body = await req.json()
  const pairs: { key: string; value: string; updated_at: string }[] = []

  if (body.settings && typeof body.settings === 'object') {
    for (const [key, value] of Object.entries(body.settings)) {
      pairs.push({ key, value: String(value ?? ''), updated_at: new Date().toISOString() })
    }
  } else if (body.key) {
    pairs.push({ key: body.key, value: String(body.value ?? ''), updated_at: new Date().toISOString() })
  }

  if (!pairs.length) return NextResponse.json({ error: 'No data' }, { status: 400 })

  const { error } = await supabase
    .from('seo_settings')
    .upsert(pairs, { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, count: pairs.length })
}
