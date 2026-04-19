import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// One-time setup endpoint: creates admin user, page_content table, and media bucket
// POST /api/admin/setup
export async function POST() {
  const results: string[] = []

  try {
    // ── 1. Create page_content table ──
    const { error: tableError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS page_content (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          page_id text NOT NULL,
          section_id text NOT NULL,
          field_id text NOT NULL,
          tr text DEFAULT '',
          en text DEFAULT '',
          updated_at timestamptz DEFAULT now(),
          UNIQUE(page_id, section_id, field_id)
        );

        ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Authenticated users can manage page_content"
          ON page_content FOR ALL
          USING (true)
          WITH CHECK (true);
      `,
    })

    if (tableError) {
      // Try direct SQL via REST if rpc doesn't exist
      const { error: directError } = await supabaseAdmin.from('page_content').select('id').limit(1)
      if (directError?.code === '42P01') {
        // Table doesn't exist, create via raw fetch
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`
        results.push(`⚠️ Table creation via RPC failed: ${tableError.message}. Will create via SQL editor.`)
      } else if (!directError) {
        results.push('✅ page_content table already exists')
      } else {
        results.push(`⚠️ Table check: ${directError.message}`)
      }
    } else {
      results.push('✅ page_content table created')
    }

    // ── 2. Create newsletter_subscribers table ──
    const { error: nlErr } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          email text NOT NULL UNIQUE,
          subscribed_at timestamptz DEFAULT now(),
          active boolean DEFAULT true
        );
        ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
        DO $$ BEGIN
          CREATE POLICY "public_insert_newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
        DO $$ BEGIN
          CREATE POLICY "service_all_newsletter" ON newsletter_subscribers FOR ALL USING (true) WITH CHECK (true);
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
      `
    })
    if (nlErr) {
      const { error: nlTest } = await supabaseAdmin.from('newsletter_subscribers').select('id').limit(1)
      if (nlTest?.message?.includes('does not exist') || nlTest?.code === '42P01') {
        results.push('❌ newsletter_subscribers: TABLE DOES NOT EXIST - Run SQL from supabase-schema.sql')
      } else if (!nlTest) {
        results.push('✅ newsletter_subscribers table already exists')
      } else {
        results.push(`⚠️ newsletter_subscribers: ${nlTest.message}`)
      }
    } else {
      results.push('✅ newsletter_subscribers table created')
    }

    // ── 3. Create contact_messages table ──
    const { error: cmErr } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS contact_messages (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          name text NOT NULL,
          email text NOT NULL,
          phone text DEFAULT '',
          message text NOT NULL,
          source text DEFAULT 'contact',
          is_read boolean DEFAULT false,
          created_at timestamptz DEFAULT now()
        );
        ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
        DO $$ BEGIN
          CREATE POLICY "public_insert_messages" ON contact_messages FOR INSERT WITH CHECK (true);
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
        DO $$ BEGIN
          CREATE POLICY "service_all_messages" ON contact_messages FOR ALL USING (true) WITH CHECK (true);
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
      `
    })
    if (cmErr) {
      const { error: cmTest } = await supabaseAdmin.from('contact_messages').select('id').limit(1)
      if (cmTest?.message?.includes('does not exist') || cmTest?.code === '42P01') {
        results.push('❌ contact_messages: TABLE DOES NOT EXIST - Run SQL from supabase-schema.sql')
      } else if (!cmTest) {
        results.push('✅ contact_messages table already exists')
      } else {
        results.push(`⚠️ contact_messages: ${cmTest.message}`)
      }
    } else {
      results.push('✅ contact_messages table created')
    }

    // ── 4. Create admin user ──
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const adminExists = existingUsers?.users?.some(u => u.email === 'admin@cityturizm.com')

    if (adminExists) {
      results.push('✅ Admin user already exists')
    } else {
      const { data: newUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: 'admin@cityturizm.com',
        password: 'City.T**0101',
        email_confirm: true,
        user_metadata: { role: 'admin', name: 'Admin' },
      })

      if (userError) {
        results.push(`❌ Admin user creation failed: ${userError.message}`)
      } else {
        results.push(`✅ Admin user created: ${newUser.user.id}`)
      }
    }

    // ── 5. Create media storage bucket ──
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const mediaExists = buckets?.some(b => b.name === 'media')

    if (mediaExists) {
      results.push('✅ Media bucket already exists')
    } else {
      const { error: bucketError } = await supabaseAdmin.storage.createBucket('media', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'],
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
      })

      if (bucketError) {
        results.push(`❌ Media bucket creation failed: ${bucketError.message}`)
      } else {
        results.push('✅ Media bucket created (public, max 5MB)')
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, results }, { status: 500 })
  }
}

// GET — check table statuses
export async function GET() {
  const statuses: Record<string, string> = {}

  const tables = ['page_content', 'newsletter_subscribers', 'contact_messages']
  for (const t of tables) {
    const { error } = await supabaseAdmin.from(t).select('id').limit(1)
    if (error) {
      statuses[t] = `❌ ${error.message}`
    } else {
      statuses[t] = '✅ OK'
    }
  }

  return NextResponse.json({ statuses })
}
