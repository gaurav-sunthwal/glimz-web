import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Get cookies from the request
  const authToken = request.cookies.get('auth_token');
  const uuid = request.cookies.get('uuid');
  
  // Check if user is authenticated
  const isAuthenticated = authToken && uuid;
  
  console.log('🛡️ Middleware check:', {
    path,
    hasAuthToken: !!authToken,
    hasUuid: !!uuid,
    isAuthenticated
  });
  
  // Protected routes that require authentication
  const protectedRoutes = ['/profile', '/my-list'];
  
  // Auth routes that should redirect to home if already authenticated
  const authRoutes = ['/login', '/signup'];
  
  // If user is on a protected route and not authenticated, redirect to login
  if (protectedRoutes.some(route => path.startsWith(route)) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If user is on an auth route and already authenticated, redirect to home
  if (authRoutes.some(route => path.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
