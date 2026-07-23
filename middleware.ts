import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const role = request.cookies.get('respos-role')?.value
  const { pathname } = request.nextUrl

  if (!role && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (role === 'KITCHEN' && pathname !== '/kitchen') {
    return NextResponse.redirect(new URL('/kitchen', request.url))
  }
  
  if (role === 'WAITER' && pathname === '/kitchen') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
}