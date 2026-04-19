import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/admin/setup-quotes — Creates the quotes table via SQL
export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Use the management API / SQL endpoint to create table
  const sql = `
    CREATE TABLE IF NOT EXISTS public.quotes (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      name text NOT NULL,
      email text NOT NULL,
      phone text DEFAULT '',
      company text DEFAULT '',
      message text DEFAULT '',
      source text DEFAULT 'genel',
      is_read boolean DEFAULT false,
      created_at timestamptz DEFAULT now()
    );

    ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'service_role_full_access_quotes'
      ) THEN
        CREATE POLICY "service_role_full_access_quotes" ON public.quotes FOR ALL USING (true) WITH CHECK (true);
      END IF;
    END $$;
  `

  try {
    // Try Supabase SQL via the management API
    // First, extract project ref from URL
    const projectRef = supabaseUrl.replace('https://', '').split('.')[0]
    
    const mgmtRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    })
    
    if (mgmtRes.ok) {
      return NextResponse.json({ success: true, message: 'Quotes table created successfully!' })
    }
    
    // Fallback: Return SQL for manual execution
    return NextResponse.json({
      success: false,
      message: 'Please run this SQL in Supabase SQL Editor (Dashboard > SQL Editor):',
      sql: sql.trim(),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Please run this SQL in Supabase SQL Editor:',
      sql: sql.trim(),
      error: error.message,
    })
  }
}

// GET — Check if quotes table exists
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase.from('quotes').select('id').limit(1)
  
  if (error) {
    return NextResponse.json({ exists: false, error: error.message })
  }
  
  return NextResponse.json({ exists: true })
}
