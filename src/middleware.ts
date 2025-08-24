import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/access-denied') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname === '/menu.json' ||
    pathname === '/data_dashboard.json' ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.startsWith('/image/')
  ) {
    return NextResponse.next();
  }

  if (pathname === '/login') {
    if (!token) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  if (pathname === '/register') {
    if (!token) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  if (pathname === '/') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|image).*)'],
};
