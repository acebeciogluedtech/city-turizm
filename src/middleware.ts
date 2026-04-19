import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Routes that don't require authentication
const PUBLIC_PATHS = ['/admin', '/api/admin/auth']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin/* routes
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  // Allow public admin paths (login page and auth API)
  if (PUBLIC_PATHS.some(p => pathname === p)) return NextResponse.next()

  // Get token from HTTP-only cookie
  const token = request.cookies.get('admin_token')?.value

  if (!token) {
    // No token — redirect to login
    const loginUrl = new URL('/admin', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify the token is valid by checking with Supabase
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      // Invalid token — clear cookie and redirect to login
      const loginUrl = new URL('/admin', request.url)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.set('admin_token', '', { maxAge: 0, path: '/' })
      return response
    }

    // Valid — allow request through
    return NextResponse.next()
  } catch {
    // Error verifying — redirect to login
    const loginUrl = new URL('/admin', request.url)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}
