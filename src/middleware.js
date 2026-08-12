import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

// Define paths that do not require authentication
const publicPaths = ['/login', '/', '/revert-email', '/privacy', '/terms', '/contact', '/manifest.webmanifest', '/manifest.json'];

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  const isPublicPath = publicPaths.some(p => path === p || path.startsWith(p + '/'));
  
  // Get the token from cookies
  const session = request.cookies.get('session')?.value;
  const parsed = session ? await decrypt(session) : null;
  const isAuthenticated = !!parsed?.userId;

  // If attempting to access a protected route without being authenticated
  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url)); // Send unauthenticated to landing page instead of /login directly
  }

  // If attempting to access /login while already authenticated
  if (path === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Config to specify which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .png, .jpg, .svg (images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
