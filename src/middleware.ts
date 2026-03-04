import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('strava_session')

  const { pathname } = request.nextUrl
  if (!session && (pathname.startsWith('/dashboard') || pathname.startsWith('/settings'))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings'],
}
