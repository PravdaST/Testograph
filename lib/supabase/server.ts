/**
 * Server-side Supabase Client
 * For use in API routes, server components, and server actions
 * Uses cookies to maintain user session
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Create a Supabase server client with cookie support
 * This maintains user authentication state via cookies OR Authorization header
 *
 * For admin API routes:
 * - Client-side uses localStorage for sessions
 * - Requests include Authorization: Bearer <token> header
 * - This function checks Authorization header first, then falls back to cookies
 */
export async function createClient() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const authorization = headersList.get('authorization');

  console.log('[createClient] Authorization header:', authorization ? 'present' : 'missing');
  console.log('[createClient] Setting global headers:', authorization ? { authorization: 'Bearer ***' } : {});

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        headers: authorization ? { authorization } : {},
      },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
