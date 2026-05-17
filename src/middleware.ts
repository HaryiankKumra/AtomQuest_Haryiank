import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/seed'];
const ADMIN_PATHS = ['/admin'];
const MANAGER_PATHS = ['/manager'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths and Next.js internals
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Read auth cookie
  const authCookie = req.cookies.get('gstp-auth');
  let user: { role: string; access_token: string } | null = null;

  if (authCookie) {
    try {
      const state = JSON.parse(decodeURIComponent(authCookie.value));
      user = state?.state?.user || state?.user || null;
    } catch {}
  }

  // Not authenticated → redirect to login
  if (!user?.access_token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Role-based path protection
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && user.role !== 'admin') {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  if (MANAGER_PATHS.some((p) => pathname.startsWith(p)) &&
    !['manager', 'admin'].includes(user.role)) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
