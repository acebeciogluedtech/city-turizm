import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TABLE_SQL = `CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access_site_settings" ON site_settings
  FOR ALL USING (true) WITH CHECK (true);`

const TABLE_MISSING = {
  error: 'site_settings tablosu bulunamadi. Lütfen Supabase SQL Editor’inde aşağıdaki SQL’i çalıştırın.',
  sql: TABLE_SQL,
}

// ── GET: fetch all site_settings ─────────────────────────────────────────────
export async function GET() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')

  if (error) {
    if (error.code === '42P01') return NextResponse.json({ settings: {}, ...TABLE_MISSING }, { status: 503 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const settings: Record<string, string> = {}
  for (const row of data || []) settings[row.key] = row.value ?? ''
  return NextResponse.json({ settings })
}

// ── POST: upsert settings ─────────────────────────────────────────────────────
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
    .from('site_settings')
    .upsert(pairs, { onConflict: 'key' })

  if (error) {
    if (error.code === '42P01' || error.message?.includes('schema cache'))
      return NextResponse.json(TABLE_MISSING, { status: 503 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
