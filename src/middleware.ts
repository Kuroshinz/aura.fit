import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // App uses localStorage-based auth (client-side only via account-db.ts)
  // Auth protection is handled client-side by redirecting to /login
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

