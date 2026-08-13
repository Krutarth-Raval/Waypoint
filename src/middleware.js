import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

// Define paths that do not require authentication
const publicPaths = ['/login', '/', '/revert-email', '/privacy', '/terms', '/contact', '/manifest.webmanifest', '/manifest.json'];
const publicApiPaths = ['/api/auth/login', '/api/auth/verify'];

const allowedOrigins = ['exp://127.0.0.1:8081', 'exp://localhost:8081']; // Update with actual origins if needed

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  
  const isPublicPath = publicPaths.some(p => path === p || path.startsWith(p + '/'));
  const isPublicApiPath = publicApiPaths.some(p => path === p || path.startsWith(p + '/'));
  const isApiRoute = path.startsWith('/api/');
  
  // Get the token from cookies
  const session = request.cookies.get('session')?.value;
  const parsed = session ? await decrypt(session) : null;
  const isAuthenticated = !!parsed?.userId;

  const response = NextResponse.next();

  // Add CORS headers to actual API responses
  if (isApiRoute) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // If attempting to access a protected API route
  if (isApiRoute && !isPublicApiPath && !isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // If attempting to access a protected web route without being authenticated
  if (!isApiRoute && !isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url)); // Send unauthenticated to landing page instead of /login directly
  }

  // If attempting to access /login while already authenticated
  if (path === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

// Config to specify which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .png, .jpg, .svg (images)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
