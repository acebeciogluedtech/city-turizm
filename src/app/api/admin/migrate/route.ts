import { NextResponse } from 'next/server'

/**
 * GET /api/admin/migrate — returns the SQL to run in Supabase SQL Editor
 * to add missing columns and tables needed for the notification system.
 */
export async function GET() {
  const sql = `
-- ═══════════════════════════════════════════════
-- Migration: Add missing columns & tables
-- Run this in Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════

-- 1. Add missing columns to contact_messages table
ALTER TABLE public.contact_messages 
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'contact',
  ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone text DEFAULT '';

-- Update existing NULL is_read to false
UPDATE public.contact_messages SET is_read = false WHERE is_read IS NULL;

-- 2. Create quotes table if not exists
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
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Public can submit quotes') THEN
    CREATE POLICY "Public can submit quotes" ON public.quotes FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Admin can manage quotes') THEN
    CREATE POLICY "Admin can manage quotes" ON public.quotes FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 3. Create applications table if not exists
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type text NOT NULL DEFAULT 'genel',
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'applications' AND policyname = 'Public can submit applications') THEN
    CREATE POLICY "Public can submit applications" ON public.applications FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'applications' AND policyname = 'Admin can manage applications') THEN
    CREATE POLICY "Admin can manage applications" ON public.applications FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Done!
SELECT 'Migration complete' as status;
`.trim()

  return NextResponse.json({ sql })
}
