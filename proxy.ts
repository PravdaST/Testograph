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

  // Allow access to the login page itself
  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.next();
  }

  // For all other /admin/* routes, check authentication
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

    // Check if user has a valid session
    // Use getUser() instead of getSession() to verify authenticity with Supabase server
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

    return response;

  } catch (error) {
    console.error('Proxy auth error:', error);

    // On error, redirect to login for safety
    const loginUrl = new URL('/admin', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

/**
 * Matcher configuration - which routes this middleware applies to
 *
 * Protects all /admin/* routes except /admin (login page)
 */
export const config = {
  matcher: [
    '/admin/:path+',
  ],
};
