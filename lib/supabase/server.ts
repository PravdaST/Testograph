/**
 * Server-side Supabase Client
 * For use in API routes, server components, and server actions
 * Uses cookies to maintain user session
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Create a Supabase server client with cookie support OR Bearer token
 *
 * If Authorization header is present (admin API routes), use direct client with token
 * Otherwise use cookie-based SSR client (server components)
 */
export async function createClient() {
  const headersList = await headers();
  const authorization = headersList.get('authorization');

  console.log('[createClient] Authorization header:', authorization ? 'present' : 'missing');

  // For admin API routes with Bearer token, use direct client
  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.replace('Bearer ', '');
    console.log('[createClient] Using direct client with Bearer token');

    return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authorization
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }

  // For server components, use cookie-based SSR client
  console.log('[createClient] Using cookie-based SSR client');
  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
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
