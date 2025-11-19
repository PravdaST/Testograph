import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * Admin Proxy - Protects /admin routes
 *
 * Uses @supabase/ssr to properly check authentication with server-side cookies
 * Verifies both session existence AND admin_users table membership
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // Refresh session for all routes (critical for OAuth flows)
    await supabase.auth.getUser();

    // Only enforce admin auth for /admin routes (except login page)
    const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin' && pathname !== '/admin/';

    if (isAdminRoute) {
      // Check if user has a valid session
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        // No valid user - redirect to login
        const loginUrl = new URL('/admin', request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Check if user is an admin
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!adminData) {
        // Not an admin - redirect to login
        const loginUrl = new URL('/admin', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    return response;

  } catch (error) {
    console.error('Proxy error:', error);

    // Only redirect to login for /admin routes
    if (pathname.startsWith('/admin') && pathname !== '/admin' && pathname !== '/admin/') {
      const loginUrl = new URL('/admin', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // For other routes, just continue
    return NextResponse.next();
  }
}

/**
 * Matcher configuration - which routes this proxy applies to
 *
 * Applies to ALL routes to ensure Supabase session cookies are refreshed
 * This is critical for OAuth flows (like GSC connection) where session
 * persistence across redirects is essential
 *
 * Admin protection is still handled by AdminLayout (client-side)
 * but this proxy ensures session cookies stay fresh for API routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
