import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = ['/profile', '/orders', '/settings', '/addresses'];
const ADMIN_ROUTES = ['/admin'];
const AUTH_ROUTES = ['/sign-in', '/sign-up', '/forgot-password'];

function getRolesFromToken(token: string): string[] {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return decoded.roles ?? [];
  } catch {
    return [];
  }
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessCookie = request.cookies.get('access_token');

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAdminRoute = ADMIN_ROUTES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  if (!accessCookie && (isProtected || isAdminRoute)) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (accessCookie && isAdminRoute) {
    const roles = getRolesFromToken(accessCookie.value);
    if (!roles.includes('ADMIN') && !roles.includes('SUPER_ADMIN')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (accessCookie && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
};
