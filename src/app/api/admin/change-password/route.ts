import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/admin/change-password
export async function POST(req: Request) {
  try {
    const { newPassword } = await req.json()
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Sifre en az 8 karakter olmalidir.' }, { status: 400 })
    }

    // Get current user list (service role can update any user)
    const { data: users, error: listErr } = await supabase.auth.admin.listUsers()
    if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 })

    // Update first admin user (or could pass userId in body)
    const adminUser = users.users?.[0]
    if (!adminUser) return NextResponse.json({ error: 'Kullanici bulunamadi.' }, { status: 404 })

    const { error } = await supabase.auth.admin.updateUserById(adminUser.id, { password: newPassword })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
