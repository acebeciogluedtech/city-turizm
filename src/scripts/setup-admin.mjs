// Setup script that creates the page_content table using Supabase Management API
const PROJECT_REF = 'doqpxhxaeuyibyxpheru'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvcXB4aHhhZXV5aWJ5eHBoZXJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3ODM5MCwiZXhwIjoyMDkxOTU0MzkwfQ.dgiQE79RxaSsb5Cs8X5K3jnLi3Y8P_OMcm-IJNnnN6o'
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`

async function createTable() {
  console.log('📦 Attempting to create page_content table...\n')

  // Method: Use the PostgREST schema auto-detection
  // First, try inserting a dummy record. If table doesn't exist, it'll fail.
  // If it does, we can upsert.

  // Actually, let's use the supabase-js library approach - import dynamically
  const { createClient } = await import('@supabase/supabase-js')
  
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' }
  })

  // Check if table exists
  const { data, error } = await supabase.from('page_content').select('id').limit(1)
  
  if (error && error.code === '42P01') {
    console.log('❌ Table does not exist.')
    console.log('\n📋 Please run this SQL in the Supabase Dashboard SQL Editor:')
    console.log('   Go to: https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new')
    console.log(`
------- COPY BELOW -------

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

CREATE POLICY "service_role_full_access" ON public.page_content
  FOR ALL USING (true) WITH CHECK (true);

------- COPY ABOVE -------
    `)
  } else if (error) {
    console.log('❌ Error:', error.message)
  } else {
    console.log('✅ page_content table exists and is accessible!')
    console.log('   Current rows:', data?.length ?? 0)
  }

  // Test the admin user login
  console.log('\n🔐 Testing admin login...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@cityturizm.com',
    password: 'City.T**0101',
  })
  
  if (authError) {
    console.log('❌ Login failed:', authError.message)
  } else {
    console.log('✅ Admin login successful!')
    console.log('   User ID:', authData.user?.id)
    console.log('   Email:', authData.user?.email)
  }

  // Check media bucket
  console.log('\n🪣 Checking media bucket...')
  const { data: buckets } = await supabase.storage.listBuckets()
  const mediaExists = buckets?.some(b => b.name === 'media')
  console.log(mediaExists ? '✅ Media bucket exists' : '❌ Media bucket not found')
}

createTable().catch(console.error)
