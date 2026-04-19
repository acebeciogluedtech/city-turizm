import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/admin/create-table — Creates the page_content table
export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    // Try to query the table first
    const { error: checkError } = await supabase
      .from('page_content')
      .select('id')
      .limit(1)

    if (!checkError) {
      return NextResponse.json({ message: 'Table already exists', success: true })
    }

    // If table doesn't exist (code 42P01), we need to create it
    // Use the Supabase SQL endpoint
    const sql = `
      CREATE TABLE IF NOT EXISTS public.page_content (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        page_id text NOT NULL,
        section_id text NOT NULL,
        field_id text NOT NULL,
        tr text DEFAULT '',
        en text DEFAULT '',
        updated_at timestamptz DEFAULT now(),
        UNIQUE(page_id, section_id, field_id)
      );

      ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'page_content' AND policyname = 'service_role_full_access'
        ) THEN
          CREATE POLICY "service_role_full_access" ON public.page_content FOR ALL USING (true) WITH CHECK (true);
        END IF;
      END $$;
    `

    // Try via Supabase Management API
    const mgmtRes = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    })

    return NextResponse.json({
      success: false,
      message: 'Table does not exist. Please run the SQL below in the Supabase SQL Editor (Dashboard > SQL Editor):',
      sql: sql.trim(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
