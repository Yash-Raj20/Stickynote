import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/board')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If trying to access login/register while already authenticated
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') {
    if (token) {
      return NextResponse.redirect(new URL('/board', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/board/:path*', '/login', '/register'],
};
