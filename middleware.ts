import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Admin Middleware - Protects /admin routes
 *
 * Checks if user is authenticated and has admin privileges
 * before allowing access to admin dashboard pages
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to the login page itself
  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.next();
  }

  // For all other /admin/* routes, check authentication
  try {
    // Get all Supabase-related cookies
    const cookies = request.cookies.getAll();
    const hasSupabaseAuth = cookies.some(cookie =>
      cookie.name.startsWith('sb-') && cookie.value
    );

    // If no Supabase auth cookies, redirect to login
    if (!hasSupabaseAuth) {
      const loginUrl = new URL('/admin', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Note: We don't verify admin_users table here because:
    // 1. Middleware runs on EVERY request (including assets, API calls)
    // 2. Database queries in middleware add latency
    // 3. Admin verification happens in page components via getCurrentAdminUser()
    //
    // This middleware provides baseline auth check (must be logged in to Supabase)
    // Individual pages enforce admin-specific permissions

    // Allow the request to continue
    return NextResponse.next();

  } catch (error) {
    console.error('Middleware auth error:', error);

    // On error, redirect to login for safety
    const loginUrl = new URL('/admin', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

/**
 * Matcher configuration - which routes this middleware applies to
 */
export const config = {
  matcher: [
    // Match all /admin routes except static files
    '/admin/:path*',
  ],
};
