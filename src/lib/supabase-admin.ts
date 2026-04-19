import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with Service Role Key
// ⚠️ NEVER use this on the client side — bypasses RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
